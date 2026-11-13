/*
 * Home Page — TargetX CRISPR Design Platform
 * Layout & Alignment Spec:
 * - Sidebar fixed 240px sticky, main flex-1 min-w-0
 * - Shared page container: mx-auto w-full max-w-[1440px] px-6 md:px-10 xl:px-12
 * - Hero: pt-16 lg:pt-24 pb-20, grid-cols-1 lg:grid-cols-12 gap-x-16 gap-y-12 items-start
 * - H1 text-4xl md:text-5xl, max-w-[18ch], text-balance: "Guide RNA design, verified against the genome."
 * - 8px scale vertical rhythm: badge (mb-6), H1 (mb-6), paragraph (mb-10, max-w-[56ch]), buttons (h-12, gap-3)
 * - Stats row directly under hero (border-t pt-10 mt-0), item 1 flush left with H1
 * - Sections py-24, mb-10 under section headings
 */
import { Link } from "wouter";
import Sidebar from "@/components/Sidebar";
import { HeroSequenceCard } from "@/components/HeroSequenceCard";
import {
  ArrowRight,
  Brain,
  Dna,
  Target,
  Flask,
  ChartBar,
  ShieldCheck,
  Sparkle,
  FileText,
  ChartLineUp,
  SortAscending,
  FilePdf,
} from "@phosphor-icons/react";

