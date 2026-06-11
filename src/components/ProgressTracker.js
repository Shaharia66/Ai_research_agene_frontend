import React from "react";
import { FiMap, FiBookOpen, FiZap, FiEdit3, FiCheckCircle, FiLoader, FiRefreshCw } from "react-icons/fi";

const STEPS = [
  { id: 1, label: "Plan",     desc: "Research Planner",   icon: FiMap,          pct: 20 },
  { id: 2, label: "Research", desc: "Domain Researcher",  icon: FiBookOpen,     pct: 40 },
  { id: 3, label: "Analyze",  desc: "Insight Analyst",    icon: FiZap,          pct: 65 },
  { id: 4, label: "Write",    desc: "Report Author",      icon: FiEdit3,        pct: 85 },
  { id: 5, label: "Done",     desc: "LangGraph Finalize", icon: FiCheckCircle,  pct: 100 },
];

export default function ProgressTracker({ currentStep, stepResults, isLoading }) {
  const hasAny = Object.keys(stepResults || {}).length > 0;
  if (!isLoading && !hasAny) return null;

  const activeStep = STEPS.find((s) => s.id === currentStep);
  const pct = activeStep?.pct ?? (hasAny && !isLoading ? 100 : 0);
  const isRetrying = Object.values(stepResults || {}).some((s) => s?.message?.includes("retrying"));

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          {isRetrying && <FiRefreshCw className="w-4 h-4 text-amber-500 animate-spin" />}
          {isLoading
            ? isRetrying ? "Quality gate triggered — retrying..." : "LangGraph workflow running..."
            : "Research complete"}
        </span>
        <span className="text-sm font-bold text-blue-600">{pct}%</span>
      </div>
      {/* Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2 mb-5 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Step nodes */}
      <div className="flex items-center gap-1">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const result = stepResults?.[step.id];
          const isActive = currentStep === step.id && isLoading;
          const isDone = result?.status === "done" || (!isLoading && hasAny && step.id <= 5);
          const isLast = i === STEPS.length - 1;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                {/* Circle */}
                <div className={`relative w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                  isActive
                    ? "border-blue-500 bg-blue-50"
                    : isDone
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-slate-200 bg-white opacity-40"
                }`}>
                  {isActive
                    ? <FiLoader className="w-4 h-4 text-blue-600 animate-spin" />
                    : isDone
                    ? <FiCheckCircle className="w-4 h-4 text-emerald-600" />
                    : <Icon className="w-4 h-4 text-slate-400" />
                  }
                </div>
                {/* Label */}
                <span className={`text-[10px] font-medium text-center leading-tight w-14 ${
                  isActive ? "text-blue-600" : isDone ? "text-emerald-600" : "text-slate-400"
                }`}>
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div className={`flex-1 h-0.5 mb-5 rounded transition-all ${
                  isDone && stepResults?.[STEPS[i + 1]?.id] ? "bg-emerald-400" : "bg-slate-200"
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Current message */}
      {isLoading && activeStep && (
        <p className="text-xs text-slate-500 mt-3 text-center">
          {stepResults?.[currentStep]?.message || `Step ${currentStep}: ${activeStep.desc} is running...`}
        </p>
      )}
    </div>
  );
}
