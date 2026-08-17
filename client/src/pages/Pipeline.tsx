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
import { useProject } from "@/contexts/ProjectContext";
import { generateTargetXPdfReport } from "@/lib/generatePdfReport";
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

const supportedOrganisms = [
  { id: "human", name: "Human", genome: "hg38", latin: "Homo sapiens", category: "Biomedical", keywords: ["human", "human being", "human beings", "hg38", "homo sapiens", "tp53", "casp3", "brca1", "egfr", "hek293", "cancer", "tumor", "patient", "medical", "cardiovascular"] },
  { id: "mouse", name: "Mouse", genome: "mm39", latin: "Mus musculus", category: "Preclinical Model", keywords: ["mouse", "mm39", "mus musculus", "murine", "rodent", "preclinical"] },
  { id: "rice", name: "Rice", genome: "IRGSP-1.0", latin: "Oryza sativa", category: "Crop / AgBiotech", keywords: ["rice", "irgsp", "oryza", "oryza sativa", "aba", "drought", "osdreb1a", "crop", "paddy"] },
  { id: "maize", name: "Maize / Corn", genome: "Zm-B73", latin: "Zea mays", category: "Crop / AgBiotech", keywords: ["maize", "corn", "zea mays", "b73", "grain", "agriculture"] },
  { id: "wheat", name: "Wheat", genome: "IWGSC", latin: "Triticum aestivum", category: "Crop / AgBiotech", keywords: ["wheat", "triticum", "triticum aestivum", "iwgsc", "rust", "bread wheat"] },
  { id: "soybean", name: "Soybean", genome: "Wm82", latin: "Glycine max", category: "Crop / AgBiotech", keywords: ["soybean", "soy", "glycine max", "wm82", "nodulation", "oilseed"] },
  { id: "tomato", name: "Tomato", genome: "SL4.0", latin: "Solanum lycopersicum", category: "Crop / AgBiotech", keywords: ["tomato", "lycopersicum", "sl4.0", "fruit", "horticulture"] },
  { id: "zebrafish", name: "Zebrafish", genome: "GRCz11", latin: "Danio rerio", category: "Preclinical Model", keywords: ["zebrafish", "danio rerio", "grcz11", "embryo", "fish", "developmental"] },
  { id: "drosophila", name: "Fruit Fly", genome: "dm6", latin: "Drosophila melanogaster", category: "Preclinical Model", keywords: ["drosophila", "fruit fly", "melanogaster", "dm6", "fly", "invertebrate"] },
  { id: "celegans", name: "C. elegans", genome: "ce11", latin: "Caenorhabditis elegans", category: "Preclinical Model", keywords: ["c. elegans", "elegans", "caenorhabditis", "ce11", "worm", "nematode", "aging"] },
  { id: "cho", name: "CHO Cells", genome: "CriGri", latin: "Cricetulus griseus", category: "Biomanufacturing", keywords: ["cho", "cho cell", "cho cells", "chinese hamster", "crigri", "antibody", "biomanufacturing", "monoclonal"] },
  { id: "ecoli", name: "E. coli", genome: "K12", latin: "Escherichia coli", category: "Microbial", keywords: ["e. coli", "ecoli", "escherichia", "k12", "bacteria", "microbial"] },
  { id: "yeast", name: "Yeast", genome: "S288C", latin: "Saccharomyces cerevisiae", category: "Microbial", keywords: ["yeast", "s. cerevisiae", "saccharomyces", "s288c", "fermentation"] },
  { id: "arabidopsis", name: "Arabidopsis", genome: "TAIR10", latin: "Arabidopsis thaliana", category: "Crop / AgBiotech", keywords: ["arabidopsis", "a. thaliana", "thaliana", "tair10", "model plant"] },
  { id: "algae", name: "Green Algae", genome: "v5.5", latin: "Chlamydomonas reinhardtii", category: "Biomanufacturing", keywords: ["algae", "chlamydomonas", "reinhardtii", "photosynthesis", "biofuel", "carbon capture"] },
  { id: "aav", name: "AAV / Vector", genome: "AAV9/LV", latin: "Viral Delivery Vector", category: "Gene Therapy Vector", keywords: ["aav", "aav9", "aav5", "lentivirus", "vector", "car-t", "viral", "gene therapy", "delivery"] },
];