export default function Home() {
  return (
    <div className="flex min-h-[100dvh] circuit-bg">
      {/* Sidebar: fixed width 240px, sticky top-0 h-[100dvh], shrink-0 */}
      <Sidebar />

      {/* Main Content: flex-1 min-w-0 */}
      <main className="flex-1 min-w-0">
        {/* Universal Page Container */}
        <div className="mx-auto w-full max-w-[1440px] px-6 md:px-10 xl:px-12">
          {/* HERO SECTION */}
          <section className="pt-16 lg:pt-24 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-16 gap-y-12 items-start">
              {/* Text Column (lg:col-span-7) */}
              <div className="lg:col-span-7">
                {/* 1. Badge (24px bottom margin -> mb-6) */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-zinc-200/80 shadow-2xs mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E] status-pulse-teal" />
                  <span className="text-xs font-sans font-medium text-zinc-700">
                    TargetX v1.0 — Research Platform
                  </span>
                </div>

                {/* 2. Main Headline (24px bottom margin -> mb-6) */}
                <h1 className="font-sans text-4xl md:text-5xl font-semibold tracking-tight leading-[1.08] max-w-[18ch] text-balance text-zinc-950 mb-6">
                  Guide RNA design, verified against the genome.
                </h1>

                {/* 3. Paragraph (40px bottom margin -> mb-10) */}
                <p className="font-sans text-base md:text-lg text-zinc-600 leading-relaxed max-w-[56ch] mb-10">
                  Rank guides by predicted on-target efficiency, then scan 10⁶ genomic sites for
                  off-targets. TargetX couples ensemble gradient-boosted models with SHAP feature
                  attribution in an automated research workflow.
                </p>

                {/* 4. Action Buttons (h-12 height, gap-3) */}
                <div className="flex flex-wrap items-center gap-3">
                  <Link href="/pipeline">
                    <button className="tx-btn-primary px-6 h-12 text-sm font-medium flex items-center gap-2 shadow-sm">
                      Launch Pipeline
                      <ArrowRight size={16} weight="regular" />
                    </button>
                  </Link>

                  <Link href="/dashboard">
                    <button className="tx-btn-secondary px-6 h-12 text-sm font-medium shadow-2xs">
                      View Dashboard
                    </button>
                  </Link>
                </div>
              </div>

              {/* Card Column (lg:col-span-5) */}
              <div className="lg:col-span-5 flex justify-center lg:justify-end">
                <HeroSequenceCard />
              </div>
            </div>
          </section>

          {/* STATS ROW (directly under hero with border-t, pt-10, mt-0) */}
          <section className="border-t border-zinc-200/80 pt-10 mt-0">
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200/80">
              {/* Item 1: First item's left edge is flush with H1 */}
              <div className="pb-4 sm:pb-0 pr-6 lg:pr-8 pl-0">
                <span className="font-mono text-3xl md:text-4xl font-semibold text-zinc-950 tracking-tight block">
                  3
                </span>
                <span className="font-sans text-sm text-zinc-600 mt-1.5 block">
                  Model Ensemble (XGB, LGBM, RF)
                </span>
              </div>

              <div className="py-4 sm:py-0 px-6 lg:px-8">
                <span className="font-mono text-3xl md:text-4xl font-semibold text-zinc-950 tracking-tight block">
                  0.89
                </span>
                <span className="font-sans text-sm text-zinc-600 mt-1.5 block">
                  Average Pearson Correlation
                </span>
              </div>

              <div className="py-4 sm:py-0 px-6 lg:px-8">
                <span className="font-mono text-3xl md:text-4xl font-semibold text-zinc-950 tracking-tight block">
                  10⁶
                </span>
                <span className="font-sans text-sm text-zinc-600 mt-1.5 block">
                  Genomic Off-target Sites Scanned
                </span>
              </div>

              <div className="pt-4 sm:pt-0 pl-6 lg:pl-8 pr-0">
                <span className="font-mono text-3xl md:text-4xl font-semibold text-zinc-950 tracking-tight block">
                  30
                </span>
                <span className="font-sans text-sm text-zinc-600 mt-1.5 block">
                  SHAP Attributed Sequence Features
                </span>
              </div>
            </div>
          </section>

          {/* SECTION: ANALYSIS PIPELINE (py-24 between major sections) */}
          <section className="py-24">
            <div className="mb-10 text-left">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E]" />
                <span className="font-sans text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Computational Workflow
                </span>
              </div>
              <h2 className="font-sans text-2xl md:text-3xl font-semibold tracking-tight text-zinc-950">
                Eight-Stage Analysis Pipeline
              </h2>
              <p className="font-sans text-sm text-zinc-600 mt-1 max-w-xl">
                An end-to-end computational path from research goal input to publication-ready verification.
              </p>
            </div>

            {/* Bento Grid: Mixed Spans with 3 Large Tiles */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              {/* Stage 01: AI Goal Parsing */}
              <div className="tx-card p-6 md:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-semibold text-zinc-400">01</span>
                    <Brain size={22} weight="regular" className="text-zinc-700" />
                  </div>
                  <h3 className="font-sans text-base font-semibold text-zinc-950 mb-1.5">
                    AI Goal Parsing
                  </h3>
                  <p className="font-sans text-sm text-zinc-600 leading-relaxed">
                    Extracts organism, target phenotype, disease association, and gene locus from natural language queries.
                  </p>
                </div>
              </div>

              {/* Stage 02: Gene Identification */}
              <div className="tx-card p-6 md:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-semibold text-zinc-400">02</span>
                    <Dna size={22} weight="regular" className="text-zinc-700" />
                  </div>
                  <h3 className="font-sans text-base font-semibold text-zinc-950 mb-1.5">
                    Gene Identification
                  </h3>
                  <p className="font-sans text-sm text-zinc-600 leading-relaxed">
                    Maps candidate genes to NCBI and Ensembl reference transcripts with exon boundary verification.
                  </p>
                </div>
              </div>

              {/* Stage 04: gRNA Generation — LARGE TILE (md:col-span-2) */}
              <div className="tx-card p-6 md:p-8 md:col-span-2 flex flex-col justify-between relative overflow-hidden bg-white">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-semibold text-[#0F766E]">04 · Core Generation</span>
                    <Flask size={24} weight="regular" className="text-[#0F766E]" />
                  </div>
                  <h3 className="font-sans text-lg font-semibold text-zinc-950 mb-2">
                    gRNA Generation & Filtering
                  </h3>
                  <p className="font-sans text-sm text-zinc-600 leading-relaxed max-w-lg mb-6">
                    Generates 20-nt spacer candidates adjacent to canonical NGG and alternate PAM sites. 
                    Filters homopolymer runs (≥4 nt), extreme GC content (&lt;35% or &gt;75%), and internal self-complementarity loops.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/70 flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-zinc-700">
                  <span>Candidate Pool: <strong className="text-zinc-950">47 Guides</strong></span>
                  <span>GC Target: <strong className="text-zinc-950">40% – 65%</strong></span>
                  <span>PAM Filter: <strong className="text-[#0F766E]">5' SpCas9 NGG</strong></span>
                </div>
              </div>

              {/* Stage 06: Off-target Scan — LARGE TILE (md:col-span-2) */}
              <div className="tx-card p-6 md:p-8 md:col-span-2 flex flex-col justify-between relative overflow-hidden bg-white">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-semibold text-[#0F766E]">06 · Genomic Safety</span>
                    <ShieldCheck size={24} weight="regular" className="text-[#0F766E]" />
                  </div>
                  <h3 className="font-sans text-lg font-semibold text-zinc-950 mb-2">
                    Off-Target Genome Scan
                  </h3>
                  <p className="font-sans text-sm text-zinc-600 leading-relaxed max-w-lg mb-6">
                    Genome-scale scanning with Cas-OFFinder across 10⁶ loci. Weights seed-region mismatches (positions 10–20) 
                    more heavily than PAM-distal positions to assess unintended cleavage risks.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/70 flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-zinc-700">
                  <span>Tolerance: <strong className="text-zinc-950">Up to 3 Mismatches</strong></span>
                  <span>Seed Penalty: <strong className="text-zinc-950">Position-dependent</strong></span>
                  <span>Status: <strong className="text-[#0F766E]">Zero Exonic Collisions</strong></span>
                </div>
              </div>

              {/* Stage 03: PAM Scanning */}
              <div className="tx-card p-6 md:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-semibold text-zinc-400">03</span>
                    <Target size={22} weight="regular" className="text-zinc-700" />
                  </div>
                  <h3 className="font-sans text-base font-semibold text-zinc-950 mb-1.5">
                    PAM Scanning
                  </h3>
                  <p className="font-sans text-sm text-zinc-600 leading-relaxed">
                    Identifies canonical SpCas9 (NGG) and alternative PAM motifs on both coding and non-coding strands.
                  </p>
                </div>
              </div>

              {/* Stage 05: Efficiency Scoring */}
              <div className="tx-card p-6 md:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-semibold text-zinc-400">05</span>
                    <ChartBar size={22} weight="regular" className="text-zinc-700" />
                  </div>
                  <h3 className="font-sans text-base font-semibold text-zinc-950 mb-1.5">
                    Efficiency Scoring
                  </h3>
                  <p className="font-sans text-sm text-zinc-600 leading-relaxed">
                    Ensemble model execution combining XGBoost, LightGBM, and Random Forest predictions.
                  </p>
                </div>
              </div>

              {/* Stage 07: SHAP Explainability — LARGE TILE (md:col-span-3) */}
              <div className="tx-card p-6 md:p-8 md:col-span-3 flex flex-col justify-between relative overflow-hidden bg-white">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-semibold text-[#0F766E]">07 · Interpretability</span>
                    <Sparkle size={24} weight="regular" className="text-[#0F766E]" />
                  </div>
                  <h3 className="font-sans text-lg font-semibold text-zinc-950 mb-2">
                    SHAP Explainability & Attribution
                  </h3>
                  <p className="font-sans text-sm text-zinc-600 leading-relaxed max-w-2xl mb-6">
                    Every predicted score is accompanied by TreeExplainer Shapley value attributions across 30 sequence features,
                    including GC content balance, position-1 guanine preference, dinucleotide GG counts, and homopolymer penalties.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70">
                    <span className="text-[12px] font-sans text-zinc-500 block">Top Positive Driver</span>
                    <span className="font-mono text-xs font-semibold text-zinc-950">gc_content (+0.142)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70">
                    <span className="text-[12px] font-sans text-zinc-500 block">Position Preference</span>
                    <span className="font-mono text-xs font-semibold text-zinc-950">position_1_G (+0.087)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70">
                    <span className="text-[12px] font-sans text-zinc-500 block">Penalty Metric</span>
                    <span className="font-mono text-xs font-semibold text-zinc-950">homopolymer_run (-0.031)</span>
                  </div>
                </div>
              </div>

              {/* Stage 08: Report Synthesis */}
              <div className="tx-card p-6 md:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-semibold text-zinc-400">08</span>
                    <FileText size={22} weight="regular" className="text-zinc-700" />
                  </div>
                  <h3 className="font-sans text-base font-semibold text-zinc-950 mb-1.5">
                    Report Synthesis
                  </h3>
                  <p className="font-sans text-sm text-zinc-600 leading-relaxed">
                    Compiles audit logs, model metrics, ranked candidates, and radar profile plots into a PDF research summary.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION: CORE CAPABILITIES (py-24, left aligned) */}
          <section className="py-24 border-t border-zinc-200/60">
            <div className="mb-10 text-left">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E]" />
                <span className="font-sans text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Platform Architecture
                </span>
              </div>
              <h2 className="font-sans text-2xl md:text-3xl font-semibold tracking-tight text-zinc-950">
                Core Capabilities
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Brain,
                  title: "Natural Language Goal Parsing",
                  desc: "Translates complex research statements into structured genomic targets, organism annotations, and phenotypic objectives.",
                },
                {
                  icon: Flask,
                  title: "Ensemble Cutting Efficiency",
                  desc: "Three independently trained tree models (XGBoost, LightGBM, Random Forest) predict cleavage activity with high cross-validation stability.",
                },
                {
                  icon: ShieldCheck,
                  title: "Cas-OFFinder Integration",
                  desc: "Exhaustive genomic scanning with position-weighted penalties for seed mismatches and non-canonical PAM alignments.",
                },
                {
                  icon: ChartLineUp,
                  title: "Feature-Level SHAP Interpretability",
                  desc: "Transparent attribution decomposing each candidate's efficiency into positive and negative sequence determinants.",
                },
                {
                  icon: SortAscending,
                  title: "Multi-Objective Ranking",
                  desc: "Synthesizes on-target score, off-target distance, GC proportion, and self-cleavage penalties into a composite index.",
                },
                {
                  icon: FilePdf,
                  title: "Automated Research Reports",
                  desc: "Generates formatted PDF summaries containing sequence alignments, model confidence scores, and literature benchmarks.",
                },
              ].map((card, idx) => (
                <div key={idx} className="tx-card p-6 md:p-7 flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900 mb-5">
                      <card.icon size={20} weight="regular" className="text-[#0F766E]" />
                    </div>
                    <h3 className="font-sans text-base font-semibold text-zinc-950 mb-2">
                      {card.title}
                    </h3>
                    <p className="font-sans text-sm text-zinc-600 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
