/*
 * Home Page — TargetX Landing
 * Genome Noir: dark obsidian background, cyan bioluminescent accents,
 * asymmetric layout, glassmorphism panels, circuit-board traces
 * Option 1: Submerged Glow & Balanced Background Dimming
 */
import { useAuth } from "@/_core/hooks/useAuth";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Dna,
  BrainCircuit,
  Microscope,
  ShieldCheck,
  BarChart3,
  FileText,
  ArrowRight,
  Zap,
  Target,
  Sparkles,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 20, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3 } },
};

const pipelineStages = [
  { icon: BrainCircuit, label: "AI Understanding", desc: "NLP goal parsing" },
  { icon: Dna, label: "Gene ID", desc: "Knowledge retrieval" },
  { icon: Target, label: "PAM Detection", desc: "Sequence scanning" },
  { icon: Microscope, label: "gRNA Generation", desc: "Candidate pool" },
  { icon: BarChart3, label: "Efficiency", desc: "ML prediction" },
  { icon: ShieldCheck, label: "Off-target", desc: "Risk analysis" },
  { icon: Sparkles, label: "Explainability", desc: "SHAP analysis" },
  { icon: FileText, label: "Report", desc: "Publication-ready" },
];

export default function Home() {
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen flex bg-[#0a0e1a] circuit-bg relative overflow-x-hidden">
      {/* Option 1: Smooth Background Gradient Overlay for Dimming Circuit Pattern under Content */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#0a0e1a]/40 via-[#0a0e1a]/75 to-[#0a0e1a]/95 pointer-events-none z-0" />

      <Sidebar />

      <main className="flex-1 ml-[220px] min-h-screen relative z-10">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-8 pt-16 pb-20">
          {/* Background gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e1a] via-transparent to-[#0a0e1a]" />
          <img
            src="/manus-storage/hero-bg_cbde5039.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e1a]/60 via-[#0a0e1a]/40 to-[#0a0e1a]/90" />

          <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            className="relative z-10 max-w-4xl"
          >
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 backdrop-blur-md">
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
                <span className="text-xs font-mono text-cyan-300 font-semibold">v1.0.0 — Research Preview</span>
              </div>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-mono text-4xl lg:text-5xl font-bold text-white leading-tight mb-4 drop-shadow-md"
            >
              AI-Powered{" "}
              <span className="text-cyan-400">CRISPR</span>
              <br />
              Guide RNA Design
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-lg text-slate-300 max-w-xl mb-8 leading-relaxed font-sans"
            >
              From biological goal to publication-ready gRNA candidates.
              TargetX combines ensemble ML models, SHAP explainability,
              and genome-wide off-target analysis in a single research-grade pipeline.
            </motion.p>

            <motion.div variants={fadeUp} className="flex items-center gap-4">
              <Link href="/pipeline">
                <Button className="bg-cyan-500 hover:bg-cyan-400 text-[#0a0e1a] font-mono font-bold px-6 h-11 gap-2 glow-cyan">
                  Launch Pipeline <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/15 font-mono px-6 h-11 backdrop-blur-md">
                  View Dashboard
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Stats Bar */}
        <section className="px-8 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: "Model Ensemble", value: "3", sub: "XGBoost + LightGBM + RF" },
              { label: "Avg. Pearson r", value: "0.89", sub: "Cross-validated" },
              { label: "Off-target Sites", value: "10⁶", sub: "Genome-wide scan" },
              { label: "SHAP Features", value: "30", sub: "Per candidate" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.2 }}
                className="glass-panel p-4 border border-cyan-500/20 hover:border-cyan-500/40 transition-all shadow-lg"
              >
                <p className="font-mono text-2xl font-bold text-cyan-400">{stat.value}</p>
                <p className="text-sm text-slate-200 font-medium mt-1">{stat.label}</p>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{stat.sub}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Pipeline Overview */}
        <section className="px-8 pb-16">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <h2 className="font-mono text-xl font-semibold text-slate-100 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              Analysis Pipeline
            </h2>
            <p className="text-xs text-slate-300 font-mono">Eight-stage computational workflow from goal to report</p>
          </motion.div>

          <div className="relative">
            {/* Connecting line */}
            <div className="absolute top-10 left-4 right-4 h-0.5 bg-gradient-to-r from-cyan-500/20 via-cyan-500/60 to-cyan-500/20 z-0" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
              {pipelineStages.map((stage, i) => (
                <motion.div
                  key={stage.label}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="glass-panel p-4 flex flex-col items-center text-center bg-[#0d1117]/85 backdrop-blur-md border border-cyan-500/25 hover:border-cyan-500/50 hover:bg-[#0d1117]/95 transition-all duration-200 shadow-[0_0_15px_rgba(6,182,212,0.12)] h-full"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#0a0e1a] border border-cyan-500/30 flex items-center justify-center mb-3 relative z-10 hover:border-cyan-500/60 transition-colors shadow-inner">
                    <stage.icon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <p className="text-sm font-bold text-slate-100 font-mono mb-1">{stage.label}</p>
                  <p className="text-xs text-cyan-300 font-mono font-medium">{stage.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="px-8 pb-20">
          <h2 className="font-mono text-xl font-semibold text-slate-100 mb-8 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            Core Capabilities
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: BrainCircuit,
                title: "NLP Goal Parser",
                desc: "Interpret research objectives in natural language. Extracts organism, phenotype, disease, and candidate genes via semantic matching.",
                tag: "BioBERT",
              },
              {
                icon: Microscope,
                title: "Ensemble Prediction",
                desc: "XGBoost + LightGBM + Random Forest weighted ensemble for gRNA cutting efficiency. Pearson r > 0.89 on held-out data.",
                tag: "ML",
              },
              {
                icon: ShieldCheck,
                title: "Off-Target Analysis",
                desc: "Genome-wide off-target scanning with Cas-OFFinder integration. Position-dependent mismatch tolerance model.",
                tag: "Genomics",
              },
              {
                icon: BarChart3,
                title: "SHAP Explainability",
                desc: "Feature attribution for every prediction. Beeswarm plots, force plots, and ranked feature importance.",
                tag: "XAI",
              },
              {
                icon: Zap,
                title: "Real-time Ranking",
                desc: "Multi-objective scoring combining efficiency, specificity, and structural features. Composite ranking with confidence intervals.",
                tag: "Scoring",
              },
              {
                icon: FileText,
                title: "Report Generation",
                desc: "Publication-quality PDF reports with all analysis stages, visualizations, and model diagnostics included.",
                tag: "Export",
              },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="glass-panel p-5 group hover:glow-cyan-subtle border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/15 flex items-center justify-center flex-shrink-0 border border-cyan-500/30 group-hover:border-cyan-500/50 transition-colors shadow-inner">
                    <card.icon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="font-mono text-sm font-semibold text-slate-100">{card.title}</h3>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 font-bold">
                        {card.tag}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed font-sans">{card.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Tech Stack */}
        <section className="px-8 pb-20">
          <div className="glass-panel p-6 border border-cyan-500/25">
            <h3 className="font-mono text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              Technology Stack
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "React 19", sub: "TypeScript" },
                { label: "Tailwind CSS 4", sub: "Design System" },
                { label: "Framer Motion", sub: "Animations" },
                { label: "Flask + SQLAlchemy", sub: "Backend" },
                { label: "XGBoost", sub: "ML Model" },
                { label: "LightGBM", sub: "ML Model" },
                { label: "SHAP", sub: "Explainability" },
                { label: "PostgreSQL", sub: "Database" },
              ].map((tech) => (
                <div key={tech.label} className="flex items-center gap-2.5 p-2 rounded-lg bg-[#0a0e1a]/60 border border-cyan-500/10">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 glow-cyan-subtle" />
                  <div>
                    <p className="text-sm font-mono text-slate-100 font-bold">{tech.label}</p>
                    <p className="text-xs text-slate-400 font-mono">{tech.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
