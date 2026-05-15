"use client";
import { useState, useRef, useEffect } from "react";

interface ChatInputBuilderProps {
  onAnalyze: (lines: string[]) => void;
  isLoading: boolean;
}

export default function ChatInputBuilder({ onAnalyze, isLoading }: ChatInputBuilderProps) {
  const [messages, setMessages] = useState<string[]>(["", "", ""]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll ke bawah saat pesan bertambah
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const handleMessageChange = (index: number, value: string) => {
    const newMessages = [...messages];
    newMessages[index] = value;
    setMessages(newMessages);
  };

  const addMessage = () => {
    setMessages([...messages, ""]);
  };

  const removeMessage = (index: number) => {
    if (messages.length <= 1) {
      setMessages([""]);
      return;
    }
    const newMessages = messages.filter((_, i) => i !== index);
    setMessages(newMessages);
  };

  const clearAll = () => {
    if (confirm("Kosongkan semua pesan?")) {
      setMessages(["", "", ""]);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) return;

      // Bersihkan teks dan split berdasarkan baris
      const lines = text
        .split(/\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0);

      if (lines.length > 0) {
        setMessages(lines);
      }
    } catch (err) {
      alert("Gagal membaca clipboard. Pastikan izin diberikan.");
    }
  };

  const handleAnalyze = () => {
    const filteredMessages = messages.map(m => m.trim()).filter(m => m.length > 0);
    
    if (filteredMessages.length < 3) {
      alert("⚠️ Mohon masukkan minimal 3 pesan untuk deteksi yang akurat dan menghindari False Positive.");
      return;
    }
    
    onAnalyze(filteredMessages);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between px-2">
        <div className="flex gap-2">
          <button
            onClick={handlePaste}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 text-xs font-bold hover:bg-blue-500/20 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            TEMPEL LOG CHAT
          </button>
          <button
            onClick={clearAll}
            className="px-4 py-2 text-slate-500 text-xs font-bold hover:text-red-400 transition-all"
          >
            BERSIHKAN
          </button>
        </div>
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
          {messages.filter(m => m.trim()).length} PESAN TERISI
        </div>
      </div>

      {/* Chat Container */}
      <div 
        ref={scrollRef}
        className="relative bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-6 h-[400px] overflow-y-auto space-y-4 scroll-smooth custom-scrollbar"
      >
        {messages.map((msg, idx) => (
          <div key={idx} className="flex items-start gap-3 group animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex-1 relative">
              <textarea
                value={msg}
                onChange={(e) => handleMessageChange(idx, e.target.value)}
                placeholder={`Pesan ke-${idx + 1}...`}
                rows={1}
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl px-5 py-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none transition-all placeholder:text-slate-600"
                style={{ height: 'auto', minHeight: '44px' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${target.scrollHeight}px`;
                }}
              />
              {/* Delete Button */}
              <button
                onClick={() => removeMessage(idx)}
                className="absolute -right-2 -top-2 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-500 hover:text-red-400 hover:border-red-400/50 opacity-0 group-hover:opacity-100 transition-all shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={addMessage}
          className="w-full py-4 border-2 border-dashed border-slate-800 rounded-2xl text-slate-600 text-xs font-bold hover:border-slate-700 hover:text-slate-400 transition-all flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          TAMBAH PESAN MANUAL
        </button>
      </div>

      {/* Analyze Button */}
      <div className="pt-4">
        <button
          onClick={handleAnalyze}
          disabled={isLoading}
          className={`w-full py-5 rounded-[2rem] font-black tracking-[0.2em] uppercase text-sm transition-all shadow-2xl ${
            isLoading 
              ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
              : "bg-blue-600 text-white shadow-blue-500/20 hover:scale-[1.02] hover:shadow-blue-500/40 active:scale-95"
          }`}
        >
          {isLoading ? "Sedang Menganalisis..." : "Mulai Deteksi Grooming"}
        </button>
        <p className="text-center mt-4 text-slate-500 text-[10px] uppercase font-bold tracking-widest opacity-60">
          Sistem membutuhkan konteks percakapan untuk menghindari kesalahan deteksi
        </p>
      </div>
    </div>
  );
}
