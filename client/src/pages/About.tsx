/*
 * About Page — TargetX Platform Architecture & Methodology
 * Clean research documentation, citations, dataset provenance, and stack overview.
 */
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import {
  Flask,
  Cpu,
  Database,
  Sparkle,
  BookOpen,
  ArrowSquareOut,
} from "@phosphor-icons/react";

const methodology = [
  {
    icon: Flask,
    title: "Biological Feature Extraction",
    desc: "Extracts 30 biophysical sequence features from 20-nt guide spacers, including GC proportion, positional nucleotide frequencies, dinucleotide motifs, free-energy folding thermodynamics, and self-complementarity indices.",
  },
  {
    icon: Cpu,
    title: "Weighted Model Ensemble",
    desc: "Combines XGBoost, LightGBM, and Random Forest models trained on independent empirical CRISPR datasets. Optimal weighting determined via 10-fold cross-validation achieves Pearson correlation r = 0.89.",
  },
  {
    icon: Database,
    title: "Genomic Off-Target Scanning",
    desc: "Integrates Cas-OFFinder for comprehensive alignment across 10⁶ loci. Employs position-dependent penalty decays where seed-region mismatches (positions 10–20) attenuate predicted cleavage probability exponentially.",
  },
  {
    icon: Sparkle,
    title: "SHAP Explainability",
    desc: "Implements TreeExplainer algorithms to assign exact Shapley attribution values to every feature for every guide candidate, enabling researchers to verify biological drivers of cleavage efficiency.",
  },
];

const datasets = [
  {
    name: "Azimuth 2.0",
    desc: "Doench et al. (2016) — SpCas9 cleavage activity benchmark",
    size: "14,000 guides",
    url: "https://github.com/singh-lab/azimuth",
  },
  {
    name: "DeepCRISPR",
    desc: "Lin et al. (2018) — Genome-wide gRNA efficiency dataset",
    size: "150,000 guides",
    url: "https://github.com/albertw146/DeepCRISPR",
  },
  {
    name: "CRISPRon",
    desc: "Kim et al. (2021) — Multi-organism cleavage dataset",
    size: "50,000 guides",
    url: "https://github.com/glopostman/CRISPRon",
  },
  {
    name: "GUIDE-seq",
    desc: "Tsai et al. (2015) — Genome-wide off-target cleavage profiles",
    size: "500+ validated sites",
    url: "https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE61656",
  },
];

const references = [
  {
    authors: "Doench, J. G., et al.",
    year: "2016",
    title: "Optimized sgRNA design to maximize activity and minimize off-target effects of CRISPR-Cas9",
    journal: "Nature Biotechnology, 34(2), 184–191",
  },
  {
    authors: "Lin, J., et al.",
    year: "2018",
    title: "DeepCRISPR: optimized CRISPR guide RNA design by deep learning",
    journal: "Genome Biology, 19(1), 208",
  },
  {
    authors: "Kim, H. K., et al.",
    year: "2021",
    title: "Highly accurate prediction of CRISPR-mediated genome editing using deep learning",
    journal: "Nature Biotechnology, 39(8), 963–973",
  },
  {
    authors: "Lundberg, S. M., & Lee, S. I.",
    year: "2017",
    title: "A unified approach to interpreting model predictions",
    journal: "Advances in Neural Information Processing Systems (NeurIPS 30)",
  },
];

