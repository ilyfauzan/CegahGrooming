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

  const parseTextContent = (rawContent: string): string[] => {
    return rawContent
      .split(/\n/)
      .map((line) => {
        // Hapus timestamp WhatsApp (misal: [14/05/26 12.00.00] atau format tanpa kurung siku)
        let clean = line.replace(
          /^\[?\d{2}\/\d{2}\/\d{2,4}[, ]\s?\d{2}[.:]\d{2}(?:[.:]\d{2})?\]?\s*/,
          ""
        );
        // Hapus nama pengirim (format "Nama: pesan")
        if (clean.includes(": ")) clean = clean.split(": ").slice(1).join(": ");

        // Filter system messages
        const systemMessages = [
          "pesan dan panggilan terenkripsi",
          "image omitted",
          "sticker omitted",
          "video omitted",
          "audio omitted",
          "pesan ini dihapus",
          "https://",
          "http://",
          "www.",
        ];
        const isSystem = systemMessages.some((msg) =>
          clean.toLowerCase().includes(msg)
        );
        if (isSystem) return "";

        // Bersihkan tanda petik di awal/akhir dan koma
        clean = clean.trim();
        clean = clean.replace(/^["']+/, "");
        clean = clean.replace(/["']+$/, "");
        clean = clean.replace(/,\s*$/, "");
        return clean.trim();
      })
      .filter((line) => line !== "");
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) return;

      const lines = parseTextContent(text);

      if (lines.length > 0) {
        setMessages(lines);
      }
    } catch (err) {
      alert("Gagal membaca clipboard. Pastikan izin diberikan.");
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = parseTextContent(text);
      if (lines.length > 0) {
        setMessages(lines);
      }
    };
    reader.readAsText(file);

    // Reset file input agar bisa upload file yang sama lagi
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAnalyze = () => {
    const filteredMessages = messages.map(m => m.trim()).filter(m => m.length > 0);
    if (filteredMessages.length < 2) return;
    onAnalyze(filteredMessages);
  };

  const activeMessages = messages.filter(m => m.trim()).length;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between px-2">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handlePaste}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 text-[10px] font-black tracking-widest hover:bg-blue-500/20 transition-all uppercase"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Tempel Chat
          </button>
          
          <label className="flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-xl text-violet-400 text-[10px] font-black tracking-widest hover:bg-violet-500/20 transition-all uppercase cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload File
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>

          <button
            onClick={clearAll}
            className="px-4 py-2 text-slate-500 text-[10px] font-black tracking-widest hover:text-red-400 transition-all uppercase"
          >
            Bersihkan
          </button>
        </div>
        <div className={`text-[10px] font-black uppercase tracking-widest transition-colors ${activeMessages < 2 ? 'text-amber-500' : 'text-emerald-500'}`}>
          {activeMessages} Pesan Terisi
        </div>
      </div>

      {/* Chat Container */}
      <div
        ref={scrollRef}
        className="relative bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-6 h-[400px] overflow-y-auto space-y-4 scroll-smooth custom-scrollbar"
      >
        {messages.map((msg, idx) => (
          <div key={idx} className="flex items-center gap-3 group animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex-1 relative flex items-center gap-2">
              <textarea
                value={msg}
                onChange={(e) => handleMessageChange(idx, e.target.value)}
                placeholder={`Pesan ke-${idx + 1}...`}
                rows={1}
                className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-2xl px-5 py-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none transition-all placeholder:text-slate-600 overflow-hidden appearance-none"
                style={{ height: 'auto', minHeight: '44px' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${target.scrollHeight}px`;
                }}
              />
              {/* Delete Button removed per user request */}
            </div>
          </div>
        ))}

        <button
          onClick={addMessage}
          className="w-full py-4 border-2 border-dashed border-slate-800 rounded-2xl text-slate-600 text-xs font-black tracking-widest hover:border-slate-700 hover:text-slate-400 transition-all flex items-center justify-center gap-2 uppercase"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Baris
        </button>
      </div>

      {/* Analyze Button */}
      <div className="pt-4 space-y-4">
        {activeMessages < 2 && (
          <div className="flex items-center justify-center gap-2 text-amber-500/80 animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-[10px] font-black uppercase tracking-widest">
              Tambahkan minimal 2 pesan untuk memulai analisis
            </p>
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={isLoading || activeMessages < 2}
          className={`w-full py-5 rounded-[2rem] font-black tracking-[0.2em] uppercase text-sm transition-all shadow-2xl ${isLoading || activeMessages < 2
            ? "bg-slate-800 text-slate-600 cursor-not-allowed opacity-50"
            : "bg-blue-600 text-white shadow-blue-500/20 hover:scale-[1.02] hover:shadow-blue-500/40 active:scale-95"
            }`}
        >
          {isLoading ? "Sedang Menganalisis..." : "Mulai Deteksi"}
        </button>
      </div>
    </div>
  );
}
