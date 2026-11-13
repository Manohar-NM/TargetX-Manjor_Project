/*
 * Pipeline Page — Interactive CRISPR Analysis Workflow
 * 8-stage pipeline with progress tracking, stage-specific panels,
 * clean form controls (labels above, helper text below), and Phosphor icons.
 * Fully wired to real backend tRPC procedures and Aiven MySQL.
 */
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { useProject } from "@/contexts/ProjectContext";
import { generateTargetXPdfReport } from "@/lib/generatePdfReport";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
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
  ArrowRight,
  WarningCircle,
  ArrowSquareOut,
} from "@phosphor-icons/react";
import { toast } from "sonner";

const stages = [
  { id: 0, key: "ai_understanding", icon: Brain, label: "AI Parsing" },
  { id: 1, key: "gene_id", icon: Dna, label: "Gene ID" },
  { id: 2, key: "pam_detection", icon: Target, label: "PAM Scan" },
  { id: 3, key: "grna_generation", icon: Flask, label: "gRNA Pool" },
  { id: 4, key: "efficiency", icon: ChartBar, label: "Efficiency" },
  { id: 5, key: "offtarget", icon: ShieldCheck, label: "Off-target" },
  { id: 6, key: "explainability", icon: Sparkle, label: "SHAP" },
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
    setCurrentProjectId(null);
    setErrorMessage(null);
  };

  const downloadReport = () => {
    try {
      generateTargetXPdfReport({
        reportTitle: `TargetX Analysis Pipeline Report — Project #${currentProjectId || activeProjectId}`,
        goal,
        targetGene: inputMode === "gene" ? goal : (projectData?.targetGene || "Target Locus"),
        organism: `${activeOrganism.name} (${activeOrganism.genome})`,
        candidates: candidates.length > 0 ? candidates.slice(0, 10).map((c, i) => ({
          rank: c.finalRank || i + 1,
          id: c.guideName,
          sequence: c.guideSequence,
          gc: Math.round((c.gcContent || 0) * 100),
          efficiency: c.randomForestScore ?? (c.ensembleScore || 0.75),
          risk: (c.offTargetRisk || "unassessed").toLowerCase(),
          score: c.randomForestScore ? Math.round(c.randomForestScore * 100) : Math.round((c.ensembleScore || 0.75) * 100),
        })) : undefined,
      });
      toast.success("TargetX CRISPR Research PDF Report downloaded!");
    } catch (err) {
      console.error("PDF download error:", err);
      toast.error("Failed to generate PDF report.");
    }
  };

  const copyData = () => {
    if (candidates.length === 0) {
      toast.info("No candidates generated yet to copy.");
      return;
    }
    navigator.clipboard.writeText(JSON.stringify(candidates, null, 2));
    toast.success(`Copied ${candidates.length} candidates to clipboard!`);
  };

  const viewInDashboard = () => {
    if (currentProjectId) {
      setActiveProjectId(currentProjectId);
    }
    setLocation("/dashboard");
  };

  // Stage records from database
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
              : pipelineStatus === "error"
              ? "Error"
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
                  ? `Executing stage ${currentStage + 1} of 8...`
                  : pipelineStatus === "complete"
                  ? `All 8 stages completed successfully (${candidates.length} guides)`
                  : pipelineStatus === "error"
                  ? "Execution halted due to error"
                  : "Awaiting execution trigger"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {stages.map((stage, i) => {
                const stageRecord = stageMap.get(i);
                const status = stageRecord ? stageRecord.status : "pending";
                const isActive = status === "running" || (pipelineStatus === "running" && i === currentStage);
                const isComplete = status === "complete";
                const isError = status === "error";
                const Icon = stage.icon;

                return (
                  <div key={stage.id} className="flex items-center flex-1">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-200 ${
                        isError
                          ? "bg-rose-50 border-rose-400 text-rose-600"
                          : isComplete
                          ? "bg-white border-[#0F766E] text-[#0F766E] shadow-2xs"
                          : isActive
                          ? "bg-white border-[#0F766E] ring-2 ring-[#0F766E]/20 text-[#0F766E]"
                          : "bg-white border-zinc-200/80 text-zinc-400"
                      }`}
                      title={`${stage.label} (${status.toUpperCase()})`}
                    >
                      {isError ? (
                        <WarningCircle size={18} weight="fill" className="text-rose-600" />
                      ) : isComplete ? (
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
                          isComplete ? "bg-[#0F766E]" : isError ? "bg-rose-300" : "bg-zinc-200"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between mt-3 px-0.5">
              {stages.map((s, i) => {
                const stageRecord = stageMap.get(i);
                const isError = stageRecord?.status === "error";
                return (
                  <span
                    key={s.id}
                    className={`text-[11px] font-sans font-medium w-14 text-center truncate ${
                      isError ? "text-rose-600 font-semibold" : "text-zinc-600"
                    }`}
                  >
                    {s.label}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Error Banner */}
          {pipelineStatus === "error" && (
            <div className="tx-card p-5 mb-8 border-rose-200 bg-rose-50/50 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <WarningCircle size={20} weight="fill" className="text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-sans text-sm font-semibold text-rose-950 block">
                    Pipeline Execution Error
                  </span>
                  <span className="font-sans text-xs text-rose-700 mt-1 block">
                    {errorMessage || "An error occurred during analysis. Check your input sequence format."}
                  </span>
                </div>
              </div>
              <button
                onClick={resetPipeline}
                className="tx-btn-secondary px-3.5 py-1.5 text-xs text-rose-900 border-rose-200 shrink-0"
              >
                Reset & Try Again
              </button>
            </div>
          )}

          {/* Zero Candidate Alert */}
          {pipelineStatus === "complete" && candidates.length === 0 && (
            <div className="tx-card p-5 mb-8 border-amber-200 bg-amber-50/60 flex items-start gap-3">
              <WarningCircle size={20} weight="fill" className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-sans text-sm font-semibold text-amber-950 block">
                  Zero SpCas9 PAM Sites Detected
                </span>
                <span className="font-sans text-xs text-amber-800 mt-1 block">
                  The provided sequence contains 0 canonical SpCas9 NGG motifs on either sense or antisense strands. In strict accordance with TargetX empirical validation standards, zero synthetic candidates were fabricated.
                </span>
                <span className="font-sans text-xs text-[#0F766E] font-medium mt-2 block">
                  Biological Recommendation: Consider targeting with Cas12a (Cpf1, TTTV PAM) for AT-rich regions.
                </span>
              </div>
            </div>
          )}

          {/* Goal Input Section: Labels above, gap-2, helper text below */}
          <div className="tx-card p-6 md:p-8 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-zinc-200/60">
              <div>
                <h3 className="font-sans text-base font-semibold text-zinc-950 flex items-center gap-2">
                  <Brain size={18} weight="regular" className="text-[#0F766E]" />
                  Biological Target Specification
                </h3>
                <p className="font-sans text-xs text-zinc-500 mt-0.5">
                  Specify your research objective, target gene identifier, or raw genomic sequence.
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
                    disabled={pipelineStatus === "running"}
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
                    disabled={pipelineStatus === "running"}
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
                    disabled={pipelineStatus === "running"}
                    value={customSequence}
                    onChange={(e) => setCustomSequence(e.target.value)}
                    placeholder="Paste 5' to 3' nucleotide sequence (canonical A, C, G, T only)..."
                    className="bg-white border-zinc-200/80 rounded-xl text-zinc-900 font-mono text-xs focus-visible:ring-2 focus-visible:ring-[#0F766E] min-h-[96px] uppercase shadow-2xs"
                  />
                  <span className="font-sans text-xs text-zinc-500">
                    Supports canonical nucleotides. SpCas9 PAM sites (5'-NGG-3') will be detected on both strands.
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
                    disabled={pipelineStatus === "running"}
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
                    Organism:{" "}
                    <strong className="text-zinc-950 font-medium">
                      {activeOrganism.name} ({activeOrganism.genome})
                    </strong>
                    <span className="ml-1.5 text-[10px] text-[#0F766E] bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200/60 font-medium">
                      {overrideOrganismId ? "Manual" : "NLP Auto-Detected"}
                    </span>
                  </span>
                  <span className="text-zinc-300">·</span>
                  <span>
                    ML Regressor:{" "}
                    <strong className="text-[#0F766E] font-medium">
                      RandomForest (Azimuth Surrogate)
                    </strong>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {pipelineStatus === "running" ? (
                    <button
                      disabled
                      className="tx-btn-primary px-5 h-11 text-xs font-medium flex items-center gap-2 opacity-80 cursor-not-allowed"
                    >
                      <CircleNotch size={15} weight="regular" className="animate-spin text-white" />
                      Running Pipeline...
                    </button>
                  ) : pipelineStatus === "complete" ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={viewInDashboard}
                        className="tx-btn-primary px-5 h-11 text-xs font-medium flex items-center gap-2 shadow-sm"
                      >
                        <ArrowSquareOut size={15} weight="regular" />
                        View in Dashboard
                      </button>
                      <button
                        onClick={resetPipeline}
                        className="tx-btn-secondary px-4 h-11 text-xs font-medium flex items-center gap-1.5"
                      >
                        <ArrowClockwise size={15} weight="regular" />
                        Reset
                      </button>
                      <button
                        onClick={downloadReport}
                        className="tx-btn-secondary px-4 h-11 text-xs font-medium flex items-center gap-1.5"
                      >
                        <DownloadSimple size={15} weight="regular" />
                        Report
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={runPipeline}
                      disabled={createProjectMutation.isPending || runPipelineMutation.isPending}
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
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8"
              >
                {/* Stage 0: AI Parsing */}
                <div
                  className={`tx-card p-6 transition-opacity duration-300 ${
                    stage0?.status !== "complete" && stage0?.status !== "running" ? "opacity-40" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Brain size={18} weight="regular" className="text-[#0F766E]" />
                      <h4 className="font-sans text-sm font-semibold text-zinc-950">
                        AI Goal Parsing
                      </h4>
                    </div>
                    {stage0?.status === "complete" ? (
                      <CheckCircle size={16} weight="fill" className="text-[#0F766E]" />
                    ) : stage0?.status === "running" ? (
                      <CircleNotch size={16} weight="regular" className="text-[#0F766E] animate-spin" />
                    ) : null}
                  </div>
                  {stage0?.status === "complete" && (
                    <div className="space-y-2.5 text-xs font-sans">
                      <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70">
                        <span className="text-zinc-500 font-sans block mb-1">
                          Mapped Species
                        </span>
                        <span className="font-mono font-semibold text-zinc-950">
                          {activeOrganism.name} ({activeOrganism.genome})
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70">
                        <span className="text-zinc-500 font-sans block mb-1">
                          Target Locus
                        </span>
                        <span className="font-mono text-zinc-800">
                          {(stage0.outputData as any)?.gene ||
                            ((stage0.outputData as any)?.length
                              ? `Custom DNA (${(stage0.outputData as any).length} bp)`
                              : "Validated sequence")}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stage 1: Gene ID */}
                <div
                  className={`tx-card p-6 transition-opacity duration-300 ${
                    stage1?.status !== "complete" && stage1?.status !== "running" ? "opacity-40" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Dna size={18} weight="regular" className="text-[#0F766E]" />
                      <h4 className="font-sans text-sm font-semibold text-zinc-950">
                        Gene ID & Locus
                      </h4>
                    </div>
                    {stage1?.status === "complete" ? (
                      <CheckCircle size={16} weight="fill" className="text-[#0F766E]" />
                    ) : stage1?.status === "running" ? (
                      <CircleNotch size={16} weight="regular" className="text-[#0F766E] animate-spin" />
                    ) : null}
                  </div>
                  {stage1?.status === "complete" && (
                    <div className="space-y-2.5 text-xs font-sans">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-200/70">
                        <span className="text-zinc-500">Symbol:</span>
                        <span className="font-mono font-semibold text-zinc-950">
                          {(stage1.outputData as any)?.symbol || "Target Locus"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-200/70">
                        <span className="text-zinc-500">Coordinates:</span>
                        <span className="font-mono text-zinc-800 truncate max-w-[130px]">
                          {(stage1.outputData as any)?.locus || "Sequence-relative"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stage 2: PAM Scanning */}
                <div
                  className={`tx-card p-6 transition-opacity duration-300 ${
                    stage2?.status !== "complete" && stage2?.status !== "running" ? "opacity-40" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Target size={18} weight="regular" className="text-[#0F766E]" />
                      <h4 className="font-sans text-sm font-semibold text-zinc-950">
                        PAM Scanning
                      </h4>
                    </div>
                    {stage2?.status === "complete" ? (
                      <CheckCircle size={16} weight="fill" className="text-[#0F766E]" />
                    ) : stage2?.status === "running" ? (
                      <CircleNotch size={16} weight="regular" className="text-[#0F766E] animate-spin" />
                    ) : null}
                  </div>
                  {stage2?.status === "complete" && (
                    <div className="space-y-2.5 text-xs font-sans">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-200/70">
                        <span className="text-zinc-500">Detected SpCas9 PAMs</span>
                        <span className="font-mono font-semibold text-zinc-950">
                          {(stage2.outputData as any)?.totalPamCount ?? 0} sites
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-200/70">
                        <span className="text-zinc-500">Strand Breakdown</span>
                        <span className="font-mono text-zinc-700">
                          +{(stage2.outputData as any)?.forwardCount ?? 0} / -{(stage2.outputData as any)?.reverseCount ?? 0}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stage 3: gRNA Pool */}
                <div
                  className={`tx-card p-6 transition-opacity duration-300 ${
                    stage3?.status !== "complete" && stage3?.status !== "running" ? "opacity-40" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Flask size={18} weight="regular" className="text-[#0F766E]" />
                      <h4 className="font-sans text-sm font-semibold text-zinc-950">
                        Candidate Guides
                      </h4>
                    </div>
                    {stage3?.status === "complete" ? (
                      <CheckCircle size={16} weight="fill" className="text-[#0F766E]" />
                    ) : stage3?.status === "running" ? (
                      <CircleNotch size={16} weight="regular" className="text-[#0F766E] animate-spin" />
                    ) : null}
                  </div>
                  {stage3?.status === "complete" && (
                    <div className="space-y-2.5 text-xs font-sans">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-200/70">
                        <span className="text-zinc-500">Generated Guides</span>
                        <span className="font-mono font-semibold text-zinc-950">
                          {candidates.length} guides
                        </span>
                      </div>
                      {topCandidate && (
                        <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/70 font-mono text-[11px] text-zinc-900 truncate">
                          5' {topCandidate.guideSequence} 3'
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Stage 4: Efficiency Prediction */}
                <div
                  className={`tx-card p-6 transition-opacity duration-300 ${
                    stage4?.status !== "complete" && stage4?.status !== "running" ? "opacity-40" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <ChartBar size={18} weight="regular" className="text-[#0F766E]" />
                      <h4 className="font-sans text-sm font-semibold text-zinc-950">
                        Cutting Efficiency
                      </h4>
                    </div>
                    {stage4?.status === "complete" ? (
                      <CheckCircle size={16} weight="fill" className="text-[#0F766E]" />
                    ) : stage4?.status === "running" ? (
                      <CircleNotch size={16} weight="regular" className="text-[#0F766E] animate-spin" />
                    ) : null}
                  </div>
                  {stage4?.status === "complete" && (
                    <div className="space-y-2.5 text-xs font-sans">
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/70">
                          <span className="text-[10px] text-zinc-500 block font-sans">RandomForest ML</span>
                          <span className="font-mono font-semibold text-zinc-950">
                            {(stage4.outputData as any)?.averageMlScore !== "N/A"
                              ? (stage4.outputData as any)?.averageMlScore
                              : "N/A"}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/70">
                          <span className="text-[10px] text-zinc-500 block font-sans">Quality Heuristic</span>
                          <span className="font-mono font-semibold text-zinc-950">
                            {(stage4.outputData as any)?.averageHeuristicScore ?? "N/A"}
                          </span>
                        </div>
                      </div>
                      <div className="text-center pt-1 font-sans text-[11px] text-zinc-500">
                        XGB/LGB: <span className="text-zinc-400">Offline</span> · RF:{" "}
                        <span className="text-[#0F766E] font-medium">Trained Azimuth Surrogate</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stage 5: Off-Target Analysis */}
                <div
                  className={`tx-card p-6 transition-opacity duration-300 ${
                    stage5?.status !== "complete" && stage5?.status !== "running" ? "opacity-40" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={18} weight="regular" className="text-amber-600" />
                      <h4 className="font-sans text-sm font-semibold text-zinc-950">
                        Off-Target Risk
                      </h4>
                    </div>
                    {stage5?.status === "complete" ? (
                      <CheckCircle size={16} weight="fill" className="text-[#0F766E]" />
                    ) : stage5?.status === "running" ? (
                      <CircleNotch size={16} weight="regular" className="text-[#0F766E] animate-spin" />
                    ) : null}
                  </div>
                  {stage5?.status === "complete" && (
                    <div className="space-y-2.5 text-xs font-sans">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/60 border border-amber-200/70">
                        <div className="px-2 py-1 rounded bg-amber-100 font-mono font-bold text-amber-800 text-[10px]">
                          UNASSESSED
                        </div>
                        <div>
                          <span className="font-sans font-semibold text-zinc-950 block">
                            Isolated Target
                          </span>
                          <span className="text-[11px] text-zinc-500 font-sans">
                            Requires indexed reference genome
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stage 6: SHAP / Feature Attribution */}
                <div
                  className={`tx-card p-6 transition-opacity duration-300 ${
                    stage6?.status !== "complete" && stage6?.status !== "running" ? "opacity-40" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Sparkle size={18} weight="regular" className="text-[#0F766E]" />
                      <h4 className="font-sans text-sm font-semibold text-zinc-950">
                        Feature Attribution
                      </h4>
                    </div>
                    {stage6?.status === "complete" ? (
                      <CheckCircle size={16} weight="fill" className="text-[#0F766E]" />
                    ) : stage6?.status === "running" ? (
                      <CircleNotch size={16} weight="regular" className="text-[#0F766E] animate-spin" />
                    ) : null}
                  </div>
                  {stage6?.status === "complete" && (
                    <div className="space-y-2 text-[11px] font-sans">
                      {topCandidate ? (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-600 font-mono text-[10px]">GC Content:</span>
                            <span className="font-mono font-medium text-zinc-900">
                              {Math.round((topCandidate.gcContent || 0) * 100)}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-600 font-mono text-[10px]">Poly-T Signal:</span>
                            <span className={`font-mono font-medium ${topCandidate.guideSequence.includes("TTTT") ? "text-rose-600" : "text-[#0F766E]"}`}>
                              {topCandidate.guideSequence.includes("TTTT") ? "Detected (Penalty)" : "Clean"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-600 font-mono text-[10px]">Position 20 G:</span>
                            <span className="font-mono font-medium text-zinc-900">
                              {topCandidate.guideSequence[19] === "G" ? "Guanine Favored" : "Non-G"}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="text-zinc-500 text-[10px]">No candidate features to explain</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Stage 7: PDF Report Generation */}
                <div
                  className={`tx-card p-6 transition-opacity duration-300 ${
                    stage7?.status !== "complete" && stage7?.status !== "running" ? "opacity-40" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <FileText size={18} weight="regular" className="text-[#0F766E]" />
                      <h4 className="font-sans text-sm font-semibold text-zinc-950">
                        Research Summary
                      </h4>
                    </div>
                    {stage7?.status === "complete" ? (
                      <CheckCircle size={16} weight="fill" className="text-[#0F766E]" />
                    ) : stage7?.status === "running" ? (
                      <CircleNotch size={16} weight="regular" className="text-[#0F766E] animate-spin" />
                    ) : null}
                  </div>
                  {stage7?.status === "complete" && (
                    <div className="space-y-2.5">
                      <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200/60 text-xs font-sans text-[#0F766E] font-medium text-center">
                        {candidates.length > 0 ? `${candidates.length} Guides Evaluated` : "Zero PAMs Detected"}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={downloadReport}
                          className="tx-btn-primary px-3 h-8 text-xs font-medium flex items-center justify-center gap-1 flex-1 shadow-2xs"
                        >
                          <DownloadSimple size={13} weight="regular" />
                          PDF
                        </button>
                        <button
                          onClick={copyData}
                          className="tx-btn-secondary px-3 h-8 text-xs font-medium flex items-center justify-center gap-1 flex-1 shadow-2xs"
                        >
                          <Copy size={13} weight="regular" />
                          Copy
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
                <div className="flex items-center justify-between mb-3">
                  <span className="font-sans text-xs font-semibold uppercase tracking-wider text-zinc-500 block">
                    Reference Organisms
                  </span>
                  {overrideOrganismId && (
                    <button
                      onClick={() => setOverrideOrganismId(null)}
                      className="text-[11px] font-sans text-[#0F766E] hover:underline"
                    >
                      Reset Auto-Detect
                    </button>
                  )}
                </div>

                {/* Category Filter Tabs */}
                <div className="flex gap-1 mb-3 overflow-x-auto pb-1 scrollbar-none">
                  {["All", "Biomedical", "Crop / AgBiotech", "Preclinical Model", "Biomanufacturing"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setOrganismCategory(cat)}
                      className={`px-2 py-0.5 text-[10px] font-sans rounded-md transition-colors ${
                        organismCategory === cat
                          ? "bg-zinc-900 text-white font-medium"
                          : "text-zinc-600 hover:text-zinc-900 bg-zinc-100"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-sans max-h-[220px] overflow-y-auto pr-1">
                  {supportedOrganisms
                    .filter((org) => organismCategory === "All" || org.category === organismCategory)
                    .map((org) => {
                      const isSelected = activeOrganism.id === org.id;
                      return (
                        <button
                          key={org.id}
                          onClick={() => setOverrideOrganismId(org.id)}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? "bg-teal-50/80 border-[#0F766E] text-[#0F766E] font-medium"
                              : "bg-zinc-50 border-zinc-200/70 text-zinc-700 hover:border-zinc-300"
                          }`}
                        >
                          <div className="truncate font-semibold text-xs">{org.name}</div>
                          <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{org.genome}</div>
                        </button>
                      );
                    })}
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
                    <span className="text-zinc-500">ML Regressor</span>
                    <span className="font-mono font-medium text-[#0F766E]">RandomForest Surrogate</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-zinc-500">Off-target Alignment</span>
                    <span className="font-mono font-medium text-amber-600">Unassessed without index</span>
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
