"use client";
import { useEffect, useRef, useState } from "react";

export interface ChatBubbleItem {
  text: string;
  status: "NORMAL" | "WARNING" | "GROOMING";
  score: number;
  standalone_score: number;
  context_score: number;
  translated: string;
}

interface ChatBubbleListProps {
  items: ChatBubbleItem[];
  onAppend: () => void;
  onSendMessage: (text: string) => void;
  loading: boolean;
}

export default function ChatBubbleList({ items, onAppend, onSendMessage, loading }: ChatBubbleListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [inputText, setInputText] = useState("");

  // Auto-scroll ke bawah saat ada item baru
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [items]);

  const handleSend = () => {
    if (!inputText.trim() || loading) return;
    onSendMessage(inputText);
    setInputText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getStatusConfig = (status: string) => {
    if (status === "GROOMING") {
      return {
        borderColor: "border-red-500/60",
        bgColor: "bg-red-500/5",
        dotColor: "bg-red-500",
        labelColor: "text-red-400",
        labelBg: "bg-red-500/15",
        label: "GROOMING",
        emoji: "🔴",
      };
    }
    if (status === "WARNING") {
      return {
        borderColor: "border-yellow-500/50",
        bgColor: "bg-yellow-500/5",
        dotColor: "bg-yellow-500",
        labelColor: "text-yellow-400",
        labelBg: "bg-yellow-500/15",
        label: "WARNING",
        emoji: "🟡",
      };
    }
    return {
      borderColor: "border-slate-700/50",
      bgColor: "bg-slate-800/30",
      dotColor: "bg-blue-500",
      labelColor: "text-blue-400",
      labelBg: "bg-blue-500/15",
      label: "NORMAL",
      emoji: "🟢",
    };
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 md:p-5 border-b border-slate-700 bg-slate-800/80 rounded-t-3xl">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          <h3 className="text-sm font-bold text-slate-300">
            Log Percakapan
          </h3>
        </div>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          {items.length} pesan
        </span>
      </div>

      {/* Chat Area — Scroll Independen */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 scroll-smooth"
        style={{ maxHeight: "calc(70vh - 120px)" }}
      >
        {items.map((item, index) => {
          const config = getStatusConfig(item.status);
          const isExpanded = expandedIndex === index;

          return (
            <div
              key={index}
              onClick={() => setExpandedIndex(isExpanded ? null : index)}
              className={`relative rounded-2xl border-l-4 ${config.borderColor} ${config.bgColor} p-4 cursor-pointer hover:brightness-110 transition-all duration-300 group`}
            >
              {/* Bubble Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span className="text-[10px] font-black text-slate-600 mt-0.5 shrink-0">
                    #{index + 1}
                  </span>
                  <p className="text-sm text-slate-300 leading-relaxed break-words">
                    {item.text}
                  </p>
                </div>
                <span className={`shrink-0 px-2 py-0.5 rounded-lg text-[8px] font-black tracking-wider ${config.labelColor} ${config.labelBg}`}>
                  {config.label}
                </span>
              </div>

              {/* Detail Skor — Muncul saat diklik */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-2 animate-in fade-in duration-200">
                  {/* Standalone */}
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-500 font-bold uppercase tracking-wide">Standalone</span>
                    <span className="text-slate-400 font-mono">{(item.standalone_score * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all duration-700" style={{ width: `${item.standalone_score * 100}%` }} />
                  </div>

                  {/* Context */}
                  <div className="flex items-center justify-between text-[10px] mt-1">
                    <span className="text-slate-500 font-bold uppercase tracking-wide">Context (Window)</span>
                    <span className="text-slate-400 font-mono">{(item.context_score * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full transition-all duration-700" style={{ width: `${item.context_score * 100}%` }} />
                  </div>

                  {/* Final Hybrid */}
                  <div className="flex items-center justify-between text-[10px] mt-1">
                    <span className="text-slate-500 font-bold uppercase tracking-wide">Hybrid Score</span>
                    <span className={`font-mono font-black ${config.labelColor}`}>{(item.score * 100).toFixed(1)}%</span>
                  </div>


                </div>
              )}

              {/* Hint klik */}
              {!isExpanded && (
                <p className="text-[9px] text-slate-600 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  Klik untuk lihat detail skor →
                </p>
              )}
            </div>
          );
        })}

        {/* Loading indicator saat processing */}
        {loading && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/30 animate-pulse">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "0.1s" }} />
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "0.2s" }} />
            <span className="text-xs text-slate-500">Menganalisis...</span>
          </div>
        )}
      </div>

      {/* Footer — Input Bar & Tambah Pesan (Hanya muncul jika TIDAK sedang loading) */}
      {!loading && (
        <div className="p-4 bg-slate-800/40 border-t border-slate-700/50 rounded-b-3xl">
          <div className="flex items-end gap-2 bg-slate-900/80 border border-slate-700/50 rounded-2xl p-2 focus-within:border-blue-500/50 transition-all shadow-inner">
            <button
              onClick={onAppend}
              disabled={loading}
              title="Tempel dari Clipboard"
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-blue-400 transition-all active:scale-95 disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </button>
            
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ketik pesan untuk memancing respons..."
              rows={1}
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-slate-200 py-2 px-1 resize-none overflow-hidden max-h-32 placeholder:text-slate-600 appearance-none"
              style={{ height: '40px' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = '40px';
                target.style.height = `${target.scrollHeight}px`;
              }}
            />

            <button
              onClick={handleSend}
              disabled={loading || !inputText.trim()}
              className={`p-2.5 rounded-xl transition-all active:scale-95 flex items-center justify-center ${
                !inputText.trim() || loading 
                  ? "bg-slate-800 text-slate-600 cursor-not-allowed" 
                  : "bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
