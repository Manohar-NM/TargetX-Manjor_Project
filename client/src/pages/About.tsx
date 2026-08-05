/*
 * About Page — TargetX Research Platform Information
 * Genome Noir: research documentation, methodology, team, citations
 */
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Code2,
  Users,
  GraduationCap,
  ExternalLink,
  FlaskConical,
  Database,
  Cpu,
} from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
};

const methodology = [
  {
    icon: FlaskConical,
    title: "Feature Engineering",
    desc: "30 biological sequence features extracted from 20nt gRNA spacers, including nucleotide composition, positional identity, dinucleotide/trimer patterns, thermodynamic properties, and self-complementarity scores.",
  },
  {
    icon: Cpu,
    title: "Ensemble ML",
    desc: "Three independent models (XGBoost, LightGBM, Random Forest) trained on separate datasets. Weighted ensemble with cross-validated optimal weights achieving Pearson r > 0.89.",
  },
  {
    icon: Database,
    title: "Off-target Analysis",
    desc: "Cas-OFFinder genome-wide scanning with position-dependent mismatch tolerance. Cleavage probability estimation using PAM-proximal decay model.",
  },
  {
    icon: Code2,
    title: "SHAP Explainability",
    desc: "TreeExplainer for per-model SHAP values. Beeswarm plots for feature importance ranking. Force plots for individual candidate attribution.",
  },
];

const datasets = [
  { name: "Azimuth 2.0", desc: "Doench et al. 2016 — SpCas9 activity scores", size: "14K guides", url: "https://github.com/singh-lab/azimuth" },
  { name: "DeepCRISPR", desc: "Lin et al. 2018 — Genome-wide gRNA efficiency", size: "150K guides", url: "https://github.com/albertw146/DeepCRISPR" },
  { name: "CRISPRon", desc: "Kim et al. 2021 — Multi-organism prediction", size: "50K guides", url: "https://github.com/glopostman/CRISPRon" },
  { name: "GUIDE-seq", desc: "Tsai et al. 2015 — Genome-wide off-target sites", size: "500+ sites", url: "https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE61656" },
  { name: "CHANGE-seq", desc: "Frock et al. 2015 — Chromosomal integration", size: "200+ sites", url: "https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE61655" },
];

const references = [
  { authors: "Doench et al.", year: "2016", title: "Optimized sgRNA design to maximize activity and minimize off-target effects", journal: "Nature Biotechnology" },
  { authors: "Lin et al.", year: "2018", title: "DeepCRISPR: optimized CRISPR guide RNA design by deep learning", journal: "Genome Biology" },
  { authors: "Kim et al.", year: "2021", title: "Highly accurate prediction of CRISPR-mediated genome editing", journal: "Nature Biotechnology" },
  { authors: "Lundberg & Lee", year: "2017", title: "A unified approach to interpreting model predictions", journal: "Advances in Neural Information Processing Systems" },
  { authors: "Tsai et al.", year: "2015", title: "GUIDE-seq enables genome-wide profiling of off-target cleavage", journal: "Nature Biotechnology" },
];

