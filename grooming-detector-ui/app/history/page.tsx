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
    const statusPriority: { [key: string]: number } = {
      GROOMING: 3,
      WARNING: 2,
      NORMAL: 1,
    };

    data.forEach((item) => {
      const bId = item.batch_id || "single_" + item.id;
      if (!groups[bId]) {
        groups[bId] = {
          batch_id: bId,
          mode: item.mode || "single",
          timestamp: item.created_at,
          items: [],
          maxScore: 0,
          overallStatus: "NORMAL",
        };
      }
      
      groups[bId].items.push(item);

      const currentPriority = statusPriority[item.status] || 0;
      const groupPriority = statusPriority[groups[bId].overallStatus] || 0;

      if (currentPriority > groupPriority) {
        // 1. Prioritaskan status yang lebih parah (Grooming > Warning > Normal)
        groups[bId].overallStatus = item.status;
        groups[bId].maxScore = item.score;
      } else if (currentPriority === groupPriority) {
        // 2. Jika status sama parahnya, ambil yang keyakinannya paling tinggi
        if (item.score > groups[bId].maxScore) {
          groups[bId].maxScore = item.score;
        }
      }
    });

    setHistoryGroups(Object.values(groups).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ));
  };

  const filteredGroups = historyGroups.filter(g => 
    filterStatus === "ALL" || g.overallStatus === filterStatus
  );

  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-200 font-sans p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <Navbar />

        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <h2 className="text-xl font-bold text-slate-400 uppercase tracking-widest">
            History Database Logs
          </h2>
          
          <div className="flex flex-wrap justify-center gap-2">
            {["ALL", "NORMAL", "WARNING", "GROOMING"].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-[9px] md:text-[10px] font-black tracking-widest transition-all ${
                  filterStatus === s 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" 
                  : "bg-slate-800 text-slate-500 hover:bg-slate-700 border border-slate-700"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 animate-pulse text-slate-500">Loading history...</div>
        ) : (
          <div className="space-y-6">
            {filteredGroups.length === 0 ? (
              <div className="text-center py-20 text-slate-600 italic">No history found with current filters.</div>
            ) : (
              filteredGroups.map((group) => (
                <div key={group.batch_id} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-slate-600 transition-all">
                  <div className="p-4 bg-slate-900/30 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-700/30 gap-3">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        group.overallStatus === "GROOMING" ? "bg-red-500" : 
                        group.overallStatus === "WARNING" ? "bg-yellow-500" : "bg-blue-500"
                      }`} />
                      <span className="text-[10px] font-black text-slate-500 uppercase whitespace-nowrap">
                        {new Date(group.timestamp).toLocaleString("id-ID")}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-800 rounded text-[9px] font-bold text-slate-400">
                        {group.mode.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest self-end sm:self-auto">
                      Overall: <span className={
                        group.overallStatus === "GROOMING" ? "text-red-500" : 
                        group.overallStatus === "WARNING" ? "text-yellow-500" : "text-blue-400"
                      }>{group.overallStatus} ({(group.maxScore * 100).toFixed(0)}%)</span>
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-2">
                    {group.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start gap-4 py-2 border-b border-slate-700/20 last:border-0 hover:bg-slate-800/20 px-2 rounded-lg transition-all">
                        <p className="text-xs text-slate-300 italic">"{item.text_input}"</p>
                        <span className={`text-[9px] font-bold shrink-0 ${
                          item.status === "GROOMING" ? "text-red-500/70" : 
                          item.status === "WARNING" ? "text-yellow-500/70" : "text-slate-500"
                        }`}>
                          {(item.score * 100).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
}
