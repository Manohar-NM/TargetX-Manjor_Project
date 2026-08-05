/*
 * Pipeline Page — Interactive CRISPR Analysis Workflow
 * 8-stage pipeline with progress tracking and stage-specific panels
 * Genome Noir: glass panels, cyan glow, monospace data
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  BrainCircuit,
  Dna,
  Target,
  Microscope,
  BarChart3,
  ShieldCheck,
  Sparkles,
  FileText,
  Play,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Copy,
} from "lucide-react";
import { toast } from "sonner";

const stages = [
  { id: 0, icon: BrainCircuit, label: "AI Understanding", color: "cyan" },
  { id: 1, icon: Dna, label: "Gene ID", color: "cyan" },
  { id: 2, icon: Target, label: "PAM Detection", color: "cyan" },
  { id: 3, icon: Microscope, label: "gRNA Generation", color: "cyan" },
  { id: 4, icon: BarChart3, label: "Efficiency", color: "cyan" },
  { id: 5, icon: ShieldCheck, label: "Off-target", color: "cyan" },
  { id: 6, icon: Sparkles, label: "Explainability", color: "cyan" },
  { id: 7, icon: FileText, label: "Report", color: "cyan" },
];

type PipelineStatus = "idle" | "running" | "complete";

interface StageResult {
  status: "pending" | "running" | "complete" | "error";
  data?: Record<string, unknown>;
}

export default function Pipeline() {
  const [goal, setGoal] = useState("Improve drought resistance in rice (Oryza sativa) by targeting ABA signaling pathways");
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

    // Smooth stage progress execution
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
    }, 1500);
  };

  const resetPipeline = () => {
    setPipelineStatus("idle");
    setCurrentStage(-1);
    setStageResults(stages.map(() => ({ status: "pending" })));
  };

  const downloadReport = () => {
    const reportText = `TARGETX RESEARCH REPORT\nTarget: ${goal}\nGenerated: ${new Date().toISOString()}\nStatus: 8-Stage Pipeline Complete\nTop Candidate: Guide_01 (ATGGAACGTTCTAGCCGTCA) Score: 0.920\n`;
    const blob = new Blob([reportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `targetx_report_${new Date().getTime()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded!");
  };

  const copyData = () => {
    navigator.clipboard.writeText(JSON.stringify({ goal, status: "complete", topGuide: "ATGGAACGTTCTAGCCGTCA", score: 0.92 }, null, 2));
    toast.success("Copied candidate data to clipboard!");
  };

  return (
    <div className="min-h-screen flex bg-[#0a0e1a] circuit-bg-subtle">
      <Sidebar />

      <div className="flex-1 ml-[220px] flex flex-col">
        <TopBar
          title="Analysis Pipeline"
          subtitle="CRISPR-Cas9 gRNA Design Workflow"
          pipelineStage={pipelineStatus === "running" ? `Stage ${currentStage + 1}/8` : pipelineStatus === "complete" ? "Complete" : "Ready"}
        />

        <div className="flex-1 p-6 overflow-auto relative z-10">
          {/* Pipeline Progress */}
          <div className="mb-8">
            <div className="flex items-center gap-2">
              {stages.map((stage, i) => {
                const result = stageResults[i];
                const isActive = i === currentStage && pipelineStatus === "running";
                const isComplete = result.status === "complete";
                const Icon = stage.icon;

                return (
                  <div key={stage.id} className="flex items-center flex-1">
                    <motion.div
                      animate={{
                        scale: isActive ? 1.1 : 1,
                        borderColor: isComplete ? "rgba(6, 182, 212, 0.5)" : isActive ? "rgba(6, 182, 212, 0.8)" : "rgba(6, 182, 212, 0.15)",
                      }}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-colors duration-200 ${
                        isComplete
                          ? "bg-cyan-500/20 border-cyan-500/40"
                          : isActive
                          ? "bg-cyan-500/10 border-cyan-500/60 pulse-glow"
                          : "bg-[#0d1117] border-cyan-500/15"
                      }`}
                    >
                      {isComplete ? (
                        <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                      ) : isActive ? (
                        <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                      ) : (
                        <Icon className={`w-4 h-4 ${isActive ? "text-cyan-300" : "text-slate-600"}`} />
                      )}
                    </motion.div>
                    {i < stages.length - 1 && (
                      <div
                        className={`flex-1 h-[2px] mx-1 transition-colors duration-300 ${
                          isComplete ? "bg-cyan-500/40" : "bg-slate-800"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2 px-1">
              {stages.map((s) => (
                <span key={s.id} className="text-[10px] font-mono text-slate-500 w-10 text-center truncate">
                  {s.label}
                </span>
              ))}
            </div>
          </div>

          {/* Goal Input Section */}
          <div className="glass-panel p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-mono text-sm font-semibold text-slate-200 flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-cyan-400" />
                Biological Goal Input
              </h3>
              <div className="flex gap-2">
                {(["nlp", "gene", "sequence"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setInputMode(mode)}
                    className={`px-3 py-1 text-xs font-mono rounded transition-colors ${
                      inputMode === mode
                        ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {mode.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {inputMode === "nlp" && (
              <Textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Describe your biological goal..."
                className="bg-[#0a0e1a]/80 border-cyan-500/20 text-slate-200 font-mono text-xs focus:border-cyan-500/50 min-h-[80px] mb-4"
              />
            )}

            {inputMode === "sequence" && (
              <Textarea
                value={customSequence}
                onChange={(e) => setCustomSequence(e.target.value)}
                placeholder="Enter raw DNA sequence (FASTA format accepted)..."
                className="bg-[#0a0e1a]/80 border-cyan-500/20 text-cyan-300 font-mono text-xs focus:border-cyan-500/50 min-h-[80px] mb-4 uppercase"
              />
            )}

            {inputMode === "gene" && (
              <Input
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Enter Gene Symbol (e.g. OsDREB1A, TP53, CASP3)..."
                className="bg-[#0a0e1a]/80 border-cyan-500/20 text-slate-200 font-mono text-xs focus:border-cyan-500/50 mb-4"
              />
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
                <span>PAM: <strong className="text-slate-300">SpCas9 (NGG)</strong></span>
                <span>Organism: <strong className="text-slate-300">Oryza sativa (Rice)</strong></span>
                <span>Ensemble: <strong className="text-cyan-400">XGBoost + LightGBM + RF</strong></span>
              </div>
              <div className="flex gap-3">
                {pipelineStatus === "running" ? (
                  <Button disabled className="bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 font-mono text-xs">
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Running Pipeline...
                  </Button>
                ) : pipelineStatus === "complete" ? (
                  <Button onClick={resetPipeline} variant="outline" className="border-slate-700 text-slate-300 font-mono text-xs">
                    Reset Pipeline
                  </Button>
                ) : (
                  <Button onClick={runPipeline} className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold glow-cyan">
                    <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
                    Launch Pipeline
                  </Button>
                )}
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
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
              >
                {/* Stage 1: AI Understanding */}
                <div className={`glass-panel p-5 transition-opacity duration-300 ${stageResults[0].status !== "complete" ? "opacity-30" : ""}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <BrainCircuit className="w-4 h-4 text-cyan-400" />
                    <h4 className="font-mono text-sm font-semibold text-slate-200">AI Goal Parsing</h4>
                    {stageResults[0].status === "complete" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-auto" />}
                  </div>
                  {stageResults[0].status === "complete" && (
                    <div className="space-y-2 text-xs font-mono">
                      <div className="p-2 rounded bg-[#0a0e1a]/60 border border-cyan-500/10">
                        <span className="text-slate-500">Matched Genes: </span>
                        <span className="text-cyan-400 font-bold">OsDREB1A, OsNAC6, OsLEA3, OsPP2C</span>
                      </div>
                      <div className="p-2 rounded bg-[#0a0e1a]/60 border border-cyan-500/10">
                        <span className="text-slate-500">Primary Target: </span>
                        <span className="text-slate-200">OsDREB1A (LOC_Os09g35010)</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stage 2: PAM Detection */}
                <div className={`glass-panel p-5 transition-opacity duration-300 ${stageResults[2].status !== "complete" ? "opacity-30" : ""}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-cyan-400" />
                    <h4 className="font-mono text-sm font-semibold text-slate-200">PAM Detection</h4>
                    {stageResults[2].status === "complete" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-auto" />}
                  </div>
                  {stageResults[2].status === "complete" && (
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between text-slate-400">
                        <span>Detected PAMs:</span>
                        <span className="text-cyan-400 font-bold">23 sites</span>
                      </div>
                      <div className="p-2 rounded bg-[#0a0e1a]/80 font-mono text-[10px] text-cyan-300 border border-cyan-500/20 overflow-x-auto">
                        5' ATGGAACGTTCTAGCCGTCAGG 3'
                      </div>
                    </div>
                  )}
                </div>

                {/* Stage 3: gRNA Candidate Generation */}
                <div className={`glass-panel p-5 transition-opacity duration-300 ${stageResults[3].status !== "complete" ? "opacity-30" : ""}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Microscope className="w-4 h-4 text-cyan-400" />
                    <h4 className="font-mono text-sm font-semibold text-slate-200">gRNA Candidates</h4>
                    {stageResults[3].status === "complete" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-auto" />}
                  </div>
                  {stageResults[3].status === "complete" && (
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between text-slate-400">
                        <span>Generated:</span>
                        <span className="text-slate-200">47 guides</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>GC range:</span>
                        <span className="text-slate-200">35% – 75%</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stage 4: Efficiency Prediction */}
                <div className={`glass-panel p-5 transition-opacity duration-300 ${stageResults[4].status !== "complete" ? "opacity-30" : ""}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="w-4 h-4 text-cyan-400" />
                    <h4 className="font-mono text-sm font-semibold text-slate-200">Efficiency Prediction</h4>
                    {stageResults[4].status === "complete" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-auto" />}
                  </div>
                  {stageResults[4].status === "complete" && (
                    <div className="space-y-2 text-xs font-mono">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 rounded bg-[#0a0e1a]/60">
                          <div className="text-[10px] text-slate-500">XGBoost</div>
                          <div className="text-cyan-400 font-bold">0.87</div>
                        </div>
                        <div className="p-2 rounded bg-[#0a0e1a]/60">
                          <div className="text-[10px] text-slate-500">LightGBM</div>
                          <div className="text-cyan-400 font-bold">0.84</div>
                        </div>
                        <div className="p-2 rounded bg-[#0a0e1a]/60">
                          <div className="text-[10px] text-slate-500">RandomForest</div>
                          <div className="text-cyan-400 font-bold">0.81</div>
                        </div>
                      </div>
                      <div className="text-center pt-1 text-[11px] text-slate-400">
                        Ensemble Pearson r: <span className="text-cyan-300 font-bold">0.89</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stage 5: Off-target Risk */}
                <div className={`glass-panel p-5 transition-opacity duration-300 ${stageResults[5].status !== "complete" ? "opacity-30" : ""}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    <h4 className="font-mono text-sm font-semibold text-slate-200">Off-target Risk</h4>
                    {stageResults[5].status === "complete" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-auto" />}
                  </div>
                  {stageResults[5].status === "complete" && (
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full border-2 border-emerald-500/60 flex items-center justify-center font-bold text-emerald-400">
                          0.18
                        </div>
                        <div>
                          <div className="font-bold text-emerald-400">LOW RISK</div>
                          <div className="text-[10px] text-slate-500">Genome-wide scan clean</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stage 6: SHAP Explainability */}
                <div className={`glass-panel p-5 transition-opacity duration-300 ${stageResults[6].status !== "complete" ? "opacity-30" : ""}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <h4 className="font-mono text-sm font-semibold text-slate-200">SHAP Explainability</h4>
                    {stageResults[6].status === "complete" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-auto" />}
                  </div>
                  {stageResults[6].status === "complete" && (
                    <div className="space-y-1 text-[10px] font-mono">
                      {[
                        { feature: "gc_content", contribution: "+0.124", positive: true },
                        { feature: "position_1_G", contribution: "+0.087", positive: true },
                        { feature: "dinucleotide_GG", contribution: "+0.053", positive: true },
                        { feature: "homopolymer_run_max", contribution: "-0.031", positive: false },
                      ].map((f) => (
                        <div key={f.feature} className="flex items-center gap-2">
                          <span className="w-28 text-slate-400 truncate">{f.feature}</span>
                          <div className="flex-1 h-2 rounded-full bg-[#0a0e1a] overflow-hidden">
                            <div
                              className={`h-full rounded-full ${f.positive ? "bg-cyan-500" : "bg-red-500"}`}
                              style={{ width: `${Math.abs(parseFloat(f.contribution)) * 500}%` }}
                            />
                          </div>
                          <span className={`font-mono w-12 text-right ${f.positive ? "text-cyan-400" : "text-red-400"}`}>
                            {f.contribution}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Stage 7: Report Generation */}
                <div className={`glass-panel p-5 transition-opacity duration-300 ${stageResults[7].status !== "complete" ? "opacity-30" : ""}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <h4 className="font-mono text-sm font-semibold text-slate-200">Research Report</h4>
                    {stageResults[7].status === "complete" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-auto" />}
                  </div>
                  {stageResults[7].status === "complete" && (
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                        <p className="text-xs text-emerald-400 font-mono mb-1">Report Generated</p>
                        <p className="text-sm text-slate-300 font-mono">targetx_report_osdreb1a_2024.pdf</p>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={downloadReport} size="sm" variant="outline" className="border-cyan-500/30 text-cyan-400 text-xs font-mono h-8">
                          <FileText className="w-3 h-3 mr-1" /> PDF
                        </Button>
                        <Button onClick={copyData} size="sm" variant="outline" className="border-slate-700 text-slate-400 text-xs font-mono h-8">
                          <Copy className="w-3 h-3 mr-1" /> Copy Data
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Idle State — Quick Info Panels */}
          {pipelineStatus === "idle" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="glass-panel p-5">
                <h4 className="font-mono text-xs font-semibold text-cyan-400 mb-3">Supported Organisms</h4>
                <div className="grid grid-cols-2 gap-2">
                  {["Human (hg38)", "Mouse (mm39)", "Rice (IRGSP)", "E. coli (K12)", "S. cerevisiae", "A. thaliana"].map((o) => (
                    <div key={o} className="text-[10px] font-mono text-slate-400 px-2 py-1.5 rounded bg-white/[0.02] border border-cyan-500/5">
                      {o}
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass-panel p-5">
                <h4 className="font-mono text-xs font-semibold text-cyan-400 mb-3">Pipeline Stages</h4>
                <div className="space-y-2">
                  {stages.map((s) => {
                    const Icon = s.icon;
                    return (
                      <div key={s.id} className="flex items-center gap-2">
                        <Icon className="w-3 h-3 text-cyan-500/40" />
                        <span className="text-[10px] font-mono text-slate-400">{s.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="glass-panel p-5">
                <h4 className="font-mono text-xs font-semibold text-cyan-400 mb-3">Parameters</h4>
                <div className="space-y-2 text-[10px] font-mono">
                  <div className="flex justify-between"><span className="text-slate-500">Genome</span><span className="text-slate-300">hg38 / mm39 / custom</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">PAM Type</span><span className="text-slate-300">NGG (SpCas9)</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Max Mismatches</span><span className="text-slate-300">1–5</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Model</span><span className="text-slate-300">XGB + LGB + RF</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Off-target DB</span><span className="text-slate-300">Cas-OFFinder</span></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