export default function About() {
  return (
    <div className="min-h-screen flex bg-[#0a0e1a] circuit-bg-subtle">
      <Sidebar />

      <div className="flex-1 ml-[220px] flex flex-col">
        <TopBar
          title="About TargetX"
          subtitle="AI-Assisted CRISPR Guide RNA Design Platform"
        />

        <div className="flex-1 p-6 overflow-auto space-y-8">
          {/* Platform Description */}
          <motion.section variants={fadeUp} initial="initial" animate="animate">
            <h2 className="font-mono text-xl font-semibold text-slate-100 mb-3">Platform Overview</h2>
            <p className="text-sm text-slate-400 leading-relaxed max-w-3xl">
              TargetX is a research-grade computational platform that transforms the CRISPR-Cas9 guide RNA
              design process from an iterative trial-and-error workflow into a data-driven, explainable,
              and reproducible pipeline. By combining ensemble machine learning with SHAP-based
              explainability and genome-wide off-target analysis, TargetX provides researchers with
              high-confidence gRNA candidates backed by transparent decision reasoning.
            </p>
          </motion.section>

          {/* Methodology */}
          <motion.section variants={fadeUp} initial="initial" animate="animate" transition={{ delay: 0.1 }}>
            <h2 className="font-mono text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
              <Code2 className="w-4 h-4" /> Methodology
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {methodology.map((item) => (
                <div key={item.title} className="glass-panel p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-cyan-400" />
                    </div>
                    <h3 className="font-mono text-sm font-semibold text-slate-200">{item.title}</h3>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Datasets */}
          <motion.section variants={fadeUp} initial="initial" animate="animate" transition={{ delay: 0.2 }}>
            <h2 className="font-mono text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
              <Database className="w-4 h-4" /> Training Datasets
            </h2>
            <div className="glass-panel p-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-cyan-500/10">
                    <th className="text-left py-2 px-3 text-xs font-mono text-slate-500">Dataset</th>
                    <th className="text-left py-2 px-3 text-xs font-mono text-slate-500">Description</th>
                    <th className="text-right py-2 px-3 text-xs font-mono text-slate-500">Size</th>
                    <th className="text-right py-2 px-3 text-xs font-mono text-slate-500">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {datasets.map((ds) => (
                    <tr key={ds.name} className="border-b border-white/[0.02] hover:bg-cyan-500/5 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-cyan-300">{ds.name}</td>
                      <td className="py-2.5 px-3 text-slate-400 text-xs">{ds.desc}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-300 text-xs">{ds.size}</td>
                      <td className="py-2.5 px-3 text-right">
                        <a href={ds.url} target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:text-cyan-400 text-xs font-mono">
                          <ExternalLink className="w-3 h-3 inline mr-1" /> Link
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.section>

          {/* References */}
          <motion.section variants={fadeUp} initial="initial" animate="animate" transition={{ delay: 0.3 }}>
            <h2 className="font-mono text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Key References
            </h2>
            <div className="glass-panel p-5">
              <div className="space-y-3">
                {references.map((ref, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <span className="font-mono text-xs text-slate-600 mt-0.5">[{i + 1}]</span>
                    <div>
                      <p className="text-slate-300">
                        <span className="font-mono text-cyan-400">{ref.authors}</span>{" "}
                        <span className="text-slate-500">({ref.year}).</span>{" "}
                        <span className="italic">{ref.title}.</span>{" "}
                        <span className="text-slate-500">{ref.journal}.</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Tech Stack */}
          <motion.section variants={fadeUp} initial="initial" animate="animate" transition={{ delay: 0.4 }}>
            <h2 className="font-mono text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
              <Cpu className="w-4 h-4" /> Technology Stack
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-panel p-5">
                <h4 className="font-mono text-xs font-semibold text-slate-300 mb-3">Frontend</h4>
                <ul className="space-y-1.5 text-sm text-slate-400">
                  <li className="font-mono text-xs">React 19 + TypeScript</li>
                  <li className="font-mono text-xs">Tailwind CSS 4</li>
                  <li className="font-mono text-xs">Framer Motion</li>
                  <li className="font-mono text-xs">Recharts</li>
                  <li className="font-mono text-xs">shadcn/ui</li>
                </ul>
              </div>
              <div className="glass-panel p-5">
                <h4 className="font-mono text-xs font-semibold text-slate-300 mb-3">Backend</h4>
                <ul className="space-y-1.5 text-sm text-slate-400">
                  <li className="font-mono text-xs">Flask + SQLAlchemy</li>
                  <li className="font-mono text-xs">PostgreSQL</li>
                  <li className="font-mono text-xs">JWT Authentication</li>
                  <li className="font-mono text-xs">Biopython</li>
                </ul>
              </div>
              <div className="glass-panel p-5">
                <h4 className="font-mono text-xs font-semibold text-slate-300 mb-3">Machine Learning</h4>
                <ul className="space-y-1.5 text-sm text-slate-400">
                  <li className="font-mono text-xs">XGBoost + LightGBM</li>
                  <li className="font-mono text-xs">Scikit-learn</li>
                  <li className="font-mono text-xs">SHAP</li>
                  <li className="font-mono text-xs">BioBERT (NLP)</li>
                  <li className="font-mono text-xs">Cas-OFFinder</li>
                </ul>
              </div>
            </div>
          </motion.section>

          {/* Footer */}
          <div className="pt-8 pb-4 text-center">
            <p className="font-mono text-xs text-slate-600">
              TargetX v1.0.0 — Research Preview
            </p>
            <p className="font-mono text-[10px] text-slate-700 mt-1">
              Built for the TargetX CRISPR Genome Engineering Platform
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
