"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col md:flex-row justify-between items-center mb-10 border-b border-slate-700 pb-6 gap-4 md:gap-0">
      <div className="text-center md:text-left">
        <h1 className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
          Grooming Intelligence
        </h1>
      </div>
      <div className="flex gap-4 md:gap-6">
        <Link 
          href="/" 
          className={`text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all ${pathname === "/" ? "text-blue-400" : "text-slate-400 hover:text-white"}`}
        >
          Detector
        </Link>
        <Link 
          href="/history" 
          className={`text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all ${pathname === "/history" ? "text-blue-400" : "text-slate-400 hover:text-white"}`}
        >
          History Log
        </Link>
      </div>
    </nav>
  );
}
