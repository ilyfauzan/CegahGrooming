"use client";
import { useEffect, useRef } from "react";

interface HistoryTableProps {
  history: any[];
  activeTab: "single" | "window";
}

export default function HistoryTable({
  history,
  activeTab,
}: HistoryTableProps) {
  const downloadCSV = () => {
    if (activeTab !== "window") return;
    if (history.length === 0)
      return alert("Tidak ada data riwayat untuk diunduh.");

    const headers = ["No", "Percakapan", "Skor", "Status", "Waktu"];
    const rows = history.map((h, index) => [
      index + 1,
      `"${h.text_input.replace(/"/g, '""')}"`,
      typeof h.score === 'number' ? h.score.toFixed(4) : "0.0000",
      h.status,
      new Date(h.created_at).toLocaleString("id-ID"),
    ]);

    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Laporan_Deteksi_Chat_${new Date().getTime()}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll ke bawah saat ada history baru
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  return (
    <div className="bg-slate-800/50 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden">
      <div className="flex justify-between items-center p-6 border-b border-slate-700 bg-slate-800/80">
        <h3 className="font-bold text-slate-300 italic text-sm">
          Database Detection Log
        </h3>
        {activeTab === "window" && history.length > 0 && (
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 px-3 py-1.5 bg-green-600/20 hover:bg-green-600 text-green-400 hover:text-white border border-green-500/30 rounded-lg text-[10px] font-black transition-all transform active:scale-95"
          >
            DOWNLOAD REPORT (CSV)
          </button>
        )}
      </div>
      <div 
        ref={scrollRef}
        className="max-h-[400px] overflow-y-auto overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 scroll-smooth"
      >
        <div className="min-w-[600px] md:min-w-0">
          <table className="w-full text-left">
          <thead className="sticky top-0 bg-slate-800 text-[10px] uppercase text-slate-500 font-black shadow-sm z-10">
            <tr>
              <th className="p-5">Percakapan</th>
              <th className="p-5 text-center">Akurasi</th>
              <th className="p-5 text-center">Label</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {history.map((h, i) => {
              // LOGIKA PENENTUAN BADGE (Sinkron dengan Backend Tanpa Threshold)
              let badgeStyle = "";
              let badgeLabel = "";

              if (h.status === "GROOMING") {
                badgeStyle = "bg-red-500/20 text-red-400 border-red-500/30";
                badgeLabel = "DANGER";
              } else if (h.status === "WARNING") {
                badgeStyle = "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
                badgeLabel = "WARNING";
              } else {
                badgeStyle = "bg-blue-500/20 text-blue-400 border-blue-500/30";
                badgeLabel = "NORMAL";
              }

              return (
                <tr
                  key={i}
                  className="hover:bg-slate-700/30 transition-colors group"
                >
                  <td className="p-5 text-sm text-slate-300 italic leading-relaxed">
                    "{h.text_input}"
                  </td>
                  <td className="p-5 font-mono text-slate-400 text-center text-xs">
                    {typeof h.score === 'number' ? h.score.toFixed(4) : "0.0000"}
                  </td>
                  <td className="p-5 text-center">
                    <span
                      className={`px-3 py-1 rounded-lg text-[9px] md:text-[10px] font-black tracking-wider border ${badgeStyle}`}
                    >
                      {badgeLabel}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
        {history.length === 0 && (
          <div className="p-10 text-center text-slate-500 text-xs italic">
            Belum ada riwayat deteksi.
          </div>
        )}
      </div>
    </div>
  );
}
