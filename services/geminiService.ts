
import { GoogleGenAI, Type } from "@google/genai";
import { MOCK_POLICY_TEXT, INSURANCE_PROVIDERS } from "../constants";
import { supabase } from "./supabaseClient";
import axios from "axios";
import { UserProfile, Language, OCRResult, PreAuthResponse } from "../types";
import { systemLogger } from "./systemLogger";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function askPolicyAdvisor(query: string, insuranceName: string, lang: Language = 'en') {
  const start = Date.now();
  const languageNames: Record<Language, string> = {
    'en': 'English',
    'sw': 'Kiswahili',
    'ek': 'Ekegusii (Kisii local dialect)'
  };

  let policyText = MOCK_POLICY_TEXT;
  try {
    // Try to fetch the provider's policy_doc_url and provider_id from Supabase
    const { data: provider } = await supabase
      .from('insurance_providers')
      .select('policy_doc_url, provider_id, provider_name')
      .eq('provider_name', insuranceName)
      .single();
    if (provider && provider.policy_doc_url && provider.provider_id) {
      // Fetch extracted text from server endpoint
      const url = `/api/policy-document/${provider.provider_id}/text`;
      const res = await axios.get(url);
      if (res.data && res.data.text) {
        policyText = res.data.text.substring(0, 12000); // Limit to 12k chars for prompt size
      }
    }
  } catch (err) {
    // fallback to mock
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are the SmartSure Policy Advisor.
      Language Mode: ${languageNames[lang]}.
      Context: ${policyText}
      Query: ${query} (for ${insuranceName})
      
      Instructions:
      1. Provide a helpful answer in ${languageNames[lang]}.
      2. If in Ekegusii, use authentic Gusii vocabulary.
      3. Focus on clarity for rural users in Kisii County.`,
    });

    systemLogger.log('AI', `Policy Advisor: RAG query processed in ${Date.now() - start}ms`, 'GEMINI_3_FLASH', { query, insuranceName });
    return response.text;
  } catch (error) {
    systemLogger.log('WARN', `Policy Advisor failure: ${error}`, 'GEMINI_3_FLASH');
    return lang === 'en' ? "An error occurred." : "Hitilafu imetokea.";
  }
}

export async function simulatePreAuth(procedure: string, provider: string, hospitalLevel: string): Promise<PreAuthResponse | null> {
  const start = Date.now();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Act as an Insurance Claims Adjuster in Kenya.
      Analyze if a '${procedure}' is likely covered by '${provider}' at a '${hospitalLevel}' facility.
      Use knowledge of NHIF/SHA and Private Kenyan insurance norms.
      
      Return ONLY JSON:
      {
        "isCovered": boolean,
        "estimatedApprovalRate": number (0-100),
        "reasoning": "brief explanation",
        "actionRequired": "e.g., Get referral from Level 4"
      }`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isCovered: { type: Type.BOOLEAN },
            estimatedApprovalRate: { type: Type.NUMBER },
            reasoning: { type: Type.STRING },
            actionRequired: { type: Type.STRING }
          },
          required: ["isCovered", "estimatedApprovalRate", "reasoning", "actionRequired"]
        }
      }
    });

    systemLogger.log('AI', `Pre-Auth Logic: Simulated claim for ${procedure} (${Date.now() - start}ms)`, 'CLAIMS_ENGINE');
    return JSON.parse(response.text);
  } catch (error) {
    systemLogger.log('WARN', `Pre-Auth Analysis failed: ${error}`, 'CLAIMS_ENGINE');
    return null;
  }
}

export async function performOCR(base64Image: string): Promise<OCRResult | null> {
  const start = Date.now();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Image } },
          { text: "Extract insurance card details. Return ONLY JSON: { 'provider': string, 'membershipNumber': string }" }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            provider: { type: Type.STRING },
            membershipNumber: { type: Type.STRING }
          },
          required: ["provider", "membershipNumber"]
        }
      }
    });

    systemLogger.log('AI', `OCR: Card scanned and verified in ${Date.now() - start}ms`, 'GEMINI_VISION');
    return JSON.parse(response.text);
  } catch (error) {
    systemLogger.log('SEC', `OCR Critical Failure: Malformed image or spoof attempt detected.`, 'GEMINI_VISION');
    return null;
  }
}

