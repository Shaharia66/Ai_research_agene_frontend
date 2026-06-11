import React, { useState } from "react";
import { FiSearch, FiLoader, FiCpu } from "react-icons/fi";

const EXAMPLES = [
  "The future of artificial general intelligence",
  "Impact of CRISPR gene editing on medicine",
  "Economics of the green energy transition",
  "Quantum computing and cryptography",
  "Urbanization trends in Southeast Asia",
];

export default function SearchBar({ onSearch, isLoading }) {
  const [topic, setTopic] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (topic.trim() && !isLoading) onSearch(topic.trim());
  };

  return (
    <div className="w-full">
      <form onSubmit={submit} className="flex gap-3">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter any research topic..."
            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-white shadow-sm text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400 transition"
            disabled={isLoading}
            maxLength={500}
          />
        </div>
        <button
          type="submit"
          disabled={!topic.trim() || isLoading}
          className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-sm transition-all flex items-center gap-2 whitespace-nowrap text-sm"
        >
          {isLoading ? (
            <><FiLoader className="w-4 h-4 animate-spin" /> Running agents...</>
          ) : (
            <><FiCpu className="w-4 h-4" /> Start Research</>
          )}
        </button>
      </form>

      {!isLoading && (
        <div className="mt-3 flex flex-wrap gap-2 items-center">
          <span className="text-xs text-slate-400">Try:</span>
          {EXAMPLES.map((t) => (
            <button
              key={t}
              onClick={() => setTopic(t)}
              className="text-xs px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600 transition-colors"
            >
              {t.length > 42 ? t.slice(0, 40) + "…" : t}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
