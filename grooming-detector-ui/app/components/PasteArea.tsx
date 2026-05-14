"use client";
import { useRef } from "react";

interface PasteAreaProps {
  onMessagesReady: (messages: string[]) => void;
  loading: boolean;
}

export default function PasteArea({ onMessagesReady, loading }: PasteAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parsing logika untuk file .txt (dipertahankan dari InputArea lama)
  const parseTextContent = (rawContent: string): string[] => {
    return rawContent
      .split("\n")
      .map((line) => {
        // Hapus timestamp WhatsApp
        let clean = line.replace(
          /^\[\d{2}\/\d{2}\/\d{2}\s\d{2}\.\d{2}\.\d{2}\]\s/,
          ""
        );
        // Hapus nama pengirim (format "Nama: pesan")
        if (clean.includes(": ")) clean = clean.split(": ").slice(1).join(": ");

        // Filter system messages
        const systemMessages = [
          "Pesan dan panggilan terenkripsi",
          "image omitted",
          "sticker omitted",
          "Pesan ini dihapus",
          "https://",
          "http://",
          "www.",
        ];
        const isSystem = systemMessages.some((msg) =>
          clean.toLowerCase().includes(msg.toLowerCase())
        );
        return isSystem ? "" : clean.trim();
      })
      .filter((line) => line !== "");
  };

  const handlePasteFromClipboard = async () => {
    if (loading) return;
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (!clipboardText || !clipboardText.trim()) {
        alert("Clipboard kosong. Salin percakapan terlebih dahulu.");
        return;
      }
      const messages = parseTextContent(clipboardText);
      if (messages.length < 2) {
        alert("Masukkan minimal 2 baris percakapan untuk memulai analisis alur.");
        return;
      }
      onMessagesReady(messages);
    } catch {
      alert("Gagal membaca clipboard. Pastikan Anda telah menyalin teks dan mengizinkan akses clipboard.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const rawContent = event.target?.result as string;
      const messages = parseTextContent(rawContent);
      if (messages.length < 2) {
        alert("File harus berisi minimal 2 baris percakapan.");
        return;
      }
      onMessagesReady(messages);
    };
    reader.readAsText(file);
    // Reset file input agar bisa upload file yang sama lagi
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 px-4">
      {/* Icon & Title */}
      <div className="text-center space-y-4">
        <div className="mx-auto w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-gradient-to-br from-blue-600/20 to-violet-600/20 border border-blue-500/20 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 md:w-12 md:h-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-black premium-text-blue notranslate">
            Analisis Percakapan
          </h2>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-2 max-w-md mx-auto">
            Salin log chat dari WhatsApp, Notepad, atau sumber lainnya, lalu klik tombol di bawah untuk memulai analisis.
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col items-center gap-4 w-full max-w-md">
        {/* Tombol Utama: Paste dari Clipboard */}
        <button
          onClick={handlePasteFromClipboard}
          disabled={loading}
          className="w-full py-4 md:py-5 rounded-2xl font-black text-base md:text-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-900/30 text-white"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>MEMPROSES...</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              PASTE PERCAKAPAN
            </>
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 w-full">
          <div className="flex-1 h-px bg-slate-700" />
          <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">atau</span>
          <div className="flex-1 h-px bg-slate-700" />
        </div>

        {/* Tombol Sekunder: Upload File */}
        <label className="w-full flex items-center justify-center gap-2 py-3 md:py-4 bg-slate-800/80 border border-slate-700 rounded-2xl cursor-pointer hover:border-blue-500/50 hover:bg-slate-800 transition-all text-slate-400 hover:text-blue-400 font-bold text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Upload File (.txt)
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt"
            className="hidden"
            onChange={handleFileUpload}
          />
        </label>
      </div>
    </div>
  );
}
