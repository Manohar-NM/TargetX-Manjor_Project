/*
 * Pipeline Page — Interactive CRISPR Analysis Workflow
 * 8-stage pipeline with progress tracking and stage-specific panels
 * Genome Noir: glass panels, cyan glow, monospace data
 */
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { useProject } from "@/contexts/ProjectContext";
import { generateTargetXPdfReport } from "@/lib/generatePdfReport";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
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
  AlertCircle,
  AlertTriangle,
  Loader2,
  Copy,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

const stages = [
  { id: 0, key: "ai_understanding", icon: BrainCircuit, label: "AI Understanding" },
  { id: 1, key: "gene_id", icon: Dna, label: "Gene ID" },
  { id: 2, key: "pam_detection", icon: Target, label: "PAM Detection" },
  { id: 3, key: "grna_generation", icon: Microscope, label: "gRNA Generation" },
  { id: 4, key: "efficiency", icon: BarChart3, label: "Efficiency" },
  { id: 5, key: "offtarget", icon: ShieldCheck, label: "Off-target" },
  { id: 6, key: "explainability", icon: Sparkles, label: "Explainability" },
  { id: 7, key: "ranking", icon: FileText, label: "Report" },
];

type PipelineStatus = "idle" | "running" | "complete" | "error";

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
  const [currentProjectId, setCurrentProjectId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { activeProjectId, setActiveProjectId } = useProject();
  const [, setLocation] = useLocation();

  const activeOrganism = overrideOrganismId
    ? supportedOrganisms.find((o) => o.id === overrideOrganismId) || detectOrganismFromGoal(goal)
    : detectOrganismFromGoal(goal);

  // tRPC Mutations
  const createProjectMutation = trpc.projects.create.useMutation();
  const runPipelineMutation = trpc.pipeline.runPipeline.useMutation();

  // Polling queries for active project execution
  const { data: stagesData } = trpc.pipeline.getStages.useQuery(
    { projectId: currentProjectId! },
    {
      enabled: currentProjectId !== null && (pipelineStatus === "running" || pipelineStatus === "complete"),
      refetchInterval: pipelineStatus === "running" ? 800 : false,
    }
  );

  const { data: projectData } = trpc.projects.get.useQuery(
    { projectId: currentProjectId! },
    {
      enabled: currentProjectId !== null && (pipelineStatus === "running" || pipelineStatus === "complete"),
      refetchInterval: pipelineStatus === "running" ? 1000 : false,
    }
  );

  const { data: candidates = [] } = trpc.candidates.list.useQuery(
    { projectId: currentProjectId!, sortBy: "finalRank", sortOrder: "asc" },
    {
      enabled: currentProjectId !== null && (pipelineStatus === "running" || pipelineStatus === "complete"),
      refetchInterval: pipelineStatus === "running" ? 1500 : false,
    }
  );

  // Map stageOrder (0..7) to stage record
  const stageMap = useMemo(() => {
    const map = new Map<number, NonNullable<typeof stagesData>[number]>();
    if (stagesData) {
      for (const s of stagesData) {
        map.set(s.stageOrder, s);
      }
    }
    return map;
  }, [stagesData]);

  // Derive current running stage index
  const currentStage = useMemo(() => {
    if (pipelineStatus === "idle") return -1;
    if (pipelineStatus === "complete") return 8;
    if (!stagesData || stagesData.length === 0) return 0;

    const running = stagesData.find((s) => s.status === "running");
    if (running) return running.stageOrder;

    const completed = stagesData.filter((s) => s.status === "complete");
    if (completed.length > 0) {
      const maxOrder = Math.max(...completed.map((s) => s.stageOrder));
      return Math.min(maxOrder + 1, 7);
    }

    return 0;
  }, [stagesData, pipelineStatus]);

  // Synchronize status transitions from backend polling
  useEffect(() => {
    if (pipelineStatus !== "running" || !stagesData || stagesData.length === 0) return;

    // Check for stage error
    const failedStage = stagesData.find((s) => s.status === "error");
    if (failedStage) {
      const errText = failedStage.outputSummary || failedStage.error || `Error in ${failedStage.stageName}`;
      setErrorMessage(errText);
      setPipelineStatus("error");
      toast.error(`Pipeline stopped: ${errText}`);
      return;
    }

    // Check for project error
    if (projectData?.status === "error") {
      setErrorMessage("Pipeline analysis engine reported an unhandled execution error.");
      setPipelineStatus("error");
      toast.error("Pipeline execution failed.");
      return;
    }

    // Check for pipeline completion: all 8 stages complete or project status complete
    const isProjectComplete = projectData?.status === "complete";
    const allStagesComplete = stagesData.length >= 8 && stagesData.slice(0, 8).every((s) => s.status === "complete");

    if (isProjectComplete || allStagesComplete) {
      setPipelineStatus("complete");
      const count = candidates.length;
      toast.success(
        count > 0
          ? `8-Stage CRISPR Analysis Complete (${count} candidates generated)!`
          : "8-Stage CRISPR Analysis Complete (0 SpCas9 PAM sites detected)."
      );
    }
  }, [stagesData, projectData, pipelineStatus, candidates]);

  const runPipeline = async () => {
    let inputStr = "";
    if (inputMode === "sequence") {
      inputStr = customSequence.trim();
      if (!inputStr) {
        toast.error("Please enter a DNA sequence to analyze.");
        return;
      }
    } else if (inputMode === "gene") {
      inputStr = goal.trim();
      if (!inputStr) {
        toast.error("Please enter a gene symbol.");
        return;
      }
    } else {
      inputStr = goal.trim();
      if (!inputStr) {
        toast.error("Please describe your biological target.");
        return;
      }
    }

    try {
      setPipelineStatus("running");
      setErrorMessage(null);

      const targetGene = inputMode === "gene" ? inputStr : undefined;
      const targetSeq = inputMode === "sequence" ? inputStr : undefined;
      const projectName = inputMode === "sequence"
        ? `DNA Sequence (${inputStr.slice(0, 16)}...)`
        : `CRISPR Target: ${inputStr.slice(0, 32)}`;

      const newProject = await createProjectMutation.mutateAsync({
        name: projectName,
        description: `TargetX analysis for ${activeOrganism.name} (${activeOrganism.genome})`,
        organism: activeOrganism.name,
        genome: activeOrganism.genome,
        pamType: "NGG",
        inputMode,
        inputText: inputStr,
        targetGene,
        targetSequence: targetSeq,
      });

      setCurrentProjectId(newProject.id);
      setActiveProjectId(newProject.id);

      await runPipelineMutation.mutateAsync({
        projectId: newProject.id,
        inputMode,
        inputText: inputStr,
      });
    } catch (err) {
      console.error("[Pipeline] Launch failed:", err);
      const msg = err instanceof Error ? err.message : "Failed to launch pipeline.";
      setErrorMessage(msg);
      setPipelineStatus("error");
      toast.error(msg);
    }
  };

  const resetPipeline = () => {
    setPipelineStatus("idle");
    setErrorMessage(null);
  };

  const downloadReport = () => {
    try {
      const formattedCandidates = candidates.map((c, i) => ({
        rank: c.finalRank || i + 1,
        id: c.guideName,
        sequence: c.guideSequence,
        gc: Math.round((c.gcContent || 0) * 100),
        efficiency: c.randomForestScore ?? (c.ensembleScore || 0.75),
        risk: (c.offTargetRisk || "unassessed").toUpperCase(),
        score: c.randomForestScore ? Math.round(c.randomForestScore * 100) : Math.round((c.ensembleScore || 0.75) * 100),
      }));

      generateTargetXPdfReport({
        reportTitle: `TargetX CRISPR Analysis Report — Project #${currentProjectId || activeProjectId}`,
        goal: inputMode === "sequence" ? "Custom DNA Sequence Analysis" : goal,
        targetGene: inputMode === "gene" ? goal : (stageMap.get(1)?.outputData as any)?.symbol || "Target Locus",
        organism: `${activeOrganism.name} (${activeOrganism.latin})`,
        candidates: formattedCandidates.length > 0 ? formattedCandidates.slice(0, 10) : undefined,
      });
      toast.success("TargetX CRISPR Research PDF Report downloaded!");
    } catch (err) {
      console.error("PDF download error:", err);
      toast.error("Failed to generate PDF report.");
    }
  };

  const copyData = () => {
    if (candidates && candidates.length > 0) {
      navigator.clipboard.writeText(JSON.stringify(candidates, null, 2));
      toast.success(`Copied ${candidates.length} candidate guides to clipboard!`);
    } else {
      toast.info("No candidates available to copy.");
    }
  };

  const viewInDashboard = () => {
    if (currentProjectId) {
      setActiveProjectId(currentProjectId);
    }
    setLocation("/dashboard");
  };

  // Helper getters for stage data
  const stage0 = stageMap.get(0);
  const stage1 = stageMap.get(1);
  const stage2 = stageMap.get(2);
  const stage3 = stageMap.get(3);
  const stage4 = stageMap.get(4);
  const stage5 = stageMap.get(5);
  const stage6 = stageMap.get(6);
  const stage7 = stageMap.get(7);

  const topCandidate = candidates[0];

  return (
    <div className="min-h-screen flex bg-[#0a0e1a] circuit-bg-subtle">
      <Sidebar />

      <div className="flex-1 ml-[220px] flex flex-col">
        <TopBar
          title="Analysis Pipeline"
          subtitle="CRISPR-Cas9 gRNA Design Workflow"
          pipelineStage={
            pipelineStatus === "running"
              ? `Stage ${currentStage + 1}/8`
              : pipelineStatus === "complete"
              ? "Complete"
              : pipelineStatus === "error"
              ? "Error"
              : "Ready"
          }
        />

        <div className="flex-1 p-6 overflow-auto relative z-10">
          {/* Live System Telemetry Strip */}
          <div className="glass-panel p-3 mb-6 bg-[#0d1117]/90 backdrop-blur-lg border border-cyan-500/30 flex items-center justify-between flex-wrap gap-3 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  pipelineStatus === "running"
                    ? "bg-cyan-400 animate-pulse glow-cyan"
                    : pipelineStatus === "error"
                    ? "bg-red-400"
                    : pipelineStatus === "complete"
                    ? "bg-emerald-400"
                    : "bg-slate-400"
                }`}
              />
              <span className="font-mono text-xs font-bold text-slate-100 tracking-wider">SYSTEM TELEMETRY</span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold border ${
                  pipelineStatus === "running"
                    ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
                    : pipelineStatus === "complete"
                    ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                    : pipelineStatus === "error"
                    ? "bg-red-500/15 text-red-300 border-red-500/30"
                    : "bg-slate-500/15 text-slate-400 border-slate-500/30"
                }`}
              >
                {pipelineStatus === "running"
                  ? `RUNNING STAGE ${currentStage + 1}/8`
                  : pipelineStatus === "complete"
                  ? "EXECUTION COMPLETE"
                  : pipelineStatus === "error"
                  ? "EXECUTION ERROR"
                  : "STANDBY IDLE"}
              </span>
            </div>

            <div className="flex items-center gap-6 text-xs font-mono text-slate-400 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">ML Model:</span>
                <span className="text-cyan-300 font-semibold">RandomForest (Azimuth 2.0 Surrogate)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">PAM Target:</span>
                <span className="text-slate-200 font-semibold">SpCas9 (NGG)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Off-Target:</span>
                <span className="text-amber-400 font-semibold">Isolated Target (Unassessed)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Database:</span>
                <span className="text-cyan-400 font-semibold">Aiven MySQL TLS 1.3</span>
              </div>
            </div>
          </div>

          {/* Stepper Container & Connectors */}
          <div className="glass-panel p-6 mb-6 bg-[#0d1117]/85 backdrop-blur-xl border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.12)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-mono text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                Computational Workflow Execution Stepper
              </h3>
              <span className="text-xs font-mono text-slate-400">8 High-Throughput Analysis Stages</span>
            </div>

            <div className="relative">
              {/* Neon Connector Track */}
              <div className="absolute top-5 left-6 right-6 h-0.5 bg-gradient-to-r from-cyan-500/20 via-cyan-500/50 to-cyan-500/20 z-0" />

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 relative z-10">
                {stages.map((stage, i) => {
                  const stageRecord = stageMap.get(i);
                  const status = stageRecord ? stageRecord.status : "pending";
                  const isActive = status === "running";
                  const isComplete = status === "complete";
                  const isError = status === "error";
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
                          : isError
                          ? "bg-red-500/20 border border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                          : "bg-[#0a0e1a]/90 border border-cyan-500/15 hover:border-cyan-500/30"
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 transition-all ${
                          isComplete
                            ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/50"
                            : isActive
                            ? "bg-cyan-400 text-slate-950 font-bold scale-105"
                            : isError
                            ? "bg-red-500/20 text-red-300 border border-red-400/50"
                            : "bg-[#0d1117] text-slate-500 border border-cyan-500/20"
                        }`}
                      >
                        {isActive ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isError ? (
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                        ) : isComplete ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Icon className="w-4 h-4" />
                        )}
                      </div>
                      <p className="text-xs font-mono font-bold text-slate-100 line-clamp-1">{stage.label}</p>
                      <p
                        className={`text-[10px] font-mono mt-0.5 font-medium ${
                          isError
                            ? "text-red-400"
                            : isComplete
                            ? "text-emerald-400"
                            : isActive
                            ? "text-cyan-300 font-bold"
                            : "text-slate-500"
                        }`}
                      >
                        {isError ? "ERROR" : isComplete ? "COMPLETE" : isActive ? "RUNNING" : "STAGE " + (i + 1)}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {pipelineStatus === "error" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-5 mb-6 border-red-500/40 bg-red-950/20"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-mono text-sm font-semibold text-red-300">Pipeline Execution Error</h4>
                  <p className="font-mono text-xs text-slate-300 mt-1">
                    {errorMessage || "The pipeline encountered an error during analysis. Check your input sequence format."}
                  </p>
                </div>
                <Button
                  onClick={resetPipeline}
                  size="sm"
                  variant="outline"
                  className="border-red-500/40 text-red-300 font-mono text-xs hover:bg-red-500/10"
                >
                  Reset & Try Again
                </Button>
              </div>
            </motion.div>
          )}

          {/* Zero Candidate Alert */}
          {pipelineStatus === "complete" && candidates.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-5 mb-6 border-amber-500/40 bg-amber-950/20"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-mono text-sm font-semibold text-amber-300">Zero SpCas9 PAM Sites Detected</h4>
                  <p className="font-mono text-xs text-slate-300 mt-1">
                    The provided sequence contains 0 canonical SpCas9 NGG motifs on either sense or antisense strands.
                    In strict accordance with TargetX empirical validation standards, zero synthetic candidates were fabricated.
                  </p>
                  <p className="font-mono text-xs text-cyan-300 mt-2 font-semibold">
                    Biological Recommendation: Consider targeting with Cas12a (Cpf1, TTTV PAM) for AT-rich regions.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

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
                    disabled={pipelineStatus === "running"}
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
                disabled={pipelineStatus === "running"}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Describe your biological goal..."
                className="bg-[#0a0e1a]/80 border-cyan-500/20 text-slate-200 font-mono text-xs focus:border-cyan-500/50 min-h-[80px] mb-4"
              />
            )}

            {inputMode === "sequence" && (
              <Textarea
                value={customSequence}
                disabled={pipelineStatus === "running"}
                onChange={(e) => setCustomSequence(e.target.value)}
                placeholder="Enter raw DNA sequence (FASTA format accepted, canonical A/C/G/T only)..."
                className="bg-[#0a0e1a]/80 border-cyan-500/20 text-cyan-300 font-mono text-xs focus:border-cyan-500/50 min-h-[80px] mb-4 uppercase"
              />
            )}

            {inputMode === "gene" && (
              <Input
                value={goal}
                disabled={pipelineStatus === "running"}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Enter Gene Symbol (e.g. OsDREB1A, TP53, CASP3)..."
                className="bg-[#0a0e1a]/80 border-cyan-500/20 text-slate-200 font-mono text-xs focus:border-cyan-500/50 mb-4"
              />
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs font-mono text-slate-500 flex-wrap">
                <span>
                  PAM: <strong className="text-slate-300">SpCas9 (NGG)</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  Organism:{" "}
                  <strong className="text-cyan-300 font-semibold">
                    {activeOrganism.name} ({activeOrganism.latin} [{activeOrganism.genome}])
                  </strong>
                  <span className="text-[10px] text-cyan-400 bg-cyan-500/15 px-1.5 py-0.5 rounded border border-cyan-500/30 font-bold">
                    {overrideOrganismId ? "Manual" : "NLP Auto-Detected"}
                  </span>
                </span>
                <span>
                  Model: <strong className="text-cyan-400">RandomForest Regressor (Azimuth Surrogate)</strong>
                </span>
              </div>
              <div className="flex gap-3">
                {pipelineStatus === "running" ? (
                  <Button disabled className="bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 font-mono text-xs">
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Running Real Pipeline...
                  </Button>
                ) : pipelineStatus === "complete" ? (
                  <div className="flex gap-2">
                    <Button
                      onClick={viewInDashboard}
                      className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold glow-cyan"
                    >
                      <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                      View in Dashboard
                    </Button>
                    <Button onClick={resetPipeline} variant="outline" className="border-slate-700 text-slate-300 font-mono text-xs">
                      Reset
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={runPipeline}
                    disabled={createProjectMutation.isPending || runPipelineMutation.isPending}
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold glow-cyan"
                  >
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
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
              >
                {/* Stage 0: AI Goal Parsing */}
                <div
                  className={`glass-panel p-5 transition-opacity duration-300 ${
                    stage0?.status !== "complete" && stage0?.status !== "running" ? "opacity-30" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <BrainCircuit className="w-4 h-4 text-cyan-400" />
                    <h4 className="font-mono text-sm font-semibold text-slate-200">AI Goal Parsing</h4>
                    {stage0?.status === "complete" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-auto" />}
                    {stage0?.status === "running" && <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin ml-auto" />}
                  </div>
                  {stage0?.status === "complete" && (
                    <div className="space-y-2 text-xs font-mono">
                      <div className="p-2 rounded bg-[#0a0e1a]/60 border border-cyan-500/10">
                        <span className="text-slate-500">Species: </span>
                        <span className="text-cyan-300 font-bold">
                          {activeOrganism.name} ({activeOrganism.genome})
                        </span>
                      </div>
                      <div className="p-2 rounded bg-[#0a0e1a]/60 border border-cyan-500/10">
                        <span className="text-slate-500">Target: </span>
                        <span className="text-slate-200">
                          {(stage0.outputData as any)?.gene ||
                            ((stage0.outputData as any)?.length
                              ? `Custom DNA (${(stage0.outputData as any).length} bp)`
                              : "Validated sequence")}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stage 1: Gene ID & Locus */}
                <div
                  className={`glass-panel p-5 transition-opacity duration-300 ${
                    stage1?.status !== "complete" && stage1?.status !== "running" ? "opacity-30" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Dna className="w-4 h-4 text-cyan-400" />
                    <h4 className="font-mono text-sm font-semibold text-slate-200">Gene ID & Locus</h4>
                    {stage1?.status === "complete" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-auto" />}
                    {stage1?.status === "running" && <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin ml-auto" />}
                  </div>
                  {stage1?.status === "complete" && (
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between text-slate-400">
                        <span>Symbol:</span>
                        <span className="text-cyan-300 font-bold">{(stage1.outputData as any)?.symbol || "Target Locus"}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Coordinates:</span>
                        <span className="text-slate-200 truncate max-w-[120px]">
                          {(stage1.outputData as any)?.locus || "Sequence-relative"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stage 2: PAM Detection */}
                <div
                  className={`glass-panel p-5 transition-opacity duration-300 ${
                    stage2?.status !== "complete" && stage2?.status !== "running" ? "opacity-30" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-cyan-400" />
                    <h4 className="font-mono text-sm font-semibold text-slate-200">PAM Detection</h4>
                    {stage2?.status === "complete" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-auto" />}
                    {stage2?.status === "running" && <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin ml-auto" />}
                  </div>
                  {stage2?.status === "complete" && (
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between text-slate-400">
                        <span>Detected SpCas9 PAMs:</span>
                        <span className="text-cyan-400 font-bold">{(stage2.outputData as any)?.totalPamCount ?? 0} sites</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>Strand Breakdown:</span>
                        <span>
                          +{(stage2.outputData as any)?.forwardCount ?? 0} / -{(stage2.outputData as any)?.reverseCount ?? 0}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stage 3: gRNA Candidate Generation */}
                <div
                  className={`glass-panel p-5 transition-opacity duration-300 ${
                    stage3?.status !== "complete" && stage3?.status !== "running" ? "opacity-30" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Microscope className="w-4 h-4 text-cyan-400" />
                    <h4 className="font-mono text-sm font-semibold text-slate-200">gRNA Candidates</h4>
                    {stage3?.status === "complete" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-auto" />}
                    {stage3?.status === "running" && <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin ml-auto" />}
                  </div>
                  {stage3?.status === "complete" && (
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between text-slate-400">
                        <span>Generated Guides:</span>
                        <span className="text-slate-100 font-bold">{candidates.length} guides</span>
                      </div>
                      {topCandidate && (
                        <div className="p-1.5 rounded bg-[#0a0e1a]/80 font-mono text-[10px] text-cyan-300 border border-cyan-500/20 truncate">
                          5' {topCandidate.guideSequence} 3'
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Stage 4: Efficiency Prediction */}
                <div
                  className={`glass-panel p-5 transition-opacity duration-300 ${
                    stage4?.status !== "complete" && stage4?.status !== "running" ? "opacity-30" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="w-4 h-4 text-cyan-400" />
                    <h4 className="font-mono text-sm font-semibold text-slate-200">Efficiency Prediction</h4>
                    {stage4?.status === "complete" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-auto" />}
                    {stage4?.status === "running" && <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin ml-auto" />}
                  </div>
                  {stage4?.status === "complete" && (
                    <div className="space-y-2 text-xs font-mono">
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="p-2 rounded bg-[#0a0e1a]/60 border border-cyan-500/20">
                          <div className="text-[10px] text-slate-500">RandomForest ML</div>
                          <div className="text-cyan-400 font-bold text-sm">
                            {(stage4.outputData as any)?.averageMlScore !== "N/A"
                              ? (stage4.outputData as any)?.averageMlScore
                              : "N/A"}
                          </div>
                        </div>
                        <div className="p-2 rounded bg-[#0a0e1a]/60 border border-cyan-500/10">
                          <div className="text-[10px] text-slate-500">Quality Heuristic</div>
                          <div className="text-slate-300 font-bold text-sm">
                            {(stage4.outputData as any)?.averageHeuristicScore ?? "N/A"}
                          </div>
                        </div>
                      </div>
                      <div className="text-center pt-1 text-[10px] text-slate-500">
                        XGB/LGB: <span className="text-slate-400">Offline</span> | RF:{" "}
                        <span className="text-cyan-300 font-semibold">Trained Azimuth Surrogate</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stage 5: Off-target Risk */}
                <div
                  className={`glass-panel p-5 transition-opacity duration-300 ${
                    stage5?.status !== "complete" && stage5?.status !== "running" ? "opacity-30" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    <h4 className="font-mono text-sm font-semibold text-slate-200">Off-target Safety</h4>
                    {stage5?.status === "complete" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-auto" />}
                    {stage5?.status === "running" && <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin ml-auto" />}
                  </div>
                  {stage5?.status === "complete" && (
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex items-center gap-2.5">
                        <div className="px-2.5 py-1 rounded border border-amber-500/40 bg-amber-500/10 font-bold text-amber-400 text-xs">
                          UNASSESSED
                        </div>
                        <div>
                          <div className="font-bold text-amber-400 text-xs">SPECIFICITY: UNASSESSED</div>
                          <div className="text-[9px] text-slate-500">Isolated sequence (no genome index)</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stage 6: SHAP Explainability */}
                <div
                  className={`glass-panel p-5 transition-opacity duration-300 ${
                    stage6?.status !== "complete" && stage6?.status !== "running" ? "opacity-30" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <h4 className="font-mono text-sm font-semibold text-slate-200">Feature Attribution</h4>
                    {stage6?.status === "complete" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-auto" />}
                    {stage6?.status === "running" && <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin ml-auto" />}
                  </div>
                  {stage6?.status === "complete" && (
                    <div className="space-y-1 text-[10px] font-mono">
                      {topCandidate ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-slate-400">GC Content:</span>
                            <span className="text-cyan-300">{Math.round((topCandidate.gcContent || 0) * 100)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Poly-T Signal:</span>
                            <span className={topCandidate.guideSequence.includes("TTTT") ? "text-red-400" : "text-emerald-400"}>
                              {topCandidate.guideSequence.includes("TTTT") ? "Detected (Penalty)" : "Clean"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Position 20 G:</span>
                            <span className={topCandidate.guideSequence[19] === "G" ? "text-cyan-300" : "text-slate-500"}>
                              {topCandidate.guideSequence[19] === "G" ? "Guanine Favored" : "Non-G"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Max Homopolymer:</span>
                            <span className="text-slate-300">{topCandidate.homopolymerRunMax ?? 0} nt</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-slate-500 text-[10px]">No candidate features to explain</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Stage 7: Research Report */}
                <div
                  className={`glass-panel p-5 transition-opacity duration-300 ${
                    stage7?.status !== "complete" && stage7?.status !== "running" ? "opacity-30" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <h4 className="font-mono text-sm font-semibold text-slate-200">Research Report</h4>
                    {stage7?.status === "complete" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-auto" />}
                    {stage7?.status === "running" && <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin ml-auto" />}
                  </div>
                  {stage7?.status === "complete" && (
                    <div className="space-y-2.5">
                      <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-400">
                        {candidates.length > 0 ? `${candidates.length} Guides Evaluated` : "Zero PAMs Detected"}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={downloadReport}
                          size="sm"
                          variant="outline"
                          className="border-cyan-500/30 text-cyan-400 text-xs font-mono h-7 flex-1"
                        >
                          <FileText className="w-3 h-3 mr-1" /> PDF
                        </Button>
                        <Button
                          onClick={copyData}
                          size="sm"
                          variant="outline"
                          className="border-slate-700 text-slate-400 text-xs font-mono h-7 flex-1"
                        >
                          <Copy className="w-3 h-3 mr-1" /> Copy
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
                  <div className="flex justify-between">
                    <span className="text-slate-500">Targeting</span>
                    <span className="text-slate-300">SpCas9 (20-nt guide + NGG PAM)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">PAM Detection</span>
                    <span className="text-slate-300">Dual-strand sense & antisense scan</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ML Regressor</span>
                    <span className="text-cyan-300">RandomForest (Azimuth 2.0 Surrogate)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Feature Vector</span>
                    <span className="text-slate-300">128-dimensional biological encoding</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Off-target Alignment</span>
                    <span className="text-amber-400">Unassessed without whole-genome index</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
