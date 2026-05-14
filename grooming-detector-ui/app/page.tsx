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
    <main className="min-h-screen bg-[#0f172a] text-slate-200 font-sans p-6 md:p-10 selection:bg-blue-500/30 overflow-x-hidden flex flex-col items-center">
      {/* Background Glow */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-6xl w-full mx-auto">
        <Navbar />
        
        <Hero />

        {/* Stats Bar */}
        <div className="mb-20 grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
          {[
            { label: "Metode Deteksi", val: "BERT" },
            { label: "Keamanan Data", val: "Private" },
            { label: "Waktu Proses", val: "Real-time" },
            { label: "Status Sistem", val: "Active" }
          ].map((s, i) => (
            <div key={i} className="text-center p-6 rounded-2xl bg-slate-800/20 border border-slate-700/30 backdrop-blur-sm">
              <p className="text-2xl md:text-3xl font-black text-blue-400 mb-1">{s.val}</p>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Features Section */}
        <div className="space-y-12 mb-20">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-100">
              Teknologi <span className="premium-text-blue notranslate">Keamanan</span> Kami
            </h2>
            <p className="text-slate-500 text-sm md:text-base max-w-2xl mx-auto">
              Dibangun dengan standar riset terkini untuk mendeteksi grooming di lingkungan chat digital.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div 
                key={i} 
                className="p-10 rounded-[2.5rem] bg-slate-800/30 border border-slate-700/50 hover:border-blue-500/40 hover:bg-slate-800/50 transition-all group relative overflow-hidden"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-lg ${f.color}`}>
                  {f.icon}
                </div>
                <h3 className="text-xl font-black mb-4 text-slate-100 group-hover:text-blue-400 transition-colors">
                  {f.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {f.desc}
                </p>
                
                {/* Decorative element */}
                <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all" />
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 py-12 border-t border-slate-800/50 text-center space-y-6">
          <div className="flex justify-center items-center gap-2">
             <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 text-xs font-black">CG</div>
             <span className="text-lg font-black premium-text-vibrant">CegahGrooming</span>
          </div>
          <p className="text-slate-600 text-[10px] font-bold tracking-[0.3em] uppercase opacity-60">
            &copy; {new Date().getFullYear()} AI Protection System — Secured with BERT Intelligence
          </p>
        </footer>
      </div>
    </main>
  );
}
