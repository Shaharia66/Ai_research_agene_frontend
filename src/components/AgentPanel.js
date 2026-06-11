import React from "react";
import { FiMap, FiBookOpen, FiZap, FiEdit3, FiCheck, FiLoader } from "react-icons/fi";

const AGENTS = [
  {
    id: 1,
    name: "Research Planner",
    role: "Decomposes topic into 5 focused subtopics",
    icon: FiMap,
    color: "violet",
  },
  {
    id: 2,
    name: "Domain Researcher",
    role: "Deep-dives each subtopic with facts & data",
    icon: FiBookOpen,
    color: "blue",
  },
  {
    id: 3,
    name: "Insight Analyst",
    role: "Extracts 5 data-backed key insights",
    icon: FiZap,
    color: "amber",
  },
  {
    id: 4,
    name: "Report Author",
    role: "Writes the full structured JSON report",
    icon: FiEdit3,
    color: "emerald",
  },
];

const COLOR_MAP = {
  violet: {
    bg: "bg-violet-50",
    border: "border-violet-200",
    icon: "bg-violet-100 text-violet-600",
    active: "border-violet-400 bg-violet-50 shadow-violet-100",
    done: "border-emerald-200 bg-emerald-50",
    badge: "bg-violet-100 text-violet-700",
  },
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: "bg-blue-100 text-blue-600",
    active: "border-blue-400 bg-blue-50 shadow-blue-100",
    done: "border-emerald-200 bg-emerald-50",
    badge: "bg-blue-100 text-blue-700",
  },
  amber: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: "bg-amber-100 text-amber-600",
    active: "border-amber-400 bg-amber-50 shadow-amber-100",
    done: "border-emerald-200 bg-emerald-50",
    badge: "bg-amber-100 text-amber-700",
  },
  emerald: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: "bg-emerald-100 text-emerald-600",
    active: "border-emerald-400 bg-emerald-50 shadow-emerald-100",
    done: "border-emerald-200 bg-emerald-50",
    badge: "bg-emerald-100 text-emerald-700",
  },
};

export default function AgentPanel({ currentStep, stepResults, isLoading }) {
  const isDone = !isLoading && stepResults && Object.values(stepResults).some((s) => s?.status === "done");

  if (!isLoading && !isDone) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Active Agents</h2>
        <div className="flex-1 h-px bg-slate-200" />
        {isLoading && (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium animate-pulse">
            LangGraph orchestrating...
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {AGENTS.map((agent) => {
          const c = COLOR_MAP[agent.color];
          const Icon = agent.icon;
          const result = stepResults?.[agent.id];
          const isActive = currentStep === agent.id && isLoading;
          const isDoneStep = result?.status === "done";
          const isPending = !isActive && !isDoneStep;

          return (
            <div
              key={agent.id}
              className={`agent-card relative rounded-xl border p-4 transition-all shadow-sm ${
                isActive
                  ? `${c.active} shadow-md`
                  : isDoneStep
                  ? c.done
                  : `${c.bg} ${c.border} opacity-40`
              }`}
            >
              {/* Status badge */}
              <div className="absolute top-3 right-3">
                {isActive && (
                  <span className="flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                    <FiLoader className="w-3 h-3 animate-spin" /> Active
                  </span>
                )}
                {isDoneStep && (
                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    <FiCheck className="w-3 h-3" /> Done
                  </span>
                )}
              </div>

              {/* Icon */}
              <div className={`relative w-10 h-10 rounded-xl ${c.icon} flex items-center justify-center mb-3 ${isActive ? "pulse-ring" : ""}`}>
                <Icon className="w-5 h-5" />
              </div>

              <p className="font-semibold text-slate-800 text-sm leading-tight">{agent.name}</p>
              <p className="text-xs text-slate-500 mt-1 leading-snug">{agent.role}</p>

              {isDoneStep && result?.message && (
                <p className="text-xs text-emerald-600 mt-2 font-medium truncate">{result.message}</p>
              )}
              {isActive && (
                <p className="text-xs text-blue-500 mt-2 animate-pulse truncate">{result?.message || "Working..."}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
