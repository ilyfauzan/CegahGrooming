"use client";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";

export default function LandingPage() {
  const features = [
    {
      title: "BERT Intelligence",
      desc: "Model bahasa tercanggih untuk memahami nuansa manipulatif dalam teks.",
      icon: "🧠",
      color: "bg-blue-500/20 text-blue-400"
    },
    {
      title: "Hybrid Scoring",
      desc: "Gabungan analisis kalimat tunggal dan alur konteks (50:50) untuk akurasi tinggi.",
      icon: "⚖️",
      color: "bg-indigo-500/20 text-indigo-400"
    },
    {
      title: "Real-time Monitoring",
      desc: "Proses cepat dengan translasi otomatis untuk hasil deteksi seketika.",
      icon: "⚡",
      color: "bg-violet-500/20 text-violet-400"
    }
  ];

  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-200 font-sans p-6 md:p-10 selection:bg-blue-500/30 overflow-x-hidden">
      <div className="max-w-6xl mx-auto">
        <Navbar />
        
        <Hero />

        {/* Features Grid */}
        <div className="py-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div 
              key={i} 
              className="p-8 rounded-3xl bg-slate-800/40 border border-slate-700/50 hover:border-blue-500/30 transition-all group"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-6 ${f.color}`}>
                {f.icon}
              </div>
              <h3 className="text-lg font-black mb-3 text-slate-100 group-hover:text-blue-400 transition-colors">
                {f.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Thesis Attribution */}
        <div className="py-10 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest italic">
            Thesis Project &copy; {new Date().getFullYear()}
          </p>
          <div className="flex gap-4">
             <div className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[9px] font-black text-slate-600 uppercase tracking-tighter">
                BERT-Based Grooming Detection
             </div>
             <div className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[9px] font-black text-slate-600 uppercase tracking-tighter">
                FastAPI Backend
             </div>
             <div className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[9px] font-black text-slate-600 uppercase tracking-tighter">
                Next.js Frontend
             </div>
          </div>
        </div>
      </div>
    </main>
  );
}
