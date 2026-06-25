"use client";
import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { ChatBubbleItem } from "./ChatBubbleList";

interface ResultSidebarProps {
  items: ChatBubbleItem[];
  loading?: boolean;
  onFocusStatus?: (status: "WARNING" | "GROOMING") => void;
}

export default function ResultSidebar({ items, loading = false, onFocusStatus }: ResultSidebarProps) {
  const total = items.length;
  const groomingCount = items.filter((i) => i.status === "GROOMING").length;
  const warningCount = items.filter((i) => i.status === "WARNING").length;
  const normalCount = items.filter((i) => i.status === "NORMAL").length;
  const highestScore = total > 0 ? Math.max(...items.map((i) => i.score)) : 0;
  const latestItem = total > 0 ? items[total - 1] : null;
  const displayValue = total > 0 ? highestScore * 100 : 0;
  const displayLabel = "Skor Hybrid";

  const worstStatus = groomingCount > 0 ? "GROOMING" : warningCount > 0 ? "WARNING" : "NORMAL";
  const currentStatus = loading
    ? (latestItem?.status || "NORMAL")
    : worstStatus;

  const colorMap = {
    GROOMING: { path: "#ef4444", text: "text-red-400", border: "border-red-500/50", label: "GROOMING TERDETEKSI" },
    WARNING: { path: "#f59e0b", text: "text-yellow-400", border: "border-yellow-500/50", label: "KEWASPADAAN AKTIF" },
    NORMAL: { path: "#60a5fa", text: "text-blue-400", border: "border-blue-500/30", label: "PERCAKAPAN AMAN" },
  };
  const config = colorMap[currentStatus];

  const downloadCSV = () => {
    if (items.length === 0) return alert("Tidak ada data untuk diunduh.");
    const headers = ["No", "Percakapan", "Terjemahan", "Skor Standalone", "Skor Konteks", "Skor Hybrid", "Status"];
    const rows = items.map((h, i) => [
      i + 1,
      `"${h.text.replace(/"/g, '""')}"`,
      `"${(h.translated || "").replace(/"/g, '""')}"`,
      h.standalone_score.toFixed(4),
      h.context_score.toFixed(4),
      h.score.toFixed(4),
      h.status,
    ]);
    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_Deteksi_Chat_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="sticky top-10 space-y-6">
      <div className={`p-5 md:p-8 rounded-3xl border shadow-2xl transition-all duration-700 bg-slate-800/50 ${config.border}`}
        style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
      >
        <h3 className="text-slate-500 text-[10px] md:text-xs font-black uppercase tracking-widest italic mb-6">
          Ringkasan Analisis
        </h3>

        <div className="flex flex-col items-center">
          <div className="w-full max-w-[200px] mb-6">
            <div className="relative group">
              <div className="absolute inset-0 rounded-full blur-3xl opacity-20" style={{ backgroundColor: config.path }} />
              <div className="relative">
                <CircularProgressbar
                  value={displayValue}
                  text={`${displayValue.toFixed(0)}%`}
                  strokeWidth={8}
                  styles={buildStyles({
                    pathColor: config.path,
                    textColor: "#fff",
                    trailColor: "#1e293b",
                    pathTransitionDuration: 0.5,
                  })}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-14">
                  <span className={`text-[9px] font-black uppercase tracking-widest ${config.text}`}>
                    {displayLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-wider ${config.text} bg-slate-900/60 border ${config.border}`}>
            {config.label}
          </div>
        </div>
      </div>

      <div className="p-5 rounded-3xl border border-slate-700 bg-slate-800/50 space-y-4"
        style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
      >
        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Statistik</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-1.5">
            <span className="text-xs text-slate-400">Total Pesan</span>
            <span className="text-sm font-black text-white">{total}</span>
          </div>
          <div className="flex justify-between items-center py-1.5">
            <span className="text-xs text-blue-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> Normal
            </span>
            <span className="text-sm font-bold text-blue-400">{normalCount}</span>
          </div>
          <button
            onClick={() => warningCount > 0 && onFocusStatus?.("WARNING")}
            disabled={warningCount === 0 || loading}
            type="button"
            className={`w-full flex justify-between items-center py-1.5 px-0 bg-transparent border-none text-left transition-all duration-300 ${
              warningCount > 0 && !loading
                ? "hover:text-yellow-300 cursor-pointer active:scale-[0.98] group/stat"
                : "opacity-60 cursor-not-allowed"
            }`}
          >
            <span className="text-xs text-yellow-400 flex items-center gap-1.5 group-hover/stat:translate-x-1 transition-transform duration-300">
              <span className="w-2 h-2 rounded-full bg-yellow-500" /> Warning
            </span>
            <span className="text-sm font-bold text-yellow-400 relative inline-block">
              {warningCount}
              {warningCount > 0 && !loading && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 absolute left-full ml-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover/stat:opacity-100 group-hover/stat:translate-x-0.5 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              )}
            </span>
          </button>
          <button
            onClick={() => groomingCount > 0 && onFocusStatus?.("GROOMING")}
            disabled={groomingCount === 0 || loading}
            type="button"
            className={`w-full flex justify-between items-center py-1.5 px-0 bg-transparent border-none text-left transition-all duration-300 ${
              groomingCount > 0 && !loading
                ? "hover:text-red-300 cursor-pointer active:scale-[0.98] group/stat"
                : "opacity-60 cursor-not-allowed"
            }`}
          >
            <span className="text-xs text-red-400 flex items-center gap-1.5 group-hover/stat:translate-x-1 transition-transform duration-300">
              <span className="w-2 h-2 rounded-full bg-red-500" /> Grooming
            </span>
            <span className="text-sm font-bold text-red-400 relative inline-block">
              {groomingCount}
              {groomingCount > 0 && !loading && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 absolute left-full ml-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover/stat:opacity-100 group-hover/stat:translate-x-0.5 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              )}
            </span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={downloadCSV}
          className="w-full flex items-center justify-center gap-2 py-3 bg-green-600/10 hover:bg-green-600 text-green-400 hover:text-white border border-green-500/30 rounded-2xl text-xs font-black transition-all active:scale-[0.98] shadow-lg hover:shadow-green-900/20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          DOWNLOAD REPORT (CSV)
        </button>
      </div>
    </div>
  );
}
