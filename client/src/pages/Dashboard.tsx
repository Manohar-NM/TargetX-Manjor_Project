/*
 * Dashboard Page — Data-Rich CRISPR Analytics & Interpretability View
 * Features:
 * - Grouped metrics with divide-y / border-t (no boxed numbers)
 * - Single teal series (#0F766E) charts plus zinc neutrals, thin gridlines, no chart borders
 * - Sticky header candidate table, Geist Mono sequences & scores, inline thin score bars, PAM highlighted in teal
 * - Loading skeletons, empty states (explaining how to run pipeline), and inline error states
 */
import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
} from "recharts";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DownloadSimple,
  Copy,
  ChartBar,
  Sparkle,
  ShieldCheck,
  ArrowRight,
  ArrowsClockwise,
  WarningCircle,
} from "@phosphor-icons/react";
import { generateTargetXPdfReport } from "@/lib/generatePdfReport";
import { toast } from "sonner";
import { Link } from "wouter";

const efficiencyData = [
  { guide: "TX-01", ensemble: 0.92, xgboost: 0.93, baseline: 0.70 },
  { guide: "TX-02", ensemble: 0.88, xgboost: 0.89, baseline: 0.70 },
  { guide: "TX-03", ensemble: 0.85, xgboost: 0.86, baseline: 0.70 },
  { guide: "TX-04", ensemble: 0.82, xgboost: 0.83, baseline: 0.70 },
  { guide: "TX-05", ensemble: 0.79, xgboost: 0.80, baseline: 0.70 },
  { guide: "TX-06", ensemble: 0.76, xgboost: 0.77, baseline: 0.70 },
  { guide: "TX-07", ensemble: 0.74, xgboost: 0.75, baseline: 0.70 },
  { guide: "TX-08", ensemble: 0.71, xgboost: 0.72, baseline: 0.70 },
];

const shapAttributions = [
  { feature: "gc_content_optimal", shapValue: 0.142 },
  { feature: "position_1_guanine", shapValue: 0.087 },
  { feature: "seed_dinucleotide_GG", shapValue: 0.053 },
  { feature: "seed_purine_ratio", shapValue: 0.041 },
  { feature: "pam_proximal_trimer", shapValue: 0.038 },
  { feature: "free_energy_stability", shapValue: 0.024 },
  { feature: "homopolymer_run_penalty", shapValue: -0.031 },
  { feature: "poly_T_termination_risk", shapValue: -0.048 },
];

const scatterData = [
  { gc: 45, efficiency: 0.72 },
  { gc: 50, efficiency: 0.78 },
  { gc: 55, efficiency: 0.92 },
  { gc: 60, efficiency: 0.88 },
  { gc: 65, efficiency: 0.82 },
  { gc: 40, efficiency: 0.65 },
  { gc: 70, efficiency: 0.75 },
  { gc: 35, efficiency: 0.55 },
  { gc: 52, efficiency: 0.85 },
  { gc: 48, efficiency: 0.79 },
  { gc: 58, efficiency: 0.89 },
  { gc: 62, efficiency: 0.84 },
];

const topCandidates = [
  {
    rank: 1,
    id: "TX-007",
    spacer: "ATGGAACGTTCTAGCCGTCA",
    pam: "AGG",
    gc: 55,
    efficiency: 0.92,
    offTargetCount: 0,
    risk: "Low",
    score: 94.2,
  },
  {
    rank: 2,
    id: "TX-003",
    spacer: "CCGTAGCTTAAGCCTGATAG",
    pam: "TGG",
    gc: 50,
    efficiency: 0.88,
    offTargetCount: 0,
    risk: "Low",
    score: 91.5,
  },
  {
    rank: 3,
    id: "TX-005",
    spacer: "GCTAATCGGTACCGATCGTA",
    pam: "CGG",
    gc: 50,
    efficiency: 0.85,
    offTargetCount: 1,
    risk: "Low",
    score: 89.8,
  },
  {
    rank: 4,
    id: "TX-001",
    spacer: "TACCGATCGTAACTGCTAGC",
    pam: "GGG",
    gc: 45,
    efficiency: 0.79,
    offTargetCount: 2,
    risk: "Moderate",
    score: 82.1,
  },
  {
    rank: 5,
    id: "TX-002",
    spacer: "AGCTGATCGATCGTAGCTAG",
    pam: "AGG",
    gc: 55,
    efficiency: 0.78,
    offTargetCount: 1,
    risk: "Low",
    score: 80.4,
  },
];

