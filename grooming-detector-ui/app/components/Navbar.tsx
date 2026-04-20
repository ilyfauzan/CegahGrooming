"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-10 border-b border-slate-700 pb-4 md:pb-6 gap-3 md:gap-0">
      <div className="flex items-center gap-2 md:gap-3">
        <div className="relative w-12 h-12 md:w-16 md:h-16 flex items-center justify-center overflow-hidden">
          <img 
            src="/logo.png" 
            alt="CegahGrooming Logo" 
            className="w-full h-full object-contain shrink-0 scale-[2.2] md:scale-[2.5]" 
          />
        </div>
        <div className="text-left">
          <h1 className="text-lg md:text-2xl font-extrabold premium-text-vibrant notranslate">
            CegahGrooming
          </h1>
        </div>
      </div>
      <div className="flex gap-4 md:gap-8">
        <Link 
          href="/" 
          className={`text-[11px] md:text-xs font-bold uppercase tracking-widest transition-all ${pathname === "/" ? "text-blue-400" : "text-slate-400 hover:text-white"}`}
        >
          Beranda
        </Link>
        <Link 
          href="/detector" 
          className={`text-[11px] md:text-xs font-bold uppercase tracking-widest transition-all ${pathname === "/detector" ? "text-blue-400" : "text-slate-400 hover:text-white"}`}
        >
          Alat Deteksi
        </Link>
        <Link 
          href="/history" 
          className={`text-[11px] md:text-xs font-bold uppercase tracking-widest transition-all ${pathname === "/history" ? "text-blue-400" : "text-slate-400 hover:text-white"}`}
        >
          Riwayat Log
        </Link>
      </div>
    </nav>
  );
}
