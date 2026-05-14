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
      title: "Pemantau Alur",
      desc: "Sistem tidak hanya melihat satu pesan saja, tapi juga memantau jalannya percakapan secara utuh.",
      icon: "📱",
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
    <main className="min-h-screen bg-[#0f172a] text-slate-200 font-sans p-6 md:p-10 selection:bg-blue-500/30 overflow-x-hidden flex flex-col justify-center">
      <div className="max-w-6xl mx-auto">
        <Navbar />
        
        <Hero />

        {/* Features Grid */}
        <div className="pb-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div 
              key={i} 
              className="p-8 rounded-3xl bg-slate-800/40 border border-slate-700/50 hover:border-blue-500/30 transition-all group"
            >
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg mb-4 ${f.color}`}>
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

        {/* Footer */}
        <footer className="mt-6 py-6 border-t border-slate-800/50 text-center">
          <p className="text-slate-500 text-[10px] md:text-xs font-medium tracking-widest uppercase opacity-60">
            &copy; {new Date().getFullYear()} CegahGrooming — AI Protection System
          </p>
        </footer>
      </div>
    </main>
  );
}
