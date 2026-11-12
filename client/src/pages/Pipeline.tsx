/*
 * Pipeline Page — Interactive CRISPR Analysis Workflow
 * 8-stage pipeline with progress tracking, stage-specific panels,
 * clean form controls (labels above, helper text below), and Phosphor icons.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { generateTargetXPdfReport } from "@/lib/generatePdfReport";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Brain,
  Dna,
  Target,
  Flask,
  ChartBar,
  ShieldCheck,
  Sparkle,
  FileText,
  Play,
  CheckCircle,
  CircleNotch,
  ArrowClockwise,
  DownloadSimple,
  Copy,
} from "@phosphor-icons/react";
import { toast } from "sonner";

const stages = [
  { id: 0, icon: Brain, label: "AI Parsing" },
  { id: 1, icon: Dna, label: "Gene ID" },
  { id: 2, icon: Target, label: "PAM Scan" },
  { id: 3, icon: Flask, label: "gRNA Pool" },
  { id: 4, icon: ChartBar, label: "Efficiency" },
  { id: 5, icon: ShieldCheck, label: "Off-target" },
  { id: 6, icon: Sparkle, label: "SHAP" },
  { id: 7, icon: FileText, label: "Report" },
];

type PipelineStatus = "idle" | "running" | "complete";

interface StageResult {
  status: "pending" | "running" | "complete" | "error";
  data?: Record<string, unknown>;
}

export default function Pipeline() {
  const [goal, setGoal] = useState(
    "Improve drought resistance in rice (Oryza sativa) by targeting ABA signaling pathways"
  );
  const [customSequence, setCustomSequence] = useState("");
  const [inputMode, setInputMode] = useState<"nlp" | "gene" | "sequence">("nlp");
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus>("idle");
  const [currentStage, setCurrentStage] = useState(-1);
  const [stageResults, setStageResults] = useState<StageResult[]>(
    stages.map(() => ({ status: "pending" }))
  );

  const runPipeline = () => {
    setPipelineStatus("running");
    setStageResults(stages.map(() => ({ status: "pending" })));
    setCurrentStage(0);

    let stage = 0;
    const interval = setInterval(() => {
      setStageResults((prev) => {
        const next = [...prev];
        next[stage] = { status: "complete", data: {} };
        return next;
      });

      stage++;
      setCurrentStage(stage);

      if (stage >= stages.length) {
        clearInterval(interval);
        setPipelineStatus("complete");
        toast.success("8-Stage CRISPR Analysis Pipeline Execution Complete!");
      }
    }, 1200);
  };

  const resetPipeline = () => {
    setPipelineStatus("idle");
    setCurrentStage(-1);
    setStageResults(stages.map(() => ({ status: "pending" })));
  };

  const downloadReport = () => {
    try {
      generateTargetXPdfReport({
        reportTitle: "TargetX CRISPR Analysis Pipeline Report",
        goal,
        targetGene: inputMode === "gene" ? goal : "OsDREB1A / TP53",
        organism: "Homo sapiens / Oryza sativa",
      });
      toast.success("TargetX CRISPR Research PDF Report downloaded!");
    } catch (err) {
      console.error("PDF download error:", err);
      toast.error("Failed to generate PDF report.");
    }
  };

  const copyData = () => {
    navigator.clipboard.writeText(
      JSON.stringify(
        { goal, status: "complete", topGuide: "ATGGAACGTTCTAGCCGTCA", score: 0.92 },
        null,
        2
      )
    );
    toast.success("Copied candidate data to clipboard!");
  };

  return (
    <div className="flex min-h-[100dvh] circuit-bg">
      <Sidebar />

      <main className="flex-1 min-w-0 flex flex-col min-h-[100dvh]">
        <TopBar
          title="Analysis Pipeline"
          subtitle="CRISPR-Cas9 Guide RNA Design Workflow"
          pipelineStage={
            pipelineStatus === "running"
              ? `Stage ${currentStage + 1}/8`
              : pipelineStatus === "complete"
              ? "Complete"
              : "Ready"
          }
        />

        <div className="mx-auto w-full max-w-[1440px] px-6 md:px-10 xl:px-12 py-10 md:py-16">
          {/* Stepper Progress Bar */}
          <div className="tx-card p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="font-sans text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Workflow Progress
              </span>
              <span className="font-mono text-xs text-zinc-600">
                {pipelineStatus === "running"
                  ? `Running stage ${currentStage + 1} of 8...`
                  : pipelineStatus === "complete"
                  ? "All 8 stages executed successfully"
                  : "Awaiting execution trigger"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {stages.map((stage, i) => {
                const result = stageResults[i];
                const isActive = i === currentStage && pipelineStatus === "running";
                const isComplete = result.status === "complete";
                const Icon = stage.icon;

                return (
                  <div key={stage.id} className="flex items-center flex-1">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-200 ${
                        isComplete
                          ? "bg-white border-[#0F766E] text-[#0F766E] shadow-2xs"
                          : isActive
                          ? "bg-white border-[#0F766E] ring-2 ring-[#0F766E]/20 text-[#0F766E]"
                          : "bg-white border-zinc-200/80 text-zinc-400"
                      }`}
                      title={stage.label}
                    >
                      {isComplete ? (
                        <CheckCircle size={18} weight="fill" className="text-[#0F766E]" />
                      ) : isActive ? (
                        <CircleNotch size={18} weight="regular" className="text-[#0F766E] animate-spin" />
                      ) : (
                        <Icon size={18} weight="regular" />
                      )}
                    </div>
                    {i < stages.length - 1 && (
                      <div
                        className={`flex-1 h-[2px] mx-1 transition-colors duration-300 ${
                          isComplete ? "bg-[#0F766E]" : "bg-zinc-200"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between mt-3 px-0.5">
              {stages.map((s) => (
                <span
                  key={s.id}
                  className="text-[11px] font-sans font-medium text-zinc-600 w-12 text-center truncate"
                >
                  {s.label}
                </span>
              ))}
            </div>
          </div>

          {/* Goal Input Section: Labels above, gap-2, helper text below */}
          <div className="tx-card p-6 md:p-8 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-zinc-200/60">
              <div>
                <h3 className="font-sans text-base font-semibold text-zinc-950 flex items-center gap-2">
                  <Brain size={18} weight="regular" className="text-[#0F766E]" />
                  Biological Target Specification
                </h3>
                <p className="font-sans text-xs text-zinc-500 mt-0.5">
                  Specify your research objective, target gene identifier, or raw sequence.
                </p>
              </div>

              {/* Input Mode Selector */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100 border border-zinc-200/60">
                {(
                  [
                    { id: "nlp", label: "Natural Language" },
                    { id: "gene", label: "Gene Symbol" },
                    { id: "sequence", label: "DNA Sequence" },
                  ] as const
                ).map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setInputMode(mode.id)}
                    className={`px-3 py-1.5 text-xs font-sans font-medium rounded-lg transition-all ${
                      inputMode === mode.id
                        ? "bg-white text-zinc-950 font-semibold shadow-2xs border border-zinc-200/80"
                        : "text-zinc-600 hover:text-zinc-950"
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form with clean labels and helper text */}
            <div className="space-y-4">
              {inputMode === "nlp" && (
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="goal-textarea"
                    className="font-sans text-xs font-semibold text-zinc-900"
                  >
                    Natural Language Research Objective
                  </label>
                  <Textarea
                    id="goal-textarea"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="Describe your editing intent (e.g., target OsDREB1A to enhance osmotic tolerance in Oryza sativa)..."
                    className="bg-white border-zinc-200/80 rounded-xl text-zinc-900 font-sans text-sm focus-visible:ring-2 focus-visible:ring-[#0F766E] min-h-[96px] shadow-2xs"
                  />
                  <span className="font-sans text-xs text-zinc-500">
                    The NLP parser extracts organism, gene symbol, and knock-out/knock-in intent automatically.
                  </span>
                </div>
              )}

              {inputMode === "sequence" && (
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="sequence-textarea"
                    className="font-sans text-xs font-semibold text-zinc-900"
                  >
                    Target Genomic DNA Sequence (FASTA or Raw)
                  </label>
                  <Textarea
                    id="sequence-textarea"
                    value={customSequence}
                    onChange={(e) => setCustomSequence(e.target.value)}
                    placeholder="Paste 5' to 3' nucleotide sequence (A, C, G, T)..."
                    className="bg-white border-zinc-200/80 rounded-xl text-zinc-900 font-mono text-xs focus-visible:ring-2 focus-visible:ring-[#0F766E] min-h-[96px] uppercase shadow-2xs"
                  />
                  <span className="font-sans text-xs text-zinc-500">
                    Supports up to 50,000 base pairs. PAM sites (NGG) will be identified on both strands.
                  </span>
                </div>
              )}

              {inputMode === "gene" && (
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="gene-input"
                    className="font-sans text-xs font-semibold text-zinc-900"
                  >
                    Gene Symbol or Transcript ID
                  </label>
                  <Input
                    id="gene-input"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="e.g., OsDREB1A, TP53, BRCA1, CASP3"
                    className="bg-white border-zinc-200/80 rounded-xl text-zinc-900 font-sans text-sm focus-visible:ring-2 focus-visible:ring-[#0F766E] shadow-2xs"
                  />
                  <span className="font-sans text-xs text-zinc-500">
                    Matches official NCBI Entrez and Ensembl reference databases.
                  </span>
                </div>
              )}

              {/* Parameters & Action Buttons */}
              <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-t border-zinc-200/60">
                <div className="flex flex-wrap items-center gap-4 text-xs font-sans text-zinc-600">
                  <span>
                    PAM: <strong className="text-zinc-950 font-medium">SpCas9 (NGG)</strong>
                  </span>
                  <span className="text-zinc-300">·</span>
                  <span>
                    Organism: <strong className="text-zinc-950 font-medium">Oryza sativa / Homo sapiens</strong>
                  </span>
                  <span className="text-zinc-300">·</span>
                  <span>
                    Model Ensemble: <strong className="text-[#0F766E] font-medium">XGBoost + LightGBM + RF</strong>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {pipelineStatus === "running" ? (
                    <button
                      disabled
                      className="tx-btn-primary px-5 h-11 text-xs font-medium flex items-center gap-2 opacity-80 cursor-not-allowed"
                    >
                      <CircleNotch size={15} weight="regular" className="animate-spin text-[#0F766E]" />
                      Running Pipeline...
                    </button>
                  ) : pipelineStatus === "complete" ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={resetPipeline}
                        className="tx-btn-secondary px-4 h-11 text-xs font-medium flex items-center gap-1.5"
                      >
                        <ArrowClockwise size={15} weight="regular" />
                        Reset
                      </button>
                      <button
                        onClick={downloadReport}
                        className="tx-btn-primary px-5 h-11 text-xs font-medium flex items-center gap-2"
                      >
                        <DownloadSimple size={15} weight="regular" />
                        Download Report
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={runPipeline}
                      className="tx-btn-primary px-6 h-11 text-xs font-medium flex items-center gap-2 shadow-sm"
                    >
                      <Play size={15} weight="fill" className="text-white" />
                      Launch Pipeline
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Active Pipeline Stage Detail Cards */}
          <AnimatePresence mode="wait">
            {pipelineStatus !== "idle" && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8"
              >
                {/* Stage 1: AI Parsing */}
                <div
                  className={`tx-card p-6 transition-opacity duration-300 ${
                    stageResults[0].status !== "complete" ? "opacity-30" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Brain size={18} weight="regular" className="text-[#0F766E]" />
                      <h4 className="font-sans text-sm font-semibold text-zinc-950">
                        AI Goal Parsing
                      </h4>
                    </div>
                    {stageResults[0].status === "complete" && (
                      <CheckCircle size={16} weight="fill" className="text-[#0F766E]" />
                    )}
                  </div>
                  {stageResults[0].status === "complete" && (
                    <div className="space-y-2.5 text-xs">
                      <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70">
                        <span className="text-zinc-500 font-sans block mb-1">
                          Mapped Genes
                        </span>
                        <span className="font-mono font-semibold text-zinc-950">
                          OsDREB1A, OsNAC6, OsLEA3
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70">
                        <span className="text-zinc-500 font-sans block mb-1">
                          Primary Reference Locus
                        </span>
                        <span className="font-mono text-zinc-800">
                          OsDREB1A (LOC_Os09g35010)
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stage 2: PAM Detection */}
                <div
                  className={`tx-card p-6 transition-opacity duration-300 ${
                    stageResults[2].status !== "complete" ? "opacity-30" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Target size={18} weight="regular" className="text-[#0F766E]" />
                      <h4 className="font-sans text-sm font-semibold text-zinc-950">
                        PAM Scanning
                      </h4>
                    </div>
                    {stageResults[2].status === "complete" && (
                      <CheckCircle size={16} weight="fill" className="text-[#0F766E]" />
                    )}
                  </div>
                  {stageResults[2].status === "complete" && (
                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-200/70">
                        <span className="font-sans text-zinc-500">Detected PAM Sites</span>
                        <span className="font-mono font-semibold text-zinc-950">23 sites</span>
                      </div>
                      <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70 font-mono text-[11px] text-zinc-900 overflow-x-auto">
                        5' ATGGAACGTTCTAGCCGTCA <strong className="text-[#0F766E]">AGG</strong> 3'
                      </div>
                    </div>
                  )}
                </div>

                {/* Stage 3: gRNA Pool Generation */}
                <div
                  className={`tx-card p-6 transition-opacity duration-300 ${
                    stageResults[3].status !== "complete" ? "opacity-30" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Flask size={18} weight="regular" className="text-[#0F766E]" />
                      <h4 className="font-sans text-sm font-semibold text-zinc-950">
                        Candidate Guides
                      </h4>
                    </div>
                    {stageResults[3].status === "complete" && (
                      <CheckCircle size={16} weight="fill" className="text-[#0F766E]" />
                    )}
                  </div>
                  {stageResults[3].status === "complete" && (
                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-200/70">
                        <span className="font-sans text-zinc-500">Filtered Candidates</span>
                        <span className="font-mono font-semibold text-zinc-950">47 guides</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-200/70">
                        <span className="font-sans text-zinc-500">GC Proportion Range</span>
                        <span className="font-mono font-semibold text-zinc-950">35% – 70%</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stage 4: Efficiency Prediction */}
                <div
                  className={`tx-card p-6 transition-opacity duration-300 ${
                    stageResults[4].status !== "complete" ? "opacity-30" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <ChartBar size={18} weight="regular" className="text-[#0F766E]" />
                      <h4 className="font-sans text-sm font-semibold text-zinc-950">
                        Cutting Efficiency
                      </h4>
                    </div>
                    {stageResults[4].status === "complete" && (
                      <CheckCircle size={16} weight="fill" className="text-[#0F766E]" />
                    )}
                  </div>
                  {stageResults[4].status === "complete" && (
                    <div className="space-y-2.5 text-xs">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/70">
                          <span className="text-[10px] text-zinc-500 block font-sans">XGBoost</span>
                          <span className="font-mono font-semibold text-zinc-950">0.932</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/70">
                          <span className="text-[10px] text-zinc-500 block font-sans">LightGBM</span>
                          <span className="font-mono font-semibold text-zinc-950">0.914</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/70">
                          <span className="text-[10px] text-zinc-500 block font-sans">RF</span>
                          <span className="font-mono font-semibold text-zinc-950">0.915</span>
                        </div>
                      </div>
                      <div className="text-center pt-1 font-sans text-xs text-zinc-600">
                        Ensemble Score: <span className="font-mono font-bold text-zinc-950">0.920</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stage 5: Off-Target Analysis */}
                <div
                  className={`tx-card p-6 transition-opacity duration-300 ${
                    stageResults[5].status !== "complete" ? "opacity-30" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={18} weight="regular" className="text-[#0F766E]" />
                      <h4 className="font-sans text-sm font-semibold text-zinc-950">
                        Off-Target Risk
                      </h4>
                    </div>
                    {stageResults[5].status === "complete" && (
                      <CheckCircle size={16} weight="fill" className="text-[#0F766E]" />
                    )}
                  </div>
                  {stageResults[5].status === "complete" && (
                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 border border-zinc-200/70">
                        <div className="w-10 h-10 rounded-full border border-[#0F766E] bg-teal-50 flex items-center justify-center font-mono font-bold text-[#0F766E]">
                          0.18
                        </div>
                        <div>
                          <span className="font-sans font-semibold text-zinc-950 block">
                            Low Cleavage Risk
                          </span>
                          <span className="text-[11px] text-zinc-500 font-sans">
                            Genome-wide scan verified
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stage 6: SHAP Explainability */}
                <div
                  className={`tx-card p-6 transition-opacity duration-300 ${
                    stageResults[6].status !== "complete" ? "opacity-30" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Sparkle size={18} weight="regular" className="text-[#0F766E]" />
                      <h4 className="font-sans text-sm font-semibold text-zinc-950">
                        SHAP Explainability
                      </h4>
                    </div>
                    {stageResults[6].status === "complete" && (
                      <CheckCircle size={16} weight="fill" className="text-[#0F766E]" />
                    )}
                  </div>
                  {stageResults[6].status === "complete" && (
                    <div className="space-y-2 text-[11px] font-sans">
                      {[
                        { feature: "gc_content", contribution: "+0.142", positive: true },
                        { feature: "position_1_G", contribution: "+0.087", positive: true },
                        { feature: "dinucleotide_GG", contribution: "+0.053", positive: true },
                        { feature: "homopolymer_run", contribution: "-0.031", positive: false },
                      ].map((f) => (
                        <div key={f.feature} className="flex items-center gap-2">
                          <span className="w-28 text-zinc-600 truncate font-mono text-[10px]">
                            {f.feature}
                          </span>
                          <div className="flex-1 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                f.positive ? "bg-[#0F766E]" : "bg-zinc-400"
                              }`}
                              style={{ width: `${Math.abs(parseFloat(f.contribution)) * 500}%` }}
                            />
                          </div>
                          <span
                            className={`font-mono text-[10px] font-medium w-12 text-right ${
                              f.positive ? "text-[#0F766E]" : "text-zinc-600"
                            }`}
                          >
                            {f.contribution}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Stage 7: PDF Report Generation */}
                <div
                  className={`tx-card p-6 transition-opacity duration-300 md:col-span-2 lg:col-span-3 ${
                    stageResults[7].status !== "complete" ? "opacity-30" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <FileText size={18} weight="regular" className="text-[#0F766E]" />
                      <h4 className="font-sans text-sm font-semibold text-zinc-950">
                        Research Summary Report
                      </h4>
                    </div>
                    {stageResults[7].status === "complete" && (
                      <CheckCircle size={16} weight="fill" className="text-[#0F766E]" />
                    )}
                  </div>
                  {stageResults[7].status === "complete" && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-zinc-50 border border-zinc-200/70">
                      <div>
                        <span className="font-sans text-sm font-semibold text-zinc-950 block">
                          targetx_report_osdreb1a_2026.pdf
                        </span>
                        <span className="text-xs text-zinc-500 font-sans">
                          Contains candidate rankings, cleavage probability, and SHAP attribution plots.
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={downloadReport}
                          className="tx-btn-primary px-4 h-9 text-xs font-medium flex items-center gap-1.5"
                        >
                          <DownloadSimple size={14} weight="regular" />
                          Download PDF
                        </button>
                        <button
                          onClick={copyData}
                          className="tx-btn-secondary px-4 h-9 text-xs font-medium flex items-center gap-1.5"
                        >
                          <Copy size={14} weight="regular" />
                          Copy JSON
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Idle State Overview Details */}
          {pipelineStatus === "idle" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="tx-card p-6 md:p-7">
                <span className="font-sans text-xs font-semibold uppercase tracking-wider text-zinc-500 block mb-3">
                  Reference Genomes
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs font-sans">
                  {[
                    "Human (GRCh38 / hg38)",
                    "Mouse (GRCm39 / mm39)",
                    "Rice (IRGSP-1.0)",
                    "Arabidopsis (TAIR10)",
                    "E. coli (K-12 MG1655)",
                    "Yeast (S288C)",
                  ].map((org) => (
                    <div
                      key={org}
                      className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/70 text-zinc-700 font-medium truncate"
                    >
                      {org}
                    </div>
                  ))}
                </div>
              </div>

              <div className="tx-card p-6 md:p-7">
                <span className="font-sans text-xs font-semibold uppercase tracking-wider text-zinc-500 block mb-3">
                  Pipeline Steps
                </span>
                <div className="space-y-2 text-xs font-sans">
                  {stages.map((s) => {
                    const Icon = s.icon;
                    return (
                      <div key={s.id} className="flex items-center gap-2.5 text-zinc-700">
                        <Icon size={16} weight="regular" className="text-zinc-500 flex-shrink-0" />
                        <span>{s.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="tx-card p-6 md:p-7">
                <span className="font-sans text-xs font-semibold uppercase tracking-wider text-zinc-500 block mb-3">
                  Default Parameters
                </span>
                <div className="space-y-2 text-xs font-sans">
                  <div className="flex justify-between py-1 border-b border-zinc-200/50">
                    <span className="text-zinc-500">PAM Specificity</span>
                    <span className="font-mono font-medium text-zinc-950">5'-NGG-3' (SpCas9)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-200/50">
                    <span className="text-zinc-500">Guide Length</span>
                    <span className="font-mono font-medium text-zinc-950">20 nucleotides</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-200/50">
                    <span className="text-zinc-500">Max Off-Target Mismatches</span>
                    <span className="font-mono font-medium text-zinc-950">3 mismatches</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-zinc-500">Prediction Engine</span>
                    <span className="font-mono font-medium text-zinc-950">Ensemble Tree Models</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
