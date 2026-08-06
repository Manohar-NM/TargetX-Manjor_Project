/*
 * Dashboard Page — Data-rich analytics view
 * Genome Noir: glass panels, charts, tables, SHAP visualizations
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
  ZAxis,
  Cell,
} from "recharts";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Copy, Filter, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";

const efficiencyData = [
  { guide: "Guide_01", xgboost: 0.82, lightgbm: 0.79, randomforest: 0.76, ensemble: 0.79 },
  { guide: "Guide_02", xgboost: 0.78, lightgbm: 0.81, randomforest: 0.74, ensemble: 0.78 },
  { guide: "Guide_03", xgboost: 0.91, lightgbm: 0.88, randomforest: 0.85, ensemble: 0.88 },
  { guide: "Guide_04", xgboost: 0.65, lightgbm: 0.68, randomforest: 0.62, ensemble: 0.65 },
  { guide: "Guide_05", xgboost: 0.87, lightgbm: 0.85, randomforest: 0.83, ensemble: 0.85 },
  { guide: "Guide_06", xgboost: 0.72, lightgbm: 0.74, randomforest: 0.70, ensemble: 0.72 },
  { guide: "Guide_07", xgboost: 0.94, lightgbm: 0.92, randomforest: 0.90, ensemble: 0.92 },
  { guide: "Guide_08", xgboost: 0.58, lightgbm: 0.61, randomforest: 0.55, ensemble: 0.58 },
];

const shapBeeswarmData = [
  { feature: "gc_content", meanShap: 0.142, range: [0.05, 0.22] },
  { feature: "position_1_G", meanShap: 0.087, range: [0.02, 0.15] },
  { feature: "dinucleotide_GG", meanShap: 0.053, range: [-0.01, 0.12] },
  { feature: "self_complementarity", meanShap: 0.041, range: [-0.02, 0.09] },
  { feature: "trimer_GGC", meanShap: 0.038, range: [0.01, 0.08] },
  { feature: "homopolymer_run_max", meanShap: 0.031, range: [-0.04, 0.06] },
  { feature: "first_nucleotide_T", meanShap: 0.022, range: [-0.05, 0.07] },
  { feature: "pam_distance", meanShap: 0.018, range: [-0.01, 0.05] },
  { feature: "purine_pyrimidine_ratio", meanShap: 0.015, range: [-0.01, 0.04] },
  { feature: "last_nucleotide_A", meanShap: 0.012, range: [-0.01, 0.03] },
];

const scatterData = [
  { gc: 45, efficiency: 0.72, mismatch: 1 },
  { gc: 50, efficiency: 0.78, mismatch: 0 },
  { gc: 55, efficiency: 0.85, mismatch: 0 },
  { gc: 60, efficiency: 0.88, mismatch: 0 },
  { gc: 65, efficiency: 0.82, mismatch: 1 },
  { gc: 40, efficiency: 0.65, mismatch: 2 },
  { gc: 70, efficiency: 0.75, mismatch: 1 },
  { gc: 35, efficiency: 0.55, mismatch: 3 },
  { gc: 75, efficiency: 0.68, mismatch: 2 },
  { gc: 52, efficiency: 0.81, mismatch: 0 },
  { gc: 48, efficiency: 0.74, mismatch: 1 },
  { gc: 58, efficiency: 0.86, mismatch: 0 },
  { gc: 62, efficiency: 0.84, mismatch: 1 },
  { gc: 43, efficiency: 0.69, mismatch: 2 },
  { gc: 67, efficiency: 0.80, mismatch: 1 },
];

const topCandidates = [
  { rank: 1, id: "TX-007", sequence: "ATGGAACGTTCTAGCCGTCA", gc: 55, efficiency: 0.92, risk: "low", score: 94.2 },
  { rank: 2, id: "TX-003", sequence: "CCGTAGCTTAAGCCTGATAG", gc: 50, efficiency: 0.88, risk: "low", score: 91.5 },
  { rank: 3, id: "TX-005", sequence: "GCTAATCGGTACCGATCGTA", gc: 50, efficiency: 0.85, risk: "low", score: 89.8 },
  { rank: 4, id: "TX-001", sequence: "TACCGATCGTAACTGCTAGC", gc: 45, efficiency: 0.79, risk: "medium", score: 82.1 },
  { rank: 5, id: "TX-002", sequence: "AGCTGATCGATCGTAGCTAG", gc: 55, efficiency: 0.78, risk: "low", score: 80.4 },
];

const radarData = [
  { subject: "Efficiency", A: 0.92, fullMark: 1 },
  { subject: "Specificity", A: 0.88, fullMark: 1 },
  { subject: "GC Balance", A: 0.75, fullMark: 1 },
  { subject: "Seed Match", A: 0.95, fullMark: 1 },
  { subject: "Low Off-target", A: 0.82, fullMark: 1 },
  { subject: "Thermo Stability", A: 0.78, fullMark: 1 },
];

const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
};

import { generateTargetXPdfReport } from "@/lib/generatePdfReport";

export default function Dashboard() {
  const handleExportReport = () => {
    try {
      generateTargetXPdfReport({
        reportTitle: "TargetX Command Dashboard Analytics Report",
        targetGene: "OsDREB1A / TP53",
        organism: "Homo sapiens / Oryza sativa",
        candidates: topCandidates,
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

  return (
    <div className="min-h-screen flex bg-[#0a0e1a] circuit-bg-subtle">
      <Sidebar />

      <div className="flex-1 ml-[220px] flex flex-col">
        <TopBar
          title="Command Dashboard"
          subtitle="CRISPR Analytics & Model Interpretability"
          pipelineStage="Complete"
        />

        <div className="flex-1 p-6 overflow-auto relative z-10">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="glass-panel p-4">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Total Candidates</span>
              <div className="text-2xl font-mono font-bold text-slate-100 mt-1">47</div>
              <span className="text-[10px] font-mono text-emerald-400 mt-1 inline-block">100% Validated</span>
            </div>

            <div className="glass-panel p-4">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Top Efficiency Score</span>
              <div className="text-2xl font-mono font-bold text-cyan-400 mt-1">0.920</div>
              <span className="text-[10px] font-mono text-cyan-500/80 mt-1 inline-block">PyTorch + GBDT</span>
            </div>

            <div className="glass-panel p-4">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Off-Target Risk Profile</span>
              <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">LOW</div>
              <span className="text-[10px] font-mono text-slate-400 mt-1 inline-block">0 Coding Region Mismatches</span>
            </div>

            <div className="glass-panel p-4">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Avg Pearson r Metric</span>
              <div className="text-2xl font-mono font-bold text-cyan-300 mt-1">0.890</div>
              <span className="text-[10px] font-mono text-slate-400 mt-1 inline-block">Doench 2016 Benchmark</span>
            </div>
          </div>

          {/* Main Analytics Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList className="bg-[#0d1117] border border-cyan-500/20 p-1">
                <TabsTrigger value="overview" className="font-mono text-xs data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="efficiency" className="font-mono text-xs data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                  On-Target Efficiency
                </TabsTrigger>
                <TabsTrigger value="offtarget" className="font-mono text-xs data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                  Off-Target Analysis
                </TabsTrigger>
                <TabsTrigger value="shap" className="font-mono text-xs data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                  Explainability (SHAP)
                </TabsTrigger>
              </TabsList>

              <div className="flex gap-2">
                <Button onClick={handleCopyData} variant="outline" size="sm" className="border-slate-800 text-slate-300 font-mono text-xs">
                  <Copy className="w-3.5 h-3.5 mr-1" /> Copy Data
                </Button>
                <Button onClick={handleExportReport} size="sm" className="bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono text-xs">
                  <Download className="w-3.5 h-3.5 mr-1" /> Export Report
                </Button>
              </div>
            </div>

            {/* TAB 1: Overview */}
            <TabsContent value="overview">
              <motion.div {...fadeUp} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Candidates Table */}
                <div className="lg:col-span-2 glass-panel p-5">
                  <h3 className="font-mono text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
                    Top Candidates Ranking
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-xs">
                      <thead className="text-slate-500 border-b border-cyan-500/15">
                        <tr>
                          <th className="pb-2">Rank</th>
                          <th className="pb-2">ID</th>
                          <th className="pb-2">Sequence</th>
                          <th className="pb-2">GC %</th>
                          <th className="pb-2">Efficiency</th>
                          <th className="pb-2">Risk</th>
                          <th className="pb-2">Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-cyan-500/10 text-slate-300">
                        {topCandidates.map((c) => (
                          <tr key={c.id} className="hover:bg-cyan-500/5">
                            <td className="py-2.5 text-cyan-400 font-bold">#{c.rank}</td>
                            <td className="py-2.5 font-bold">{c.id}</td>
                            <td className="py-2.5 text-cyan-300 tracking-wider">{c.sequence}</td>
                            <td className="py-2.5">{c.gc}%</td>
                            <td className="py-2.5 font-bold text-cyan-400">{c.efficiency.toFixed(2)}</td>
                            <td className="py-2.5">
                              <Badge className={`text-[10px] ${c.risk === "low" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border-amber-500/30"}`}>
                                {c.risk.toUpperCase()}
                              </Badge>
                            </td>
                            <td className="py-2.5 font-bold text-slate-100">{c.score}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Top Guide Radar Profile */}
                <div className="glass-panel p-5">
                  <h3 className="font-mono text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
                    Top Guide Profile Radar
                  </h3>
                  <div className="h-[260px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="#1e293b" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 1]} tick={{ fill: "#475569", fontSize: 9 }} />
                        <Radar name="Candidate #1" dataKey="A" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            {/* TAB 2: Efficiency */}
            <TabsContent value="efficiency">
              <motion.div {...fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-panel p-5">
                  <h3 className="font-mono text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
                    Sub-Model Comparison (XGBoost vs LightGBM vs RandomForest)
                  </h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={efficiencyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="guide" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                        <YAxis domain={[0, 1]} tick={{ fill: "#94a3b8", fontSize: 10 }} />
                        <Tooltip contentStyle={{ backgroundColor: "#0a0e1a", borderColor: "rgba(6, 182, 212, 0.3)", fontSize: "12px" }} />
                        <Bar dataKey="xgboost" fill="#06b6d4" name="XGBoost" />
                        <Bar dataKey="lightgbm" fill="#3b82f6" name="LightGBM" />
                        <Bar dataKey="randomforest" fill="#8b5cf6" name="RandomForest" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="glass-panel p-5">
                  <h3 className="font-mono text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
                    GC % vs Efficiency Scatter
                  </h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="gc" name="GC %" unit="%" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                        <YAxis dataKey="efficiency" name="Efficiency" domain={[0, 1]} tick={{ fill: "#94a3b8", fontSize: 10 }} />
                        <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ backgroundColor: "#0a0e1a", borderColor: "rgba(6, 182, 212, 0.3)" }} />
                        <Scatter name="Candidates" data={scatterData} fill="#06b6d4" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            {/* TAB 3: Off-Target */}
            <TabsContent value="offtarget">
              <motion.div {...fadeUp} className="glass-panel p-5">
                <h3 className="font-mono text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
                  Genome-Wide Off-Target Mismatch Profile
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                    <span className="text-xs font-mono text-emerald-400">Safe Sites (0 Mismatches)</span>
                    <p className="text-xl font-mono font-bold text-slate-100 mt-1">32 Sites</p>
                  </div>
                  <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
                    <span className="text-xs font-mono text-amber-400">Caution Sites (1-2 Mismatches)</span>
                    <p className="text-xl font-mono font-bold text-slate-100 mt-1">12 Sites</p>
                  </div>
                  <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                    <span className="text-xs font-mono text-red-400">Critical Sites (Coding Region)</span>
                    <p className="text-xl font-mono font-bold text-slate-100 mt-1">3 Sites</p>
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            {/* TAB 4: SHAP Explainability */}
            <TabsContent value="shap">
              <motion.div {...fadeUp} className="glass-panel p-5">
                <h3 className="font-mono text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
                  SHAP Feature Importance Attribution
                </h3>
                <div className="space-y-3">
                  {shapBeeswarmData.map((s, idx) => (
                    <div key={idx} className="flex items-center gap-4 text-xs font-mono">
                      <span className="w-48 text-slate-400 truncate">{s.feature}</span>
                      <div className="flex-1 h-3 rounded-full bg-[#0a0e1a] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-cyan-500"
                          style={{ width: `${Math.min(100, s.meanShap * 500)}%` }}
                        />
                      </div>
                      <span className="w-16 text-right font-bold text-cyan-400">
                        +{s.meanShap.toFixed(3)}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
