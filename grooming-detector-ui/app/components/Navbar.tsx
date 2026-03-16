"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="flex justify-between items-center mb-10 border-b border-slate-700 pb-6">
      <div>
        <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
          Grooming Intelligence
        </h1>
      </div>
      <div className="flex gap-6">
        <Link 
          href="/" 
          className={`text-xs font-bold uppercase tracking-widest transition-all ${pathname === "/" ? "text-blue-400" : "text-slate-400 hover:text-white"}`}
        >
          Detector
        </Link>
        <Link 
          href="/history" 
          className={`text-xs font-bold uppercase tracking-widest transition-all ${pathname === "/history" ? "text-blue-400" : "text-slate-400 hover:text-white"}`}
        >
          History Log
        </Link>
      </div>
    </nav>
  );
}
