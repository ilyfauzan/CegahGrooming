"use client";
import { useEffect, useRef } from "react";

interface HistoryTableProps {
  history: any[];
}

export default function HistoryTable({
  history,
}: HistoryTableProps) {
  const downloadCSV = () => {
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
      <div className="flex flex-col sm:flex-row justify-between items-center p-5 md:p-6 border-b border-slate-700 bg-slate-800/80 gap-4">
        <h3 className="font-bold text-slate-300 italic text-sm text-center sm:text-left">
          Database Detection Log
        </h3>
        {history.length > 0 && (
          <button
            onClick={downloadCSV}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 sm:py-2 bg-green-600/20 hover:bg-green-600 hover:bg-gradient-to-r hover:from-green-600 hover:to-emerald-600 text-green-400 hover:text-white border border-green-500/30 rounded-xl text-[10px] font-black transition-all transform active:scale-95 shadow-lg hover:shadow-green-900/20"
          >
            DOWNLOAD REPORT (CSV)
          </button>
        )}
      </div>
      <div
        ref={scrollRef}
        className="max-h-[400px] overflow-auto scrollbar-thin scrollbar-thumb-slate-700 scroll-smooth"
      >
        <div className="min-w-0">
          <table className="w-full text-left table-fixed">
            <thead className="sticky top-0 bg-slate-800 text-[9px] sm:text-[10px] uppercase text-slate-500 font-black shadow-sm z-10">
              <tr>
                <th className="p-3 sm:p-5 truncate">Percakapan</th>
                <th className="p-3 sm:p-5 text-center w-20 sm:w-28">Akurasi</th>
                <th className="p-3 sm:p-5 text-center w-20 sm:w-32">Label</th>
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
                    <td className="p-3 sm:p-5 text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                      <div className="relative group/text">
                        <p className="line-clamp-2 peer-checked:line-clamp-none overflow-hidden transition-all duration-300">
                          "{h.text_input}"
                        </p>
                        {h.text_input.length > 100 && (
                          <button
                            onClick={(e) => {
                              const p = e.currentTarget.previousElementSibling;
                              if (p?.classList.contains('line-clamp-2')) {
                                p.classList.remove('line-clamp-2');
                                e.currentTarget.innerText = 'Sembunyikan';
                              } else {
                                p?.classList.add('line-clamp-2');
                                e.currentTarget.innerText = 'Selengkapnya';
                              }
                            }}
                            className="text-[9px] font-black text-blue-500 hover:text-blue-400 mt-1 uppercase tracking-widest cursor-pointer"
                          >
                            Selengkapnya
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="p-3 sm:p-5 font-mono text-slate-400 text-center text-[10px] sm:text-xs">
                      {typeof h.score === 'number' ? h.score.toFixed(4) : "0.0000"}
                    </td>
                    <td className="p-3 sm:p-5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[8px] md:text-[10px] font-black tracking-wider border ${badgeStyle}`}
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
