"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

import Navbar from "./components/Navbar";
import InputArea from "./components/InputArea";
import HistoryTable from "./components/HistoryTable";
import ResultDisplay from "./components/ResultDisplay";

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
  const [activeTab, setActiveTab] = useState<"single" | "window">("single");
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasAlert, setHasAlert] = useState(false);

  // Ref untuk menyimpan skor terakhir sebagai acuan "isDropping"
  const lastScoreRef = useRef<number | null>(null);

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

  // 2. OTOMATIS RESET SAAT PINDAH MODE
  useEffect(() => {
    const autoResetContext = async () => {
      try {
        // Reset memori di Backend Python
        const sessionId = getSessionId();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        await fetch(`${apiUrl}/reset`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId }),
        });

        // Reset state di Frontend
        setResult(null);
        setInputText("");
        setHasAlert(false);
        setHistory([]); // Sesuai permintaan: Riwayat layar bersih saat pindah tab
        lastScoreRef.current = null; // Reset referensi skor

        console.log(
          `Konteks AI dibersihkan karena pindah ke mode: ${activeTab}`,
        );
      } catch (err) {
        console.error("Gagal reset konteks otomatis:", err);
      }
    };

    autoResetContext();
  }, [activeTab]);

  // 3. Fungsi Utama Analisis
  const analyzeGrooming = async () => {
    if (!inputText || loading) return;
    setLoading(true);

    try {
      const sessionId = getSessionId();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      let previousScoreRef = lastScoreRef.current;

      if (activeTab === "single") {
        // --- MODE SINGLE ---
        const response = await fetch(`${apiUrl}/predict`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: inputText, session_id: sessionId }),
        });
        const aiData = await response.json();

        const newResult: DetectionResult = {
          score: aiData.score,
          status: aiData.status,
          confidence: aiData.score,
          isDropping: false,
          standalone_score: aiData.standalone_score || aiData.score,
          context_score: aiData.context_score || aiData.score,
          translated: aiData.translated || inputText,
        };
        setResult(newResult);

        // Update Tabel Lokal Langsung
        const historyEntry: HistoryItem = {
          text_input: inputText,
          score: aiData.score,
          status: aiData.status,
          created_at: new Date().toISOString(),
        };
        setHistory((prev) => [historyEntry, ...prev]);

        // Simpan ke Supabase (Batch ID unik untuk single)
        const batchId = "single_" + Math.random().toString(36).substring(2, 9);
        try {
          const { error: sbError } = await supabase.from("history_detection").insert([
            {
              text_input: inputText,
              score: aiData.score,
              status: aiData.status,
              session_id: sessionId,
              batch_id: batchId,
              mode: "single",
            },
          ]);
          if (sbError) console.error("Supabase Error (Single):", sbError.message);
        } catch (e) {
          console.error("Supabase Connection Error:", e);
        }

        lastScoreRef.current = aiData.score;

        // Reset memori AI di backend untuk mode single
        await fetch(`${apiUrl}/reset`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId }),
        });
      } else {
        // --- MODE WINDOW (ALUR) ---
        const lines = inputText.split("\n").filter((l) => l.trim() !== "");
        if (lines.length === 0) {
          alert("Silakan masukkan teks terlebih dahulu.");
          setLoading(false);
          return;
        }

        // RESET SEBELUM MULAI BATCH
        await fetch(`${apiUrl}/reset`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId }),
        });
        
        setHistory([]); // Bersihkan layar untuk batch baru
        setResult(null);
        setHasAlert(false);
        lastScoreRef.current = null;
        previousScoreRef = null;

        const batchId = "batch_" + Math.random().toString(36).substring(2, 9);
        let groomingFound = false;

        for (const line of lines) {
          const response = await fetch(`${apiUrl}/predict`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: line, session_id: sessionId }),
          });

          const currentData = await response.json();
          const isDropping = previousScoreRef !== null && previousScoreRef - currentData.score > 0.1;

          // 1. Update Lingkaran (Real-time)
          setResult({
            score: currentData.score,
            status: currentData.status,
            confidence: currentData.score,
            isDropping: isDropping,
            standalone_score: currentData.standalone_score || currentData.score,
            context_score: currentData.context_score || currentData.score,
            translated: currentData.translated || line,
          });

          if (currentData.status === "GROOMING") groomingFound = true;

          // 2. Update Tabel Lokal (Real-time) - Ganti ke append (belakang) agar scroll bottom pas
          const historyEntry: HistoryItem = {
            text_input: line,
            score: currentData.score,
            status: currentData.status,
            created_at: new Date().toISOString(),
          };
          setHistory((prev) => [...prev, historyEntry]);

          // Berikan waktu sela 50ms agar browser sempat melakukan "Paint" (Gambar ulang) ke layar
          await new Promise((resolve) => setTimeout(resolve, 50));

          // 3. Simpan ke database
          try {
            const { error: sbError } = await supabase.from("history_detection").insert([
              {
                text_input: line,
                score: currentData.score,
                status: currentData.status,
                session_id: sessionId,
                batch_id: batchId,
                mode: "window",
              },
            ]);
            if (sbError) console.error("Supabase Error (Window):", sbError.message);
          } catch (e) {
            console.error("Supabase Connection Error:", e);
          }

          previousScoreRef = currentData.score;
          lastScoreRef.current = currentData.score;
        }

        setHasAlert(groomingFound);
      }

      setInputText("");
    } catch (err) {
      console.error(err);
      alert(`Error: Pastikan Backend Python berjalan di ${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-200 font-sans p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <Navbar />

        {/* CONTROLS */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-10 gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("single")}
              className={`appearance-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "single" ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" : "bg-slate-800 text-slate-400"}`}
            >
              MODE 1: SINGLE
            </button>
            <button
              onClick={() => setActiveTab("window")}
              className={`appearance-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "window" ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" : "bg-slate-800 text-slate-400"}`}
            >
              MODE 2: WINDOW
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <InputArea
              activeTab={activeTab}
              inputText={inputText}
              setInputText={setInputText}
              onAnalyze={analyzeGrooming}
              loading={loading}
            />
            <HistoryTable history={history} activeTab={activeTab} />
          </div>

          {/* Sisi Kanan: Hasil Prediksi */}
          <div className="lg:col-span-1">
            <ResultDisplay result={result} activeTab={activeTab} />
          </div>
        </div>
      </div>
    </main>
  );
}
