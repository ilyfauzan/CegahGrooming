"use client";
import Link from "next/link";

export default function Hero() {
  return (
    <div className="relative overflow-hidden py-12 md:py-24">
      {/* Background Decorative Elements */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-[100px] opacity-20 animate-pulse" />
      <div className="absolute top-1/2 -right-24 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-[120px] opacity-10 animate-pulse delay-700" />

      <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto px-6">
        {/* Left Content */}
        <div className="text-left space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-[0.2em]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Security Protection v2.0
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.95] text-slate-100">
            Perisai Digital <br />
            <span className="premium-text-blue notranslate italic">Anak Bangsa</span>
          </h1>
          
          <p className="text-slate-400 text-base md:text-lg max-w-xl leading-relaxed">
            Mendeteksi pola <span className="text-slate-200 font-bold">predator seksual online</span> secara instan menggunakan teknologi <span className="text-blue-400 font-bold">BERT Deep Learning</span>. Perlindungan cerdas untuk masa depan digital yang lebih aman.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <Link
              href="/detector"
              className="w-full sm:w-auto px-10 py-5 bg-blue-600 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-2xl font-black text-xs tracking-[0.15em] text-white shadow-2xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-3 uppercase"
            >
              Mulai Deteksi
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
            
            <Link
              href="/history"
              className="w-full sm:w-auto px-10 py-5 bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl font-black text-xs tracking-[0.15em] text-slate-400 hover:text-white hover:bg-slate-800 transition-all flex items-center justify-center uppercase"
            >
              Database Riwayat
            </Link>
          </div>
        </div>

        {/* Right Visual Element */}
        <div className="relative hidden lg:block animate-in fade-in zoom-in-95 duration-1000 delay-300">
          <div className="relative z-10 p-1 bg-gradient-to-br from-blue-500/20 to-transparent rounded-[3rem] border border-slate-700/50 overflow-hidden shadow-2xl">
            <div className="bg-[#0f172a] rounded-[2.8rem] p-8 space-y-6">
              {/* Mock AI Card */}
              <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 text-xl font-black">
                  B
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200">BERT Intelligence</h4>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Model Status: Active</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="h-2 w-3/4 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[85%] animate-pulse" />
                </div>
                <div className="h-2 w-1/2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400 w-[60%] animate-pulse delay-500" />
                </div>
              </div>

              <div className="pt-4 grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/30">
                  <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Inference</p>
                  <p className="text-xl font-black text-blue-400">Fast</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/30">
                  <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Analysis</p>
                  <p className="text-xl font-black text-indigo-400">Stable</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Floating Glow */}
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}