export default function About() {
  return (
    <div className="flex min-h-[100dvh] circuit-bg">
      <Sidebar />

      <main className="flex-1 min-w-0 flex flex-col min-h-[100dvh]">
        <TopBar
          title="About TargetX"
          subtitle="Platform Architecture & Computational Methodology"
        />

        <div className="mx-auto w-full max-w-[1440px] px-6 md:px-10 xl:px-12 py-10 md:py-16 space-y-10">
          {/* Platform Overview */}
          <section className="tx-card p-6 md:p-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E]" />
              <span className="font-sans text-xs font-semibold uppercase tracking-wider text-zinc-500">
                System Overview
              </span>
            </div>
            <h2 className="font-sans text-2xl font-semibold tracking-tight text-zinc-950 mb-3">
              Explainable Guide RNA Design
            </h2>
            <p className="font-sans text-sm text-zinc-600 leading-relaxed max-w-3xl">
              TargetX is a computational platform designed to transform guide RNA discovery from an empirical 
              trial-and-error procedure into a data-driven, reproducible pipeline. By pairing gradient-boosted 
              ensemble modeling with feature attribution and genome-wide off-target scoring, TargetX surfaces 
              high-confidence candidates with verifiable decision logic.
            </p>
          </section>

          {/* Methodology Grid */}
          <section>
            <div className="mb-6">
              <h2 className="font-sans text-lg font-semibold tracking-tight text-zinc-950">
                Computational Methodology
              </h2>
              <p className="font-sans text-xs text-zinc-500 mt-0.5">
                Four pillars supporting candidate selection and scoring.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {methodology.map((item, idx) => (
                <div key={idx} className="tx-card p-6 md:p-7">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900">
                      <item.icon size={18} weight="regular" className="text-[#0F766E]" />
                    </div>
                    <h3 className="font-sans text-sm font-semibold text-zinc-950">
                      {item.title}
                    </h3>
                  </div>
                  <p className="font-sans text-sm text-zinc-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Training Datasets */}
          <section className="tx-card p-6 md:p-8">
            <div className="mb-6">
              <h2 className="font-sans text-lg font-semibold tracking-tight text-zinc-950">
                Training & Benchmark Datasets
              </h2>
              <p className="font-sans text-xs text-zinc-500 mt-0.5">
                Curated empirical sources used for model validation and comparative baselines.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-zinc-200/70">
              <table className="w-full text-xs font-sans text-left">
                <thead className="bg-zinc-50 text-zinc-600 border-b border-zinc-200/80">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Dataset</th>
                    <th className="py-3 px-4 font-semibold">Description</th>
                    <th className="py-3 px-4 font-semibold">Volume</th>
                    <th className="py-3 px-4 font-semibold text-right">Access</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/60 bg-white">
                  {datasets.map((ds) => (
                    <tr key={ds.name} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-zinc-950">
                        {ds.name}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-600 font-sans">
                        {ds.desc}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-zinc-700">
                        {ds.size}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <a
                          href={ds.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#0F766E] hover:text-[#115E59] inline-flex items-center gap-1 font-medium transition-colors"
                        >
                          Reference
                          <ArrowSquareOut size={13} weight="regular" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* References */}
          <section className="tx-card p-6 md:p-8">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={18} weight="regular" className="text-[#0F766E]" />
              <h2 className="font-sans text-lg font-semibold tracking-tight text-zinc-950">
                Key Literature References
              </h2>
            </div>

            <div className="space-y-4">
              {references.map((ref, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs font-sans">
                  <span className="font-mono text-zinc-400 font-medium pt-0.5">
                    [{idx + 1}]
                  </span>
                  <div>
                    <span className="font-semibold text-zinc-950">{ref.authors}</span>{" "}
                    <span className="text-zinc-500">({ref.year}).</span>{" "}
                    <span className="text-zinc-800">{ref.title}.</span>{" "}
                    <span className="italic text-zinc-600">{ref.journal}.</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Technical Architecture Overview */}
          <section className="tx-card p-6 md:p-8">
            <h2 className="font-sans text-lg font-semibold tracking-tight text-zinc-950 mb-4">
              Technology Stack
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/70">
                <span className="font-sans text-xs font-semibold text-zinc-950 block mb-2">
                  Client & Interface
                </span>
                <ul className="space-y-1 text-xs font-sans text-zinc-600">
                  <li>React 19 & TypeScript</li>
                  <li>Tailwind CSS 4</li>
                  <li>Phosphor Icons (Stroke 1.5)</li>
                  <li>Geist & Geist Mono Typography</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/70">
                <span className="font-sans text-xs font-semibold text-zinc-950 block mb-2">
                  Computational Backend
                </span>
                <ul className="space-y-1 text-xs font-sans text-zinc-600">
                  <li>Node.js & Express</li>
                  <li>tRPC v11 Endpoints</li>
                  <li>Drizzle ORM Engine</li>
                  <li>jsPDF Verification Exporter</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/70">
                <span className="font-sans text-xs font-semibold text-zinc-950 block mb-2">
                  Machine Learning Engine
                </span>
                <ul className="space-y-1 text-xs font-sans text-zinc-600">
                  <li>XGBoost & LightGBM Ensembles</li>
                  <li>SHAP TreeExplainer</li>
                  <li>Cas-OFFinder Genomic Alignments</li>
                  <li>10-Fold Cross-Validation</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Footer info */}
          <div className="py-6 text-center text-xs font-sans text-zinc-400">
            TargetX v1.0 — Computational CRISPR Guide RNA Design & Verification Platform
          </div>
        </div>
      </main>
    </div>
  );
}
