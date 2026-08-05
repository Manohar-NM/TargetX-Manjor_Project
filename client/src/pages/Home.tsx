/*
 * Home Page — TargetX Landing
 * Genome Noir: dark obsidian background, cyan bioluminescent accents,
 * asymmetric layout, glassmorphism panels, circuit-board traces
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
  // The useAuth hook provides authentication state.
  // To implement login/logout, call logout(), or start login from an event
  // handler: onClick={() => startLogin()} (imported from "@/const"). Never call
  // startLogin() during render (no href={startLogin()}) — it mints a one-time
  // nonce cookie and must run only at the moment of navigation.
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen flex bg-[#0a0e1a] circuit-bg">
      <Sidebar />

      <main className="flex-1 ml-[220px] min-h-screen">
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
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
                <span className="text-xs font-mono text-cyan-400">v1.0.0 — Research Preview</span>
              </div>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-mono text-4xl lg:text-5xl font-bold text-white leading-tight mb-4"
            >
              AI-Powered{" "}
              <span className="text-cyan-400">CRISPR</span>
              <br />
              Guide RNA Design
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-lg text-slate-400 max-w-xl mb-8 leading-relaxed"
            >
              From biological goal to publication-ready gRNA candidates.
              TargetX combines ensemble ML models, SHAP explainability,
              and genome-wide off-target analysis in a single research-grade pipeline.
            </motion.p>

            <motion.div variants={fadeUp} className="flex items-center gap-4">
              <Link href="/pipeline">
                <Button className="bg-cyan-500 hover:bg-cyan-400 text-[#0a0e1a] font-mono font-semibold px-6 h-11 gap-2">
                  Launch Pipeline <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 font-mono px-6 h-11">
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
                className="glass-panel p-4"
              >
                <p className="font-mono text-2xl font-bold text-cyan-400">{stat.value}</p>
                <p className="text-sm text-slate-300 mt-1">{stat.label}</p>
                <p className="text-xs text-slate-500 font-mono">{stat.sub}</p>
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
            <h2 className="font-mono text-xl font-semibold text-slate-100 mb-2">Analysis Pipeline</h2>
            <p className="text-sm text-slate-500">Eight-stage computational workflow from goal to report</p>
          </motion.div>

          <div className="relative">
            {/* Connecting line */}
            <div className="absolute top-6 left-0 right-0 h-px bg-gradient-to-r from-cyan-500/30 via-cyan-500/50 to-cyan-500/30" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
              {pipelineStages.map((stage, i) => (
                <motion.div
                  key={stage.label}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#0d1117] border border-cyan-500/20 flex items-center justify-center mb-3 relative z-10 hover:border-cyan-500/50 transition-colors">
                    <stage.icon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-200">{stage.label}</p>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{stage.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="px-8 pb-20">
          <h2 className="font-mono text-xl font-semibold text-slate-100 mb-8">Core Capabilities</h2>

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
                className="glass-panel p-5 group hover:glow-cyan-subtle transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0 border border-cyan-500/15 group-hover:border-cyan-500/30 transition-colors">
                    <card.icon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-mono text-sm font-semibold text-slate-100">{card.title}</h3>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/15">
                        {card.tag}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed">{card.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Tech Stack */}
        <section className="px-8 pb-20">
          <div className="glass-panel p-6">
            <h3 className="font-mono text-sm font-semibold text-slate-300 mb-4">Technology Stack</h3>
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
                <div key={tech.label} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/60" />
                  <div>
                    <p className="text-sm font-mono text-slate-200">{tech.label}</p>
                    <p className="text-xs text-slate-500">{tech.sub}</p>
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