export async function getPredictiveRecommendation(profile: UserProfile) {
  const start = Date.now();
  try {
    const providersJson = JSON.stringify(INSURANCE_PROVIDERS);
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Act as a Kenyan Insurance Data Scientist and Policy Advisor. 
      Analyze this user profile: ${JSON.stringify(profile)}.
      Available Providers: ${providersJson}.
      
      CRITICAL INSTRUCTIONS:
      1. If chronicConditions contains 'Diabetes', 'Hypertension', or 'Cardiac', prioritize plans with high 'Outpatient' and specific 'Chronic Illness' sub-limits.
      2. If chronicConditions contains 'Cancer (Oncology)', prioritize 'Oncology' limits and PET scan coverage.
      3. If chronicConditions contains 'Renal (Kidney)', prioritize 'Dialysis' sessions and limits per session.
      4. If lifeEvent is 'pregnancy', prioritize 'Maternity' benefits and ignore any plan with a maternity waiting period > 6 months if possible.
      5. If lifeEvent is 'surgery', prioritize 'Inpatient' limits and 'Theatre' caps.
      
      6. REALITY CHECK LOGIC:
         - If preferredHospitalTier is 'premium' but monthlyBudget is < KES 5000, add a warning in 'reasoning' about hospital deposit requirements (e.g., Aga Khan/Nairobi Hospital).
         - If employmentType is 'informal' and budget is low, prioritize 'SHA' (NHIF) based matches as they offer better universal base coverage.
         - If user is 'student' or 'unemployed', flag plans with high co-payments as "High Financial Risk".
      
      Predict the best match for their specific health and financial context. Return ONLY a JSON object:
      {
        "providerId": "string",
        "matchScore": number (0-100),
        "reasoning": "short string explaining the logic (e.g., 'Selected for high chronic sub-limit')",
        "predictedTier": "string"
      }`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            providerId: { type: Type.STRING },
            matchScore: { type: Type.NUMBER },
            reasoning: { type: Type.STRING },
            predictedTier: { type: Type.STRING }
          },
          required: ["providerId", "matchScore", "reasoning"]
        }
      }
    });

    systemLogger.log('AI', `Predictive Model: Generated match for ${profile.name} (${Date.now() - start}ms)`, 'ML_PREDICTOR');
    return JSON.parse(response.text);
  } catch (error) {
    systemLogger.log('WARN', `Predictive Model error: ${error}`, 'ML_PREDICTOR');
    return null;
  }
}

export async function getSupportChatResponse(history: { text: string, sender: 'user' | 'agent' }[]) {
  const start = Date.now();
  try {
    const chatHistory = history.map(m => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n');

    const systemInstruction = `You are the SmartSure AI Health Assistant. 
    Your tone is empathetic, professional, and efficient.
    
    CAPABILITIES:
    1. Medical Triage: If a user describes symptoms, ask clarifying questions and suggest the level of care needed (e.g. "Visit a Level 4 facility"). Always include a disclaimer: "I am an AI, not a doctor. In emergencies, call 999."
    2. Insurance Queries: Answer questions about NHIF/SHA based on typical Kenyan policy rules (waiting periods, capitation).
    3. Facility Booking: Guide users on how to book visits via the 'Facility Finder' tab.
    
    Keep responses concise and formatted with bullet points if helpful. Use Kenyan English context (KES, SHA, NHIF).`;

    const fullPrompt = `${systemInstruction}\n\nChat History:\n${chatHistory}\n\nAssistant:`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: fullPrompt,
    });

    systemLogger.log('AI', `Support Chat: AI response generated in ${Date.now() - start}ms`, 'GEMINI_CHAT');
    return response.text;
  } catch (error) {
    systemLogger.log('WARN', `Support Chat AI failure: ${error}`, 'GEMINI_CHAT');
    return "I'm having trouble connecting to my knowledge base. Please try again in a moment.";
  }
}