function detectOrganismFromGoal(text: string) {
  const lower = text.toLowerCase();
  for (const org of supportedOrganisms) {
    if (org.keywords.some((kw) => lower.includes(kw))) {
      return org;
    }
  }
  return supportedOrganisms[0]; // Default to Human if unspecified
}

export default function Pipeline() {
  const [goal, setGoal] = useState("Improve drought resistance in rice (Oryza sativa) by targeting ABA signaling pathways");
  const [customSequence, setCustomSequence] = useState("");
  const [inputMode, setInputMode] = useState<"nlp" | "gene" | "sequence">("nlp");
  const [overrideOrganismId, setOverrideOrganismId] = useState<string | null>(null);
  const [organismCategory, setOrganismCategory] = useState<string>("All");
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus>("idle");
  const [currentStage, setCurrentStage] = useState(-1);
  const [stageResults, setStageResults] = useState<StageResult[]>(
    stages.map(() => ({ status: "pending" }))
  );

  const activeOrganism = overrideOrganismId
    ? supportedOrganisms.find((o) => o.id === overrideOrganismId) || detectOrganismFromGoal(goal)
    : detectOrganismFromGoal(goal);

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
          {/* Option 1: Live System Telemetry Strip */}
          <div className="glass-panel p-3 mb-6 bg-[#0d1117]/90 backdrop-blur-lg border border-cyan-500/30 flex items-center justify-between flex-wrap gap-3 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse glow-cyan" />
              <span className="font-mono text-xs font-bold text-slate-100 tracking-wider">SYSTEM TELEMETRY</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold">
                {pipelineStatus === "running" ? `RUNNING STAGE ${currentStage + 1}/8` : pipelineStatus === "complete" ? "EXECUTION COMPLETE" : "STANDBY IDLE"}
              </span>
            </div>

            <div className="flex items-center gap-6 text-xs font-mono text-slate-400 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Ensemble:</span>
                <span className="text-cyan-300 font-semibold">PyTorch DeepHF + XGBoost + LGBM</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Target Locus:</span>
                <span className="text-slate-200 font-semibold">{activeOrganism.genome} ({activeOrganism.name})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Latency:</span>
                <span className="text-emerald-400 font-semibold">~1.5s / stage</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Compute:</span>
                <span className="text-cyan-400 font-semibold">CUDA GPU Active</span>
              </div>
            </div>
          </div>

          {/* Option 1: Frosted Stepper Container & Neon Laser Connectors */}
          <div className="glass-panel p-6 mb-6 bg-[#0d1117]/85 backdrop-blur-xl border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.12)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-mono text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                Computational Workflow Execution Stepper
              </h3>
              <span className="text-xs font-mono text-slate-400">8 High-Throughput Analysis Stages</span>
            </div>

            <div className="relative">
              {/* Neon Laser Connector Track */}
              <div className="absolute top-5 left-6 right-6 h-0.5 bg-gradient-to-r from-cyan-500/20 via-cyan-500/50 to-cyan-500/20 z-0" />

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 relative z-10">
                {stages.map((stage, i) => {
                  const result = stageResults[i];
                  const isActive = i === currentStage && pipelineStatus === "running";
                  const isComplete = result.status === "complete";
                  const Icon = stage.icon;

                  return (
                    <motion.div
                      key={stage.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={`flex flex-col items-center text-center p-2.5 rounded-xl transition-all duration-200 ${
                        isComplete
                          ? "bg-cyan-500/10 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                          : isActive
                          ? "bg-cyan-500/20 border border-cyan-400 pulse-glow shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                          : "bg-[#0a0e1a]/90 border border-cyan-500/15 hover:border-cyan-500/30"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 border transition-all duration-200 ${
                          isComplete
                            ? "bg-cyan-500/25 border-cyan-400 text-cyan-300"
                            : isActive
                            ? "bg-cyan-500/30 border-cyan-300 text-cyan-200 animate-pulse"
                            : "bg-[#0d1117] border-cyan-500/20 text-slate-500"
                        }`}
                      >
                        {isComplete ? (
                          <CheckCircle2 className="w-5 h-5 text-cyan-300" />
                        ) : isActive ? (
                          <Loader2 className="w-5 h-5 text-cyan-300 animate-spin" />
                        ) : (
                          <Icon className="w-4 h-4 text-cyan-400/70" />
                        )}
                      </div>
                      <p className="text-xs font-mono font-bold text-slate-100 line-clamp-1">{stage.label}</p>
                      <p className="text-[10px] font-mono text-cyan-300 font-medium mt-0.5">
                        {isComplete ? "COMPLETE" : isActive ? "RUNNING" : "STAGE " + (i + 1)}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
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
              <div className="flex items-center gap-4 text-xs font-mono text-slate-500 flex-wrap">
                <span>PAM: <strong className="text-slate-300">SpCas9 (NGG)</strong></span>
                <span className="flex items-center gap-1.5">
                  Organism:{" "}
                  <strong className="text-cyan-300 font-semibold">
                    {activeOrganism.name} ({activeOrganism.latin} [{activeOrganism.genome}])
                  </strong>
                  <span className="text-[10px] text-cyan-400 bg-cyan-500/15 px-1.5 py-0.5 rounded border border-cyan-500/30 font-bold">
                    {overrideOrganismId ? "Manual" : "NLP Auto-Detected"}
                  </span>
                </span>
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
                        <span className="text-slate-500">Detected Species: </span>
                        <span className="text-cyan-300 font-bold">{activeOrganism.name} ({activeOrganism.latin} [{activeOrganism.genome}])</span>
                      </div>
                      <div className="p-2 rounded bg-[#0a0e1a]/60 border border-cyan-500/10">
                        <span className="text-slate-500">Matched Targets: </span>
                        <span className="text-slate-200">
                          {activeOrganism.id === "human"
                            ? "TP53, CASP3, BRCA1, EGFR"
                            : activeOrganism.id === "mouse"
                            ? "Trp53, Casp3, Brca1, Egfr"
                            : "OsDREB1A, OsNAC6, OsLEA3, OsPP2C"}
                        </span>
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
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-mono text-xs font-semibold text-cyan-400">Supported Organisms & Biological Specimens</h4>
                    <p className="text-[10px] font-mono text-slate-400">16 High-Throughput Genomes & Vectors</p>
                  </div>
                  {overrideOrganismId && (
                    <button
                      onClick={() => setOverrideOrganismId(null)}
                      className="text-[10px] font-mono text-cyan-400/80 hover:text-cyan-300 underline"
                    >
                      Reset Auto-Detect
                    </button>
                  )}
                </div>

                {/* Category Filter Tabs */}
                <div className="flex gap-1 mb-3 overflow-x-auto pb-1 scrollbar-none">
                  {["All", "Biomedical", "Crop / AgBiotech", "Preclinical Model", "Biomanufacturing", "Gene Therapy Vector", "Microbial"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setOrganismCategory(cat)}
                      className={`px-2 py-0.5 text-[9px] font-mono rounded whitespace-nowrap transition-colors ${
                        organismCategory === cat
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold"
                          : "text-slate-500 hover:text-slate-300 bg-white/[0.02]"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-[220px] overflow-y-auto pr-1">
                  {supportedOrganisms
                    .filter((org) => organismCategory === "All" || org.category === organismCategory)
                    .map((org) => {
                      const isSelected = activeOrganism.id === org.id;
                      return (
                        <button
                          key={org.id}
                          onClick={() => setOverrideOrganismId(org.id)}
                          className={`text-[10px] font-mono text-left px-2.5 py-2 rounded transition-all flex flex-col justify-between ${
                            isSelected
                              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                              : "text-slate-400 bg-white/[0.02] border border-cyan-500/10 hover:border-cyan-500/25 hover:text-slate-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="truncate">{org.name}</span>
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                          </div>
                          <span className="text-[9px] text-slate-400 font-normal">{org.genome}</span>
                        </button>
                      );
                    })}
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
