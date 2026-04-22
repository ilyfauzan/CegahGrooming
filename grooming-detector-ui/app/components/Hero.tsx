"use client";
import Link from "next/link";

export default function Hero() {
  return (
    <div className="relative overflow-hidden pt-10 md:pt-20 lg:pt-32 pb-6 md:pb-10">
      {/* Background Blobs for Decoration */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-violet-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

      <div className="relative text-center space-y-8 max-w-4xl mx-auto px-6">
        <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] animate-fade-in">
          Sistem Deteksi Grooming Berbasis AI
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1]">
          Lindungi Masa Depan dari <br />
          <span className="premium-text-vibrant italic">Online Grooming</span>
        </h1>
        
        <p className="text-slate-400 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed">
          Platform deteksi manipulasi komunikasi pertama yang mengombinasikan Model 
          <span className="text-slate-200 font-bold"> BERT </span> dengan algoritma 
          <span className="text-blue-400 font-bold"> Hybrid Scoring </span> untuk akurasi terbaik 
          dalam mendeteksi pola predator seksual online.
        </p>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/detector"
            className="w-full sm:w-auto px-8 py-4 bg-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl font-black text-sm tracking-widest text-white shadow-xl shadow-blue-900/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            MULAI ANALISIS SEKARANG
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
          
          <Link
            href="/history"
            className="w-full sm:w-auto px-8 py-4 bg-slate-800/80 border border-slate-700 rounded-2xl font-black text-sm tracking-widest text-slate-400 hover:text-white hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
          >
            LIHAT RIWAYAT
          </Link>
        </div>
      </div>
    </div>
  );
}
