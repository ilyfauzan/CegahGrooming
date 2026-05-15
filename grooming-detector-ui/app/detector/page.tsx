"use client";
import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

import Navbar from "../components/Navbar";
import ChatInputBuilder from "../components/ChatInputBuilder";
import ChatBubbleList, { ChatBubbleItem } from "../components/ChatBubbleList";
import ResultSidebar from "../components/ResultDisplay";

type ViewState = "paste" | "results";

export default function DetectorDashboard() {
  const [view, setView] = useState<ViewState>("paste");
  const [chatResults, setChatResults] = useState<ChatBubbleItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Session ID untuk Backend
  const getSessionId = () => {
    if (typeof window !== "undefined") {
      let id = localStorage.getItem("chat_session_id");
      if (!id) {
        id = "ssn_" + Math.random().toString(36).substring(2, 9);
        localStorage.setItem("chat_session_id", id);
      }
      return id;
    }
    return "";
  };

  // Proses array pesan: kirim satu per satu ke backend, kumpulkan hasil
  const processMessages = async (messages: string[], isAppend: boolean = false) => {
    if (loading) return;
    setLoading(true);

    try {
      const sessionId = getSessionId();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      // Jika bukan append (analisis baru), reset konteks backend
      if (!isAppend) {
        await fetch(`${apiUrl}/reset`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId }),
        });
        setChatResults([]);
      }

      const batchId = "det_" + Math.random().toString(36).substring(2, 9);

      // Sederhanakan splitting: 1 baris = 1 bubble
      const rawLines: string[] = [];
      messages.forEach((line) => {
        // Hanya pecah jika baris sangat panjang (> 400 karakter)
        if (line.length > 400) {
          let remaining = line;
          while (remaining.length > 400) {
            let splitIdx = remaining.lastIndexOf(" ", 400);
            if (splitIdx === -1) splitIdx = 400;
            rawLines.push(remaining.substring(0, splitIdx).trim());
            remaining = remaining.substring(splitIdx).trim();
          }
          if (remaining) rawLines.push(remaining);
        } else {
          rawLines.push(line);
        }
      });

      // Bersihkan tanda petik dan koma di akhir
      const lines = rawLines
        .map((l) => l.replace(/^["']+/, "").replace(/["']+$/, "").replace(/,\s*$/, "").trim())
        .filter((l) => l !== "");

      // Langsung tampilkan UI hasil (bubble akan muncul satu per satu)
      setView("results");

      // Kirim satu per satu ke backend
      for (const line of lines) {
        const response = await fetch(`${apiUrl}/predict`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: line, session_id: sessionId }),
        });

        const data = await response.json();

        const newItem: ChatBubbleItem = {
          text: line,
          status: data.status,
          score: data.score,
          standalone_score: data.standalone_score || 0,
          context_score: data.context_score || 0,
          translated: data.translated || line,
        };

        // Update UI real-time: setiap pesan langsung muncul sebagai bubble
        setChatResults((prev) => [...prev, newItem]);

        // Simpan ke Supabase
        try {
          await supabase.from("grooming_logs").insert({
            session_id: sessionId,
            batch_id: batchId,
            original_text: line,
            translated_text: data.translated || line,
            score: data.score,
            status: data.status,
            standalone_score: data.standalone_score || 0,
            context_score: data.context_score || 0,
          });
        } catch (dbErr) {
          console.error("DB Error:", dbErr);
        }

        // Small delay agar UI sempat render
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

    } catch (err) {
      console.error(err);
      alert("Error: Pastikan Backend Python berjalan.");
    } finally {
      setLoading(false);
    }
  };

  // Handler: pesan baru dari PasteArea (analisis baru)
  const handleMessagesReady = (messages: string[]) => {
    processMessages(messages, false);
  };

  // Handler: tambah pesan dari clipboard (append ke session yang sudah ada)
  const handleAppend = async () => {
    if (loading) return;
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (!clipboardText || !clipboardText.trim()) {
        alert("Clipboard kosong. Salin percakapan tambahan terlebih dahulu.");
        return;
      }
      const newMessages = clipboardText
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l !== "");
      if (newMessages.length === 0) {
        alert("Tidak ada teks yang valid di clipboard.");
        return;
      }
      processMessages(newMessages, true);
    } catch {
      alert("Gagal membaca clipboard. Pastikan Anda telah menyalin teks.");
    }
  };

  // Handler: analisis baru (reset semua, kembali ke State 1)
  const handleNewAnalysis = async () => {
    if (loading) return;
    if (chatResults.length > 0 && !confirm("Mulai analisis baru? Data saat ini akan dihapus.")) return;

    try {
      const sessionId = getSessionId();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      await fetch(`${apiUrl}/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });
    } catch (e) {
      console.error("Reset error:", e);
    }

    setChatResults([]);
    setView("paste");
  };

  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-200 font-sans p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <Navbar />

        {/* STATE 1: Paste Area */}
        {view === "paste" && (
          <div className="flex-1 flex flex-col justify-center animate-in fade-in zoom-in-95 duration-700 py-10">
            <div className="text-center mb-10 space-y-3">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white">
                Analisis <span className="premium-text-vibrant italic">Chat Log</span>
              </h2>
              <p className="text-slate-500 text-sm md:text-base max-w-lg mx-auto leading-relaxed font-medium">
                Bangun percakapan di bawah atau tempel log dari WhatsApp untuk memulai deteksi predator online.
              </p>
            </div>
            <ChatInputBuilder onAnalyze={handleMessagesReady} isLoading={loading} />
          </div>
        )}

        {/* STATE 2: Results (Chat Bubbles + Sidebar) */}
        {view === "results" && (
          <div className="mt-6 space-y-4">
            {/* Tombol Analisis Baru di atas */}
            <div className="flex justify-end">
              <button
                onClick={handleNewAnalysis}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-red-500/10 border border-slate-700 hover:border-red-500/50 rounded-xl text-slate-500 hover:text-red-400 text-[10px] font-black tracking-widest transition-all active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                ANALISIS BARU
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Kiri: Chat Bubbles */}
              <div className="lg:col-span-2 bg-slate-800/50 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden"
                style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
              >
                <ChatBubbleList
                  items={chatResults}
                  onAppend={handleAppend}
                  loading={loading}
                />
              </div>

              {/* Kanan: Sidebar Ringkasan */}
              <div className="lg:col-span-1">
                <ResultSidebar
                  items={chatResults}
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-20 py-10 border-t border-slate-800/50 text-center">
          <p className="text-slate-500 text-[10px] md:text-xs font-medium tracking-widest uppercase opacity-60">
            &copy; {new Date().getFullYear()} CegahGrooming — AI Protection System
          </p>
        </footer>
      </div>
    </main>
  );
}
