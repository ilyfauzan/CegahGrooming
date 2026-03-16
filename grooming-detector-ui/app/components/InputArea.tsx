"use client";

interface InputAreaProps {
  activeTab: "single" | "window";
  inputText: string;
  setInputText: (val: string) => void;
  onAnalyze: () => void;
  loading: boolean;
}

export default function InputArea({
  activeTab,
  inputText,
  setInputText,
  onAnalyze,
  loading,
}: InputAreaProps) {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawContent = event.target?.result as string;
      const cleanLines = rawContent
        .split("\n")
        .map((line) => {
          let clean = line.replace(
            /^\[\d{2}\/\d{2}\/\d{2}\s\d{2}\.\d{2}\.\d{2}\]\s/,
            "",
          );
          if (clean.includes(": "))
            clean = clean.split(": ").slice(1).join(": ");

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
            clean.toLowerCase().includes(msg.toLowerCase()),
          );
          return isSystem ? null : clean.trim();
        })
        .filter((line) => line !== null && line !== "");

      setInputText(cleanLines.join("\n"));
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-md p-5 md:p-8 rounded-3xl border border-slate-700 shadow-2xl">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-bold mb-2 text-blue-400">
            {activeTab === "single"
              ? "Analisis Kalimat"
              : "Analisis Alur Konteks"}
          </h2>

          <p className="text-xs text-slate-500 font-medium italic">
            {activeTab === "single"
              ? "Input satu kalimat untuk deteksi cepat."
              : "Input riwayat percakapan atau upload file untuk deteksi pola."}
          </p>
        </div>
        <label className="shrink-0 flex items-center gap-2 px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-xl cursor-pointer hover:border-blue-500 transition-all text-slate-500">
          <span className="text-[10px] font-bold uppercase tracking-widest">
            Upload .txt
          </span>
          <input
            type="file"
            accept=".txt"
            className="hidden"
            onChange={handleFileUpload}
          />
        </label>
      </div>
      <textarea
        className="w-full h-48 p-6 bg-slate-900/80 border border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-white font-mono placeholder:text-slate-600 resize-none"
        value={inputText}
        onChange={(e) => {
          // Menghapus semua karakter yang BUKAN huruf, angka, atau spasi
          const cleaned = e.target.value.replace(/[^a-zA-Z0-9\s]/g, "");
          setInputText(cleaned);
        }}
        placeholder="Masukkan teks..."
      />
      <button
        onClick={onAnalyze}
        disabled={loading}
        className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 py-4 rounded-2xl font-bold text-lg active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-3"
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>MEMPROSES...</span>
          </>
        ) : (
          "ANALISIS"
        )}
      </button>
    </div>
  );
}
