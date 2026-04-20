"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

import Navbar from "../components/Navbar";
import InputArea from "../components/InputArea";
import HistoryTable from "../components/HistoryTable";
import ResultDisplay from "../components/ResultDisplay";

export interface DetectionResult {
  status: "NORMAL" | "WARNING" | "GROOMING";
  score: number;
  confidence: number;
  isDropping: boolean;
  standalone_score: number;
  context_score: number;
  translated: string;
}

export interface HistoryItem {
  text_input: string;
  score: number;
  status: string;
  created_at: string;
}

export default function DetectorDashboard() {
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasAlert, setHasAlert] = useState(false);

  // Ref untuk menyimpan skor terakhir sebagai acuan "isDropping"
  const lastScoreRef = useRef<number | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // 1. Fungsi untuk membuat/mengambil ID dari browser
  const getSessionId = () => {
    if (typeof window !== "undefined") {
      let id = localStorage.getItem("chat_session_id");
      if (!id) {
        id = "user_" + Math.random().toString(36).substring(2, 9);
        localStorage.setItem("chat_session_id", id);
      }
      return id;
    }
    return "";
  };

  // 2. Fungsi Utama Analisis (Uni-Mode)
  const analyzeGrooming = async () => {
    if (!inputText || loading) return;
    setLoading(true);

    // Auto-scroll ke area hasil saat analisis dimulai
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);

    try {
      const sessionId = getSessionId();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      let previousScoreRef = lastScoreRef.current;

      const rawLines = inputText.split("\n").filter((l) => l.trim() !== "");
      if (rawLines.length === 0) {
        alert("Silakan masukkan teks terlebih dahulu.");
        setLoading(false);
        return;
      }

      // SMART & HARD SPLITTING: Pecah baris yang terlalu panjang menjadi potongan yang bisa diproses AI
      const lines: string[] = [];
      rawLines.forEach((line) => {
        let chunks = line.split(/(?<=[.!?])\s+|(?<=[.!?])$/).filter((s) => s.trim() !== "");
        chunks.forEach((chunk) => {
          if (chunk.length > 250) {
            let remaining = chunk;
            while (remaining.length > 250) {
              let splitIdx = remaining.lastIndexOf(" ", 250);
              if (splitIdx === -1) splitIdx = 250;
              lines.push(remaining.substring(0, splitIdx).trim());
              remaining = remaining.substring(splitIdx).trim();
            }
            if (remaining) lines.push(remaining);
          } else {
            lines.push(chunk);
          }
        });
      });

      // Jika input adalah batch (> 1 baris), reset konteks agar bersih
      if (lines.length > 1) {
        await fetch(`${apiUrl}/reset`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId }),
        });
        setHistory([]);
        setResult(null);
        setHasAlert(false);
        lastScoreRef.current = null;
        previousScoreRef = null;
      }

      const batchId = "det_" + Math.random().toString(36).substring(2, 9);
      let groomingFound = false;

      for (const line of lines) {
        const response = await fetch(`${apiUrl}/predict`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: line, session_id: sessionId }),
        });

        const currentData = await response.json();
        const isDropping = previousScoreRef !== null && previousScoreRef - currentData.score > 0.1;

        // Update UI Real-time
        setResult({
          score: currentData.score,
          status: currentData.status,
          confidence: currentData.confidence,
          isDropping: isDropping,
          standalone_score: currentData.standalone_score,
          context_score: currentData.context_score,
          translated: currentData.translated || line,
        });

        if (currentData.status === "GROOMING") groomingFound = true;

        const historyEntry: HistoryItem = {
          text_input: line,
          score: currentData.score,
          status: currentData.status,
          created_at: new Date().toISOString(),
        };
        
        // Jika batch, push ke akhir. Jika satu pesan, taruh di atas.
        setHistory((prev) => lines.length > 1 ? [...prev, historyEntry] : [historyEntry, ...prev]);

        await new Promise((resolve) => setTimeout(resolve, 50));

        // Simpan ke Supabase
        try {
          await supabase.from("history_detection").insert([
            {
              text_input: line,
              score: currentData.score,
              status: currentData.status,
              session_id: sessionId,
              batch_id: batchId,
              mode: currentData.mode_used || "auto",
            },
          ]);
        } catch (e) {
          console.error("Supabase Error:", e);
        }

        previousScoreRef = currentData.score;
        lastScoreRef.current = currentData.score;
      }

      if (lines.length > 1) setHasAlert(groomingFound);
      setInputText("");
    } catch (err) {
      console.error(err);
      alert(`Error: Pastikan Backend Python berjalan.`);
    } finally {
      setLoading(false);
    }
  };

  // 3. Fungsi Reset Konteks (Manual)
  const handleResetContext = async () => {
    if (loading) return;
    if (history.length === 0 && !inputText) return;
    
    if (!confirm("Apakah Anda yakin ingin menghapus seluruh riwayat dan memulai sesi baru?")) return;

    try {
      const sessionId = getSessionId();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      
      await fetch(`${apiUrl}/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });

      // Reset Frontend State
      setHistory([]);
      setResult(null);
      setHasAlert(false);
      setInputText("");
      lastScoreRef.current = null;
      
    } catch (err) {
      console.error("Gagal reset konteks:", err);
      alert("Gagal mereset konteks. Pastikan backend berjalan.");
    }
  };

  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-200 font-sans p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <Navbar />

        {/* CONTROLS */}
        <div className="mt-8 flex flex-col md:flex-row justify-end items-center gap-4">
          <button
            onClick={handleResetContext}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-red-500/10 border border-slate-700 hover:border-red-500/50 rounded-xl text-slate-500 hover:text-red-400 text-[10px] font-black tracking-widest transition-all active:scale-95 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            BERSIHKAN KONTEKS
          </button>
        </div>

        {/* Unified Layout */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <InputArea
              inputText={inputText}
              setInputText={setInputText}
              onAnalyze={analyzeGrooming}
              loading={loading}
            />
            <HistoryTable history={history} />
          </div>

          {/* Sisi Kanan: Hasil Prediksi */}
          <div className="lg:col-span-1" ref={resultRef}>
            <ResultDisplay result={result} />
          </div>
        </div>
      </div>
    </main>
  );
}
