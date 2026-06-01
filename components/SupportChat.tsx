import React, { useState, useEffect, useRef } from 'react';
import { getSupportChatResponse } from '../services/geminiService';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'agent';
    timestamp: Date;
}

interface SupportChatProps {
    onClose: () => void;
}

const SupportChat: React.FC<SupportChatProps> = ({ onClose }) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Hello! I'm your SmartSure assistant. How can I help you today?",
            sender: 'agent',
            timestamp: new Date()
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputText.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsTyping(true);

        // Realistic Gemini AI Support Chat
        try {
            const aiResponse = await getSupportChatResponse([...messages, userMsg]);

            const agentMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: aiResponse,
                sender: 'agent',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, agentMsg]);
        } catch (error) {
            console.error("Chat AI error:", error);
            const fallbackMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: "I'm experiencing a temporary connection issue. How else can I assist you?",
                sender: 'agent',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, fallbackMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    const startListening = () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.lang = 'en-US';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            recognition.start();

            recognition.onresult = (event: any) => {
                const speechResult = event.results[0][0].transcript;
                setInputText(speechResult);
                // Auto-send logic could go here
            };

            recognition.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                alert("Voice verification failed. Please check microphone permissions.");
            };
        } else {
            alert("Voice features are not supported in this browser.");
        }
    };

    return (
        <div className="fixed bottom-28 right-8 w-96 max-w-[calc(100vw-4rem)] h-[500px] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden z-[60] animate-in slide-in-from-bottom-5 duration-300">
            {/* Header */}
            <div className="bg-indigo-700 p-4 flex justify-between items-center text-white">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center font-bold relative">
                        SS
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-indigo-700 rounded-full animate-pulse"></span>
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">Smart Support</h3>
                        <p className="text-[10px] text-indigo-200">Online • Voice Active</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-indigo-600 rounded-lg transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 bg-slate-50 p-4 overflow-y-auto space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${msg.sender === 'user'
                            ? 'bg-indigo-600 text-white rounded-tr-none'
                            : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-none'
                            }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 flex gap-1">
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex gap-2">
                <button
                    type="button"
                    onClick={startListening}
                    className="bg-slate-100 text-slate-600 p-2 rounded-xl hover:bg-slate-200 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                </button>
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type or speak..."
                    className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
            </form>
        </div>
    );
};

export default SupportChat;
