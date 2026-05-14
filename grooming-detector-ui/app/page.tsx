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
    <main className="min-h-screen bg-[#060b18] text-slate-200 font-sans p-6 md:p-10 selection:bg-emerald-500/30 overflow-x-hidden flex flex-col items-center">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[20%] w-[50%] h-[50%] bg-emerald-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[20%] w-[50%] h-[50%] bg-blue-600/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-6xl w-full mx-auto">
        <Navbar />
        
        <Hero />

        {/* Feature Highlights (Bento Style) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          {features.map((f, i) => (
            <div 
              key={i} 
              className="group relative p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 hover:bg-white/[0.04] transition-all duration-500 overflow-hidden"
            >
              {/* Icon Glow */}
              <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-3xl mb-8 transition-transform duration-500 group-hover:scale-110 ${f.color} shadow-2xl`}>
                {f.icon}
              </div>
              
              <h3 className="text-2xl font-black mb-4 text-white tracking-tight">
                {f.title}
              </h3>
              
              <p className="text-slate-500 group-hover:text-slate-400 transition-colors leading-relaxed text-sm md:text-base">
                {f.desc}
              </p>

              {/* Decorative Corner Glow */}
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>

        {/* Bottom Trust Section */}
        <div className="py-20 text-center space-y-8 animate-in fade-in zoom-in-95 duration-1000 delay-500">
           <div className="w-px h-20 bg-gradient-to-b from-transparent via-emerald-500/50 to-transparent mx-auto" />
           <h2 className="text-2xl md:text-4xl font-black text-slate-100 uppercase tracking-tighter">
             Sistem Keamanan <br /> <span className="text-emerald-400 italic">Terverifikasi</span>
           </h2>
           <p className="text-slate-500 text-xs md:text-sm max-w-lg mx-auto leading-relaxed tracking-widest uppercase font-bold">
             Menggunakan model bahasa BERT yang telah diuji untuk akurasi deteksi pola manipulasi pada anak.
           </p>
        </div>

        {/* Footer */}
        <footer className="mt-20 py-16 border-t border-white/5 text-center">
          <div className="flex justify-center items-center gap-3 mb-8">
             <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-black">CG</div>
             <span className="text-xl font-black text-white tracking-tighter">CegahGrooming</span>
          </div>
          <p className="text-slate-600 text-[10px] font-bold tracking-[0.4em] uppercase opacity-40">
            &copy; {new Date().getFullYear()} Protected by Advanced AI System
          </p>
        </footer>
      </div>
    </main>
  );
}