const radarData = [
  { subject: "Efficiency", A: 0.92, fullMark: 1 },
  { subject: "Specificity", A: 0.88, fullMark: 1 },
  { subject: "GC Balance", A: 0.80, fullMark: 1 },
  { subject: "Seed Purity", A: 0.95, fullMark: 1 },
  { subject: "Low Off-Target", A: 0.86, fullMark: 1 },
  { subject: "Thermodynamics", A: 0.82, fullMark: 1 },
];

export default function Dashboard() {
  const [hasData, setHasData] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleExportReport = () => {
    try {
      generateTargetXPdfReport({
        reportTitle: "TargetX Command Dashboard Analytics Report",
        targetGene: "OsDREB1A / TP53",
        organism: "Homo sapiens / Oryza sativa",
        candidates: topCandidates.map((c) => ({
          rank: c.rank,
          id: c.id,
          sequence: c.spacer + c.pam,
          gc: c.gc,
          efficiency: c.efficiency,
          risk: c.risk.toLowerCase(),
          score: c.score,
        })),
      });
      toast.success("TargetX CRISPR Research PDF Report downloaded!");
    } catch (err) {
      console.error("PDF generation error:", err);
      toast.error("Failed to generate PDF report.");
    }
  };

  const handleCopyData = () => {
    navigator.clipboard.writeText(JSON.stringify(topCandidates, null, 2));
    toast.success("Copied candidates data to clipboard!");
  };

  const simulateRefresh = () => {
    setIsLoading(true);
    setHasError(false);
    setTimeout(() => {
      setIsLoading(false);
    }, 700);
  };

  return (
    <div className="flex min-h-[100dvh] circuit-bg">
      <Sidebar />

      <main className="flex-1 min-w-0 flex flex-col min-h-[100dvh]">
        <TopBar
          title="Command Dashboard"
          subtitle="CRISPR Analytics & Model Interpretability"
          pipelineStage="Complete"
        />

        <div className="mx-auto w-full max-w-[1440px] px-6 md:px-10 xl:px-12 py-10 md:py-16">
          {/* Action Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="font-sans text-xl md:text-2xl font-semibold tracking-tight text-zinc-950">
                Evaluation & Candidate Ranking
              </h2>
              <p className="font-sans text-xs text-zinc-500 mt-0.5">
                Target Gene: <strong className="text-zinc-800 font-medium">OsDREB1A (LOC_Os09g35010)</strong> · SpCas9 Reference Analysis
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={simulateRefresh}
                title="Refresh dataset"
                className="tx-btn-secondary px-3.5 h-9 text-xs font-medium flex items-center gap-1.5 shadow-2xs"
              >
                <ArrowsClockwise size={14} weight="regular" className={isLoading ? "animate-spin" : ""} />
                Refresh
              </button>
              <button
                onClick={handleCopyData}
                className="tx-btn-secondary px-3.5 h-9 text-xs font-medium flex items-center gap-1.5 shadow-2xs"
              >
                <Copy size={14} weight="regular" />
                Copy Data
              </button>
              <button
                onClick={handleExportReport}
                className="tx-btn-primary px-4 h-9 text-xs font-medium flex items-center gap-1.5 shadow-sm"
              >
                <DownloadSimple size={14} weight="regular" />
                Export Report
              </button>
            </div>
          </div>

          {/* Grouped Metrics (divide-y / border-t instead of boxing every number) */}
          <div className="tx-card p-6 md:p-8 mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200/80">
              <div className="py-2 sm:px-6 first:pl-0">
                <span className="font-sans text-xs font-medium text-zinc-500 block mb-1">
                  Validated Guides
                </span>
                <span className="font-mono text-3xl font-semibold text-zinc-950 tracking-tight block">
                  47
                </span>
                <span className="font-sans text-xs text-[#0F766E] font-medium mt-1 block">
                  100% Filter Compliant
                </span>
              </div>

              <div className="py-2 sm:px-6">
                <span className="font-sans text-xs font-medium text-zinc-500 block mb-1">
                  Top Cleavage Efficiency
                </span>
                <span className="font-mono text-3xl font-semibold text-zinc-950 tracking-tight block">
                  0.920
                </span>
                <span className="font-sans text-xs text-zinc-500 mt-1 block">
                  Ensemble Tree Model
                </span>
              </div>

              <div className="py-2 sm:px-6">
                <span className="font-sans text-xs font-medium text-zinc-500 block mb-1">
                  Off-Target Cleavage Risk
                </span>
                <span className="font-sans text-3xl font-semibold text-zinc-950 tracking-tight block">
                  Low
                </span>
                <span className="font-sans text-xs text-[#0F766E] font-medium mt-1 block">
                  0 Coding Region Collisions
                </span>
              </div>

              <div className="py-2 sm:px-6 last:pr-0">
                <span className="font-sans text-xs font-medium text-zinc-500 block mb-1">
                  Model Correlation (r)
                </span>
                <span className="font-mono text-3xl font-semibold text-zinc-950 tracking-tight block">
                  0.890
                </span>
                <span className="font-sans text-xs text-zinc-500 mt-1 block">
                  Cross-Validated Benchmark
                </span>
              </div>
            </div>
          </div>

          {/* Inline Error State Banner (if active) */}
          {hasError && (
            <div className="tx-card p-5 mb-8 border-rose-200 bg-rose-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <WarningCircle size={20} weight="regular" className="text-rose-600" />
                <div>
                  <span className="font-sans text-sm font-semibold text-rose-950 block">
                    Unable to load candidate records
                  </span>
                  <span className="font-sans text-xs text-rose-700">
                    Failed to connect to the model inference service. Please retry.
                  </span>
                </div>
              </div>
              <button
                onClick={() => setHasError(false)}
                className="tx-btn-secondary px-3 py-1.5 text-xs text-rose-900 border-rose-200"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Loading Skeleton State */}
          {isLoading ? (
            <div className="tx-card p-8 space-y-4">
              <div className="h-6 w-48 bg-zinc-200/60 rounded-lg animate-pulse" />
              <div className="h-4 w-96 bg-zinc-200/40 rounded-lg animate-pulse" />
              <div className="pt-4 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-10 w-full bg-zinc-100 rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
          ) : !hasData ? (
            /* Empty State */
            <div className="tx-card p-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-4 text-zinc-500">
                <ChartBar size={24} weight="regular" />
              </div>
              <h3 className="font-sans text-base font-semibold text-zinc-950 mb-1">
                No Candidate Guides Generated
              </h3>
              <p className="font-sans text-sm text-zinc-600 max-w-md mx-auto mb-6">
                Run the 8-stage CRISPR design pipeline first to score targets and compute off-target profiles.
              </p>
              <Link href="/pipeline">
                <button className="tx-btn-primary px-5 h-10 text-xs font-medium inline-flex items-center gap-2">
                  Go to Pipeline
                  <ArrowRight size={14} weight="regular" />
                </button>
              </Link>
            </div>
          ) : (
            /* Main Analytics Tabs */
            <Tabs defaultValue="overview" className="w-full">
              <div className="flex items-center justify-between mb-6">
                <TabsList className="bg-zinc-100 p-1 rounded-xl border border-zinc-200/60">
                  <TabsTrigger
                    value="overview"
                    className="font-sans text-xs font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:text-zinc-950 data-[state=active]:font-semibold data-[state=active]:shadow-2xs text-zinc-600 px-4 py-1.5"
                  >
                    Ranked Candidates
                  </TabsTrigger>
                  <TabsTrigger
                    value="efficiency"
                    className="font-sans text-xs font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:text-zinc-950 data-[state=active]:font-semibold data-[state=active]:shadow-2xs text-zinc-600 px-4 py-1.5"
                  >
                    Cutting Efficiency
                  </TabsTrigger>
                  <TabsTrigger
                    value="shap"
                    className="font-sans text-xs font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:text-zinc-950 data-[state=active]:font-semibold data-[state=active]:shadow-2xs text-zinc-600 px-4 py-1.5"
                  >
                    SHAP Attribution
                  </TabsTrigger>
                  <TabsTrigger
                    value="offtarget"
                    className="font-sans text-xs font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:text-zinc-950 data-[state=active]:font-semibold data-[state=active]:shadow-2xs text-zinc-600 px-4 py-1.5"
                  >
                    Off-Target Profile
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* TAB 1: Ranked Candidates Table */}
              <TabsContent value="overview">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Candidates Table (8 cols): Sticky header, zinc-50 header, Geist Mono sequences & scores, PAM highlighted in teal, thin inline score bar */}
                  <div className="lg:col-span-8 tx-card p-6 md:p-8">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h3 className="font-sans text-base font-semibold text-zinc-950">
                          Candidate Evaluation Table
                        </h3>
                        <p className="font-sans text-xs text-zinc-500 mt-0.5">
                          Ranked by composite efficiency, specificity, and structural stability.
                        </p>
                      </div>
                      <span className="font-mono text-xs text-zinc-500">
                        Top 5 / 47 candidates
                      </span>
                    </div>

                    <div className="overflow-x-auto max-h-[460px] rounded-xl border border-zinc-200/70">
                      <table className="w-full text-left text-xs font-sans">
                        {/* Sticky Header with zinc-50 row */}
                        <thead className="sticky top-0 bg-zinc-50 text-zinc-600 border-b border-zinc-200/80 z-10">
                          <tr>
                            <th className="py-3 px-3.5 font-semibold">Rank</th>
                            <th className="py-3 px-3 font-semibold">ID</th>
                            <th className="py-3 px-3 font-semibold">Sequence (20-nt + PAM)</th>
                            <th className="py-3 px-3 font-semibold">GC %</th>
                            <th className="py-3 px-3 font-semibold">Efficiency</th>
                            <th className="py-3 px-3 font-semibold">Risk</th>
                            <th className="py-3 px-3.5 font-semibold text-right">Composite</th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-zinc-200/60 bg-white">
                          {topCandidates.map((c) => (
                            <tr key={c.id} className="hover:bg-zinc-50/80 transition-colors">
                              <td className="py-3.5 px-3.5 font-mono text-zinc-950 font-semibold">
                                #{c.rank}
                              </td>
                              <td className="py-3.5 px-3 font-mono font-medium text-zinc-700">
                                {c.id}
                              </td>
                              <td className="py-3.5 px-3 font-mono tracking-wide text-zinc-900 select-all">
                                <span>{c.spacer}</span>
                                <span className="text-[#0F766E] font-bold ml-1.5 bg-teal-50 px-1 py-0.5 rounded border border-teal-200/60">
                                  {c.pam}
                                </span>
                              </td>
                              <td className="py-3.5 px-3 font-mono text-zinc-600">
                                {c.gc}%
                              </td>
                              <td className="py-3.5 px-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-[#0F766E] rounded-full"
                                      style={{ width: `${c.efficiency * 100}%` }}
                                    />
                                  </div>
                                  <span className="font-mono text-xs font-semibold text-zinc-950">
                                    {c.efficiency.toFixed(2)}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3.5 px-3">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-sans font-medium bg-zinc-100 text-zinc-700 border border-zinc-200/60">
                                  {c.risk}
                                </span>
                              </td>
                              <td className="py-3.5 px-3.5 font-mono font-semibold text-zinc-950 text-right">
                                {c.score}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Top Guide Profile Radar (4 cols) */}
                  <div className="lg:col-span-4 tx-card p-6 md:p-8 flex flex-col justify-between">
                    <div>
                      <h3 className="font-sans text-base font-semibold text-zinc-950">
                        Top Candidate Radar Profile
                      </h3>
                      <p className="font-sans text-xs text-zinc-500 mt-0.5 mb-4">
                        Multi-dimensional index for TX-007
                      </p>
                    </div>

                    <div className="h-[280px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="#e4e4e7" strokeDasharray="3 3" />
                          <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: "#52525b", fontSize: 11, fontFamily: "Geist" }}
                          />
                          <PolarRadiusAxis
                            angle={30}
                            domain={[0, 1]}
                            tick={{ fill: "#a1a1aa", fontSize: 9 }}
                            axisLine={false}
                          />
                          <Radar
                            name="Candidate TX-007"
                            dataKey="A"
                            stroke="#0F766E"
                            fill="#0F766E"
                            fillOpacity={0.15}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="pt-4 border-t border-zinc-200/60 flex items-center justify-between text-xs font-sans text-zinc-600">
                      <span>Composite Quality:</span>
                      <strong className="text-zinc-950 font-mono">94.2 / 100</strong>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* TAB 2: Cutting Efficiency (Single Teal Series + Zinc Neutrals, Thin Gridlines) */}
              <TabsContent value="efficiency">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="tx-card p-6 md:p-8">
                    <h3 className="font-sans text-base font-semibold text-zinc-950 mb-1">
                      Ensemble Efficiency per Guide
                    </h3>
                    <p className="font-sans text-xs text-zinc-500 mb-6">
                      Weighted score combining XGBoost, LightGBM, and Random Forest predictions.
                    </p>

                    <div className="h-[320px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={efficiencyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                          <XAxis
                            dataKey="guide"
                            tick={{ fill: "#52525b", fontSize: 11, fontFamily: "Geist Mono" }}
                            axisLine={{ stroke: "#e4e4e7" }}
                            tickLine={false}
                          />
                          <YAxis
                            domain={[0, 1]}
                            tick={{ fill: "#52525b", fontSize: 11, fontFamily: "Geist Mono" }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#ffffff",
                              borderColor: "rgba(228, 228, 231, 0.8)",
                              borderRadius: "12px",
                              boxShadow: "0 10px 25px -5px rgba(15,23,42,0.06)",
                              fontSize: "12px",
                              fontFamily: "Geist",
                              color: "#09090b",
                            }}
                          />
                          {/* Single Teal Series (#0F766E) */}
                          <Bar dataKey="ensemble" fill="#0F766E" name="Ensemble Efficiency" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="tx-card p-6 md:p-8">
                    <h3 className="font-sans text-base font-semibold text-zinc-950 mb-1">
                      GC % vs Cutting Efficiency Scatter
                    </h3>
                    <p className="font-sans text-xs text-zinc-500 mb-6">
                      Observed distribution confirming high efficiency between 45% and 65% GC content.
                    </p>

                    <div className="h-[320px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                          <XAxis
                            dataKey="gc"
                            name="GC Content"
                            unit="%"
                            tick={{ fill: "#52525b", fontSize: 11, fontFamily: "Geist Mono" }}
                            axisLine={{ stroke: "#e4e4e7" }}
                            tickLine={false}
                          />
                          <YAxis
                            dataKey="efficiency"
                            name="Efficiency"
                            domain={[0.4, 1.0]}
                            tick={{ fill: "#52525b", fontSize: 11, fontFamily: "Geist Mono" }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip
                            cursor={{ strokeDasharray: "3 3", stroke: "#e4e4e7" }}
                            contentStyle={{
                              backgroundColor: "#ffffff",
                              borderColor: "rgba(228, 228, 231, 0.8)",
                              borderRadius: "12px",
                              boxShadow: "0 10px 25px -5px rgba(15,23,42,0.06)",
                              fontSize: "12px",
                              fontFamily: "Geist",
                            }}
                          />
                          {/* Single Teal Series (#0F766E) */}
                          <Scatter name="Guides" data={scatterData} fill="#0F766E" />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* TAB 3: SHAP Feature Attribution */}
              <TabsContent value="shap">
                <div className="tx-card p-6 md:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-sans text-base font-semibold text-zinc-950">
                        SHAP Feature Attribution (TreeExplainer)
                      </h3>
                      <p className="font-sans text-xs text-zinc-500 mt-0.5">
                        Marginal Shapley contribution of sequence features to cleavage efficiency score.
                      </p>
                    </div>
                    <span className="font-mono text-xs text-[#0F766E] font-medium">
                      Base Expected Value: 0.720
                    </span>
                  </div>

                  <div className="space-y-3 max-w-3xl">
                    {shapAttributions.map((item, idx) => {
                      const isPositive = item.shapValue > 0;
                      return (
                        <div key={idx} className="flex items-center gap-4 text-xs font-sans">
                          <span className="w-56 text-zinc-700 font-mono text-[11px] truncate">
                            {item.feature}
                          </span>
                          <div className="flex-1 h-2 rounded-full bg-zinc-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isPositive ? "bg-[#0F766E]" : "bg-zinc-400"
                              }`}
                              style={{
                                width: `${Math.min(100, Math.abs(item.shapValue) * 600)}%`,
                              }}
                            />
                          </div>
                          <span
                            className={`font-mono text-xs font-semibold w-16 text-right ${
                              isPositive ? "text-[#0F766E]" : "text-zinc-600"
                            }`}
                          >
                            {isPositive ? `+${item.shapValue.toFixed(3)}` : item.shapValue.toFixed(3)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>

              {/* TAB 4: Off-Target Analysis */}
              <TabsContent value="offtarget">
                <div className="tx-card p-6 md:p-8">
                  <h3 className="font-sans text-base font-semibold text-zinc-950 mb-1">
                    Cas-OFFinder Genome-Wide Scan Profile
                  </h3>
                  <p className="font-sans text-xs text-zinc-500 mb-6">
                    Genome-scale mismatch distribution across 10⁶ scanned sites.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/70">
                      <span className="font-sans text-xs text-zinc-500 block mb-1">
                        Zero Mismatch (Exact Matches)
                      </span>
                      <span className="font-mono text-2xl font-semibold text-zinc-950 block">
                        1 Target Site
                      </span>
                      <span className="font-sans text-xs text-[#0F766E] font-medium mt-1 block">
                        On-Target Chromosome 9
                      </span>
                    </div>

                    <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/70">
                      <span className="font-sans text-xs text-zinc-500 block mb-1">
                        1–2 Mismatch Sites
                      </span>
                      <span className="font-mono text-2xl font-semibold text-zinc-950 block">
                        2 Non-Coding Sites
                      </span>
                      <span className="font-sans text-xs text-zinc-600 font-medium mt-1 block">
                        Distal PAM Mismatches
                      </span>
                    </div>

                    <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/70">
                      <span className="font-sans text-xs text-zinc-500 block mb-1">
                        Exonic Coding Collisions
                      </span>
                      <span className="font-mono text-2xl font-semibold text-zinc-950 block">
                        0 Sites
                      </span>
                      <span className="font-sans text-xs text-[#0F766E] font-medium mt-1 block">
                        Zero Gene Disruption Risk
                      </span>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
    </div>
  );
}
