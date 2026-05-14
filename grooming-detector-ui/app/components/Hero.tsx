"use client";
import Link from "next/link";

export default function Hero() {
  return (
    <div className="relative overflow-hidden py-20 md:py-32">
      {/* Abstract Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] animate-pulse delay-700" />

      <div className="relative text-center space-y-10 max-w-5xl mx-auto px-6">
        {/* Visual Shield Element */}
        <div className="flex justify-center mb-4">
          <div className="relative w-24 h-24 md:w-32 md:h-32 animate-bounce-slow">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-[2rem] rotate-45 border border-emerald-500/40 backdrop-blur-xl" />
            <div className="absolute inset-4 bg-emerald-400/30 rounded-2xl rotate-45 border border-emerald-400/50 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 md:h-14 md:w-14 text-emerald-400 -rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            {/* Pulsing rings */}
            <div className="absolute -inset-4 border border-emerald-500/20 rounded-[3rem] animate-ping opacity-20" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] animate-fade-in">
            Next-Gen AI Protection
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] text-white">
            Deteksi Dini <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-blue-400 to-indigo-500 italic">Online Grooming</span>
          </h1>
        </div>
        
        <p className="text-slate-400 text-base md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
          Keamanan digital masa depan dengan <span className="text-emerald-400 font-bold">Deep Learning</span>. Lindungi interaksi sosial dari ancaman predator secara instan dan akurat.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-6">
          <Link
            href="/detector"
            className="w-full sm:w-auto px-12 py-5 bg-emerald-600 hover:bg-emerald-500 rounded-3xl font-black text-xs tracking-[0.2em] text-white shadow-2xl shadow-emerald-900/40 hover:scale-[1.05] active:scale-95 transition-all flex items-center justify-center gap-3 uppercase"
          >
            Mulai Analisis
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
          
          <Link
            href="/history"
            className="w-full sm:w-auto px-12 py-5 bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 rounded-3xl font-black text-xs tracking-[0.2em] text-slate-300 hover:text-white transition-all flex items-center justify-center uppercase"
          >
            Riwayat Log
          </Link>
        </div>
      </div>
    </div>
  );
}
