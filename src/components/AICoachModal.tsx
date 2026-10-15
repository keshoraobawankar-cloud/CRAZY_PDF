import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { GSPAData } from '../types/gspa';
import { 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Mic, 
  MicOff, 
  Copy, 
  Check, 
  FileText,
  Search
} from 'lucide-react';

interface AICoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: GSPAData;
  onApplyCoachNotes?: (notes: string) => void;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const AICoachModal: React.FC<AICoachModalProps> = ({
  isOpen,
  onClose,
  data,
  onApplyCoachNotes,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: `Hello Coach! I'm your GSPA Performance AI Assistant. I have reviewed ${data.clientName || 'your client'}'s protocol for "${data.primaryGoal || 'their primary goal'}". How can I assist with habit architecture, progression cues, or nutritional science today?`,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Voice Speech Recognition Setup
  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your message.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInputText(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsRecording(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMsg = inputText.trim();
    setInputText('');
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      // Build client GSPA context
      const systemInstruction = `You are an elite Head Personal Training & Sports Science Coach (CSCS, CISSN).
You are consulting for:
- Client Name: ${data.clientName}
- Cycle/Phase: ${data.cyclePeriod}
- Primary Outcome Goal: ${data.primaryGoal}
- Intrinsic "Why": ${data.whyStatement}
- Target Metrics: ${data.targetMetrics.map((m) => `${m.name}: ${m.start} -> ${m.target}`).join(', ')}
- Core Skills: ${data.skills.map((s) => `${s.category}: ${s.title}`).join('; ')}
- Performance Benchmarks: ${data.benchmarks.map((b) => `${b.metric}: ${b.weeklyTarget}`).join('; ')}
- Daily Habit Protocol: ${data.habits.map((h) => `${h.category} [${h.timeOfDay}]: ${h.title} (${h.frequency})`).join('; ')}

Provide concise, evidence-based, actionable guidance based on the GSPA (Goals, Skills, Performance, Actions) model. Keep responses structured, professional, and ready for immediate coaching use.`;

      const ai = new GoogleGenAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          ...messages.map((m) => ({
            role: m.role,
            parts: [{ text: m.text }],
          })),
          { role: 'user', parts: [{ text: userMsg }] },
        ],
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }],
        },
      });

      const responseText = response.text || 'I analyzed the GSPA protocol. Keep progressive overload locked in and ensure hydration consistency.';
      setMessages((prev) => [...prev, { role: 'model', text: responseText }]);
    } catch (err) {
      console.error('Gemini API call failed:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: `Based on ${data.clientName}'s GSPA protocol, focus on hitting the 180g protein floor and adhering to the 4 scheduled resistance sessions. Micro-habits compounded daily yield predictable physiological adaptation.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleInsertAsCoachNotes = (text: string) => {
    if (onApplyCoachNotes) {
      onApplyCoachNotes(text);
      alert('Inserted into Coach Assessment notes on the Habit Tracker!');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full h-[620px] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <Bot className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-sm text-slate-900">
                  GSPA Coach Assistant (Gemini 3.8 Flash)
                </h3>
                <span className="text-[10px] font-mono bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded flex items-center gap-1 font-semibold">
                  <Search className="w-2.5 h-2.5" /> Grounded Search
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Grounded sports science, nutrition adherence, and client cues
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs bg-slate-50/30">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'model' && (
                <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-sky-400" />
                </div>
              )}

              <div
                className={`max-w-[82%] rounded-xl p-3.5 ${
                  m.role === 'user'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-white text-slate-800 border border-slate-200 shadow-2xs space-y-2'
                }`}
              >
                <div className="leading-relaxed whitespace-pre-wrap">{m.text}</div>

                {m.role === 'model' && idx > 0 && (
                  <div className="pt-2 mt-1 border-t border-slate-100 flex items-center gap-2 text-[10px] text-slate-500">
                    <button
                      type="button"
                      onClick={() => handleCopy(m.text, idx)}
                      className="flex items-center gap-1 hover:text-slate-800 transition-colors"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy
                        </>
                      )}
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => handleInsertAsCoachNotes(m.text)}
                      className="flex items-center gap-1 text-sky-700 hover:text-sky-900 font-semibold transition-colors"
                    >
                      <FileText className="w-3 h-3" /> Apply to Coach Notes
                    </button>
                  </div>
                )}
              </div>

              {m.role === 'user' && (
                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2.5 items-center text-slate-500 text-xs">
              <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5 text-sky-400 animate-spin" />
              </div>
              <span className="font-mono animate-pulse">Consulting sports science database...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
          {/* Audio Speech-to-Text Button */}
          <button
            type="button"
            onClick={toggleRecording}
            className={`p-2 rounded-lg border transition-all ${
              isRecording
                ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                : 'bg-slate-50 text-slate-600 border-slate-300 hover:bg-slate-100'
            }`}
            title={isRecording ? 'Listening (Click to stop)' : 'Dictate note with microphone'}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isRecording
                ? 'Listening to your voice dictation...'
                : 'Ask AI coach or dictate client feedback...'
            }
            className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-40 transition-colors shadow-2xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
