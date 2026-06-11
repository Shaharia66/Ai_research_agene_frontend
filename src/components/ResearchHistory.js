import React from "react";
import { FiClock, FiTrash2, FiFileText } from "react-icons/fi";

export default function ResearchHistory({ history, onSelect, onClear }) {
  if (!history || history.length === 0) {
    return (
      <div className="text-center py-10 px-3">
        <FiClock className="w-7 h-7 text-slate-300 mx-auto mb-2" />
        <p className="text-xs text-slate-400 leading-relaxed">Your last 5 searches appear here</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">History</span>
        <button
          onClick={onClear}
          className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors"
        >
          <FiTrash2 className="w-3 h-3" /> Clear
        </button>
      </div>
      <div className="space-y-2">
        {history.map((item, i) => (
          <button
            key={i}
            onClick={() => onSelect(item)}
            className="w-full text-left p-3 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all group"
          >
            <div className="flex items-start gap-2">
              <FiFileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 flex-shrink-0 mt-0.5 transition-colors" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-700 truncate">{item.topic}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{item.date}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
