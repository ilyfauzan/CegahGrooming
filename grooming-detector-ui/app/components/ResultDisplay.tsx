"use client";
import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { DetectionResult } from "../page";

interface ResultDisplayProps {
  result: DetectionResult | null;
  activeTab?: "single" | "window";
}

export default function ResultDisplay({
  result,
  activeTab,
}: ResultDisplayProps) {
  const getRangeConfig = (status: string, score: number) => {
    // 1. KONDISI DANGER: Jika status murni dari Backend adalah GROOMING
    if (status === "GROOMING") {
      return {
        label: "DANGER",
        color: "text-red-500",
        stroke: "stroke-red-500",
        bg: "bg-red-950/20",
        border: "border-red-500/50",
        msg: "BAHAYA: Terdeteksi indikasi tindakan Grooming!",
      };
    }

    // 2. KONDISI WARNING: Jika status dari Backend adalah WARNING
    if (status === "WARNING") {
      return {
        label: "WARNING",
        color: "text-yellow-500",
        stroke: "stroke-yellow-500",
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/50",
        msg: "WASPADAI: Pola komunikasi mulai mendekati area mencurigakan.",
      };
    }

    // 3. KONDISI NORMAL: Jika status NORMAL dan skor tinggi
    return {
      label: "NORMAL",
      color: "text-blue-400",
      stroke: "stroke-blue-500",
      bg: "bg-slate-800/50",
      border: "border-slate-700",
      msg: "AMAN: Percakapan terpantau aman.",
    };
  };

  const config = result ? getRangeConfig(result.status, result.score) : null;

  return (
    <div className="lg:col-span-1">
      {/* BOX ALERT GLOBAL - Removed as per instruction, hasAlert prop is also removed */}

      <div
        className={`p-8 rounded-3xl border shadow-2xl sticky top-10 transition-all duration-700 bg-slate-800/50 border-slate-700`}
      >
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-10 italic">
            Prediction Output
          </h3>
          {result?.isDropping && (
            <span className="flex items-center gap-1 px-2 py-1 bg-orange-500 text-white text-[9px] font-black rounded-lg animate-bounce shadow-lg shadow-orange-900/40">
              📉 SKOR MENURUN
            </span>
          )}
        </div>

        {result ? (
          <div className="text-center">
            <div className="flex flex-col items-center">
              <div className="w-full max-w-[280px]">
                <div className="relative mb-10 group">
                  <div className="absolute inset-0 bg-red-500/10 rounded-full blur-3xl group-hover:bg-red-500/20 transition-all duration-500" />
                  <div className="relative">
                    <CircularProgressbar
                      value={(result.score || 0) * 100}
                      text={`${((result.score || 0) * 100).toFixed(0)}%`}
                      strokeWidth={8}
                      styles={buildStyles({
                        pathColor: result.status === "GROOMING" ? "#ef4444" : result.status === "WARNING" ? "#f59e0b" : "#60a5fa",
                        textColor: "#fff",
                        trailColor: "#1e293b",
                        pathTransitionDuration: 1.5,
                      })}
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center pt-16">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${config?.color}`}>
                        {result.status === "GROOMING" ? "DANGER" : result.status === "WARNING" ? "WARNING" : "NORMAL"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`mb-6 p-4 rounded-2xl bg-slate-900/40 border ${config?.border || ""} transition-all space-y-4`}>
              <p className={`text-[11px] font-bold tracking-tight ${config?.color}`}>
                {config?.msg}
              </p>
              
              {/* BREAKDOWN SKOR HYBRID - Hanya muncul di Mode Window */}
              {result && activeTab === "window" && (
                <div className="pt-2 border-t border-slate-700/50 space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[8px] font-black text-slate-500 uppercase">
                      <span>Analisis Kalimat Tunggal</span>
                      <span>{(result.standalone_score * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-1000" 
                        style={{ width: `${result.standalone_score * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-[8px] font-black text-slate-500 uppercase">
                      <span>Analisis Alur (Konteks)</span>
                      <span>{(result.context_score * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 transition-all duration-1000" 
                        style={{ width: `${result.context_score * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-slate-700/50 pt-4 flex flex-col gap-2">
              <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase">
                <span>Model Decision:</span>
                <span className={config?.color}>{result.status}</span>
              </div>
              {/* Baris Confidence telah dihapus sesuai permintaan */}
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-slate-600 italic text-sm">
            Analisis teks untuk melihat skor.
          </div>
        )}
      </div>
    </div>
  );
}
