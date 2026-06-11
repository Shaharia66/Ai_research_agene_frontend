import React, { useState } from "react";
import { FiDownload, FiLoader } from "react-icons/fi";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function PDFDownload({ reportRef, topic, report }) {
  const [generating, setGenerating] = useState(false);

  const handleDownload = async () => {
    if (!reportRef.current || generating) return;
    setGenerating(true);
    try {
      const el = reportRef.current;
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 900,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.92);
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      const ih = (canvas.height * pw) / canvas.width;
      const pages = Math.ceil(ih / ph);

      for (let i = 0; i < pages; i++) {
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, -i * ph, pw, ih, undefined, "FAST");
      }

      const safe = topic.replace(/[^a-z0-9]/gi, "-").toLowerCase().slice(0, 40);
      const date = new Date().toISOString().slice(0, 10);
      pdf.save(`research-${safe}-${date}.pdf`);
    } catch (err) {
      console.error("PDF error:", err);
      alert("PDF generation failed. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  if (!report) return null;

  return (
    <button
      onClick={handleDownload}
      disabled={generating}
      className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm text-sm"
    >
      {generating
        ? <><FiLoader className="w-4 h-4 animate-spin" /> Generating...</>
        : <><FiDownload className="w-4 h-4" /> Download PDF</>
      }
    </button>
  );
}
