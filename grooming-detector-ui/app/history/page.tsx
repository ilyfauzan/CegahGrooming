"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "../components/Navbar";

interface HistoryRecord {
  id: number;
  text_input: string;
  score: number;
  status: string;
  session_id: string;
  batch_id: string;
  mode: string;
  created_at: string;
}

interface GroupedHistory {
  batch_id: string;
  mode: string;
  timestamp: string;
  items: HistoryRecord[];
  maxScore: number;
  overallStatus: string;
}

export default function HistoryPage() {
  const [historyGroups, setHistoryGroups] = useState<GroupedHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);

    // Ambil session_id untuk privasi (Level 1)
    const sessionId = typeof window !== "undefined" ? localStorage.getItem("chat_session_id") : null;

    if (!supabase) {
      console.warn("Supabase is missing or invalid URL.");
      setLoading(false);
      return;
    }

    let query = supabase
      .from("history_detection")
      .select("*")
      .order("created_at", { ascending: false });

    // Hanya ambil data milik user ini saja
    if (sessionId) {
      query = query.eq("session_id", sessionId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching history:", error);
    } else {
      groupData(data || []);
    }
    setLoading(false);
  };

  const groupData = (data: HistoryRecord[]) => {
    const groups: { [key: string]: GroupedHistory } = {};

    data.forEach((item) => {
      const bId = item.batch_id || "single_" + item.id;
      if (!groups[bId]) {
        groups[bId] = {
          batch_id: bId,
          mode: item.mode || "single",
          timestamp: item.created_at,
          items: [],
          maxScore: item.score, // Skor dari baris paling baru (hasil akhir batch)
          overallStatus: item.status, // Status dari baris paling baru (hasil akhir batch)
        };
      }
      groups[bId].items.push(item);
    });

    setHistoryGroups(Object.values(groups).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ));
  };

  const removeGroupLocally = (batchId: string) => {
    if (confirm("Hapus log ini dari tampilan? (Data di database tetap ada)")) {
      setHistoryGroups(prev => prev.filter(g => g.batch_id !== batchId));
    }
  };

  const getStatusColor = (status: string) => {
    if (status === "GROOMING") return "text-red-400 border-red-500/50 bg-red-500/10";
    if (status === "WARNING") return "text-yellow-400 border-yellow-500/50 bg-yellow-500/10";
    return "text-blue-400 border-blue-500/30 bg-blue-500/10";
  };

  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-200 font-sans p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <Navbar />

        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-black premium-text-blue notranslate uppercase tracking-tighter">
              Riwayat Analisis
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-2 uppercase tracking-widest">
              Log percakapan yang tersimpan di database
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {["ALL", "NORMAL", "WARNING", "GROOMING"].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${
                  filterStatus === s 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" 
                  : "bg-slate-800/50 text-slate-500 hover:bg-slate-800 border border-slate-700"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Memuat database...</div>
          </div>
        ) : (
          <div className="space-y-12">
            {filteredGroups.length === 0 ? (
              <div className="text-center py-40">
                <p className="text-slate-600 italic font-medium text-sm">Tidak ada riwayat ditemukan.</p>
              </div>
            ) : (
              filteredGroups.map((group) => (
                <div key={group.batch_id} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Group Header */}
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-4">
                      <div className={`px-3 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase ${getStatusColor(group.overallStatus)}`}>
                        {group.overallStatus} ({(group.maxScore * 100).toFixed(0)}%)
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {new Date(group.timestamp).toLocaleString("id-ID", { 
                          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    
                    <button 
                      onClick={() => removeGroupLocally(group.batch_id)}
                      className="text-[9px] font-black text-slate-600 hover:text-red-400 uppercase tracking-widest transition-colors flex items-center gap-1.5 group"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Hapus dari Tampilan
                    </button>
                  </div>
                  
                  {/* Chat Bubbles for this group */}
                  <div className="bg-slate-800/30 rounded-[2rem] border border-slate-700/50 p-4 md:p-6 space-y-3 shadow-xl">
                    {group.items.slice().reverse().map((item, idx) => {
                      const isRisk = item.status !== "NORMAL";
                      return (
                        <div key={idx} className={`flex flex-col max-w-[85%] ${idx % 2 === 0 ? "items-start" : "items-start"}`}>
                          <div className={`relative px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                            item.status === "GROOMING" ? "bg-red-500/10 border border-red-500/30 text-red-100" :
                            item.status === "WARNING" ? "bg-yellow-500/10 border border-yellow-500/30 text-yellow-100" :
                            "bg-slate-700/40 border border-slate-600/30 text-slate-300"
                          }`}>
                            {item.text_input}
                            
                            {/* Score Tag in Bubble */}
                            <div className="mt-2 flex items-center gap-2">
                              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ${
                                item.status === "GROOMING" ? "bg-red-500/20 text-red-400" :
                                item.status === "WARNING" ? "bg-yellow-500/20 text-yellow-400" :
                                "bg-slate-800 text-slate-500"
                              }`}>
                                {item.status} ({(item.score * 100).toFixed(1)}%)
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        
        {/* Footer */}
        <footer className="mt-32 py-10 border-t border-slate-800/50 text-center">
          <p className="text-slate-600 text-[10px] font-bold tracking-[0.2em] uppercase opacity-60">
            &copy; {new Date().getFullYear()} CegahGrooming — AI Protection System
          </p>
        </footer>
      </div>
    </main>
  );
}

