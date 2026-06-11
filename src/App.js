import React, { useState, useRef, useEffect, useCallback } from "react";
import SearchBar from "./components/SearchBar";
import AgentPanel from "./components/AgentPanel";
import ProgressTracker from "./components/ProgressTracker";
import ReportDisplay from "./components/ReportDisplay";
import ResearchHistory from "./components/ResearchHistory";
import PDFDownload from "./components/PDFDownload";
import { FiActivity, FiMenu, FiX, FiAlertTriangle, FiGitBranch, FiUsers } from "react-icons/fi";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";
const HISTORY_KEY = "research_agent_v2_history";

export default function App() {
  const [isLoading, setIsLoading]       = useState(false);
  const [currentStep, setCurrentStep]   = useState(0);
  const [stepResults, setStepResults]   = useState({});
  const [report, setReport]             = useState(null);
  const [currentTopic, setCurrentTopic] = useState("");
  const [error, setError]               = useState(null);
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [history, setHistory]           = useState(() => {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); }
    catch { return []; }
  });

  const reportRef = useRef(null);
  const xhrRef    = useRef(null);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  const saveHistory = useCallback((topic, report) => {
    const entry = {
      topic,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      report,
    };
    setHistory(prev => [entry, ...prev.filter(h => h.topic !== topic)].slice(0, 5));
  }, []);

  const handleSearch = useCallback((topic) => {
    // Cancel any existing request
    if (xhrRef.current) {
      xhrRef.current.abort();
    }

    setIsLoading(true);
    setCurrentTopic(topic);
    setCurrentStep(1);
    setStepResults({});
    setReport(null);
    setError(null);

    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;

    let buffer = "";

    xhr.open("POST", `${API_URL}/research`, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Accept", "text/event-stream");

    // This fires every time NEW data arrives — key for SSE
    xhr.onprogress = () => {
      // Get only the new data since last read
      const newData = xhr.responseText.slice(buffer.length);
      buffer = xhr.responseText;

      // Split into lines and process each SSE event
      const lines = newData.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const raw = trimmed.slice(5).trim();
        if (!raw) continue;

        try {
          const data = JSON.parse(raw);

          if (data.status === "error") {
            setError(data.message || "Research failed");
            setIsLoading(false);
            setCurrentStep(0);
            return;
          }

          if (data.status === "complete") {
            setIsLoading(false);
            setCurrentStep(0);
            return;
          }

          if (data.step > 0) {
            setCurrentStep(data.step);
            setStepResults(prev => ({
              ...prev,
              [data.step]: {
                status:  data.status,
                message: data.message,
                result:  data.result,
              },
            }));

            if (data.report) {
              setReport(data.report);
              saveHistory(topic, data.report);
              setTimeout(() => {
                reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
              }, 300);
            }
          }
        } catch (e) {
          // skip malformed lines
        }
      }
    };

    xhr.onload = () => {
      setIsLoading(false);
      setCurrentStep(0);
    };

    xhr.onerror = () => {
      setError("Could not connect to backend. Is it running on port 8000?");
      setIsLoading(false);
      setCurrentStep(0);
    };

    xhr.ontimeout = () => {
      setError("Request timed out. Please try again.");
      setIsLoading(false);
      setCurrentStep(0);
    };

    xhr.timeout = 300000; // 5 minutes

    xhr.send(JSON.stringify({ topic }));
  }, [saveHistory]);

  const handleHistorySelect = (item) => {
    setCurrentTopic(item.topic);
    setReport(item.report);
    setStepResults({});
    setCurrentStep(0);
    setError(null);
    setSidebarOpen(false);
    setTimeout(() => reportRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
              <FiActivity className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 text-sm leading-tight">AI Research Agent</span>
              <span className="hidden sm:flex items-center gap-2 text-[10px] text-slate-400">
                <span className="flex items-center gap-1"><FiUsers className="w-3 h-3" /> CrewAI</span>
                <span>·</span>
                <span className="flex items-center gap-1"><FiGitBranch className="w-3 h-3" /> LangGraph</span>
                <span>·</span>
                <span>LLaMA 3.3</span>
              </span>
            </div>
          </div>
          <button className="md:hidden p-2 text-slate-500" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 gap-5">
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-20 w-64 bg-white border-r border-slate-200 p-4 pt-20 overflow-y-auto transition-transform shadow-xl
          md:relative md:inset-auto md:z-auto md:translate-x-0 md:w-56 md:flex-shrink-0 md:rounded-2xl md:border md:shadow-sm md:self-start md:sticky md:top-20 md:p-4
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}>
          <ResearchHistory
            history={history}
            onSelect={handleHistorySelect}
            onClear={() => { setHistory([]); localStorage.removeItem(HISTORY_KEY); }}
          />
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 z-10 bg-black/30 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main */}
        <main className="flex-1 min-w-0 space-y-5">
          {/* Search card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Multi-Agent Research</h1>
                <p className="text-sm text-slate-500 mt-1">
                  4 specialized AI agents — planner, researcher, analyst, writer
                </p>
              </div>
              <div className="hidden sm:flex flex-col gap-1 flex-shrink-0 ml-4">
                <span className="text-[10px] font-semibold text-violet-700 bg-violet-100 px-2 py-0.5 rounded-full text-center">CrewAI</span>
                <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full text-center">LangGraph</span>
              </div>
            </div>
            <SearchBar onSearch={handleSearch} isLoading={isLoading} />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
              <FiAlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700">Research failed</p>
                <p className="text-sm text-red-600 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Agent cards */}
          <AgentPanel currentStep={currentStep} stepResults={stepResults} isLoading={isLoading} />

          {/* Progress */}
          <ProgressTracker currentStep={currentStep} stepResults={stepResults} isLoading={isLoading} />

          {/* Report */}
          {report && (
            <div>
              <div className="flex items-center justify-between mb-3 no-print">
                <div>
                  <h2 className="font-semibold text-slate-900">Final Report</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{currentTopic}</p>
                </div>
                <PDFDownload reportRef={reportRef} topic={currentTopic} report={report} />
              </div>
              <ReportDisplay report={report} reportRef={reportRef} />
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !report && !error && (
            <div className="text-center py-24 text-slate-400">
              <div className="w-16 h-16 rounded-2xl bg-slate-200 flex items-center justify-center mx-auto mb-4">
                <FiActivity className="w-8 h-8 opacity-50" />
              </div>
              <p className="font-medium text-slate-500">Enter a topic to begin</p>
              <p className="text-sm mt-1 max-w-sm mx-auto">
                4 AI agents will collaborate to research, analyze, and write a full report
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}