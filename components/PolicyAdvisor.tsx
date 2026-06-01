
import React, { useState, useCallback } from 'react';
import { askPolicyAdvisor } from '../services/geminiService';
import { INSURANCE_PROVIDERS } from '../constants';
import { Language } from '../types';

const PolicyAdvisor: React.FC<{ selectedInsuranceId: string, lang: Language }> = ({ selectedInsuranceId, lang }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Always use the selected insurance provider's name for Gemini search
  const providerName = INSURANCE_PROVIDERS.find(p => p.id === selectedInsuranceId)?.name || "General";

  const handleAsk = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    const res = await askPolicyAdvisor(query, providerName, lang);
    setResponse(res);
    setLoading(false);
  };

  const startVoice = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice search not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'en' ? 'en-KE' : 'sw-KE';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
    };
    recognition.start();
  }, [lang]);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            {lang === 'en' ? 'SmartSure Policy Advisor' : 'Mshauri wa SmartSure'}
          </h2>
          <p className="text-sm text-slate-500">
            {lang === 'en' ? 'AI Benefit Clarification' : 'Ufafanuzi wa AI kuhusu manufaa'}
          </p>
        </div>
      </div>

      <form onSubmit={handleAsk} className="mb-6 space-y-4">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={lang === 'en' ? "e.g., 'Is dental covered?'" : "k.m., 'Je, meno yamefunikwa?'"}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all pr-32"
          />
          <div className="absolute right-2 top-2 bottom-2 flex gap-1">
            <button
              type="button"
              onClick={startVoice}
              className={`p-2 rounded-lg transition-colors ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white px-4 rounded-lg text-xs font-bold hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? (lang === 'en' ? "..." : "...") : (lang === 'en' ? "Ask" : "Uliza")}
            </button>
          </div>
        </div>
      </form>

      {response && (
        <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100 animate-in fade-in duration-500">
          <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">{response}</p>
        </div>
      )}
    </div>
  );
};

export default PolicyAdvisor;
