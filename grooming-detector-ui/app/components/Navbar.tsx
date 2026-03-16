"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-10 border-b border-slate-700 pb-4 md:pb-6 gap-3 md:gap-0">
      <div className="flex items-center gap-3">
        <img 
          src="/logo.png" 
          alt="CegahGrooming Logo" 
          className="w-10 h-10 md:w-12 md:h-12 object-contain"
        />
        <div className="text-left">
          <h1 
            className="text-lg md:text-2xl font-extrabold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text [-webkit-background-clip:text] text-transparent notranslate"
            style={{ 
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: '#60a5fa' 
            }}
          >
            CegahGrooming
          </h1>
        </div>
      </div>
      <div className="flex gap-4 md:gap-8">
        <Link 
          href="/" 
          className={`text-[11px] md:text-xs font-bold uppercase tracking-widest transition-all ${pathname === "/" ? "text-blue-400" : "text-slate-400 hover:text-white"}`}
        >
          Detector
        </Link>
        <Link 
          href="/history" 
          className={`text-[11px] md:text-xs font-bold uppercase tracking-widest transition-all ${pathname === "/history" ? "text-blue-400" : "text-slate-400 hover:text-white"}`}
        >
          History Log
        </Link>
      </div>
    </nav>
  );
}
