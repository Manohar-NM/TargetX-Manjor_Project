/*
 * HeroSequenceCard — Memoized Composed Visual for Hero Section
 * 23 equal cells (20 spacer + 3 PAM), PAM highlighted as one teal group,
 * aligned labels under matching cells, minimum 12px text, p-6 padding, gap-5 spacing.
 */
import React, { memo } from "react";
import { Dna, ShieldCheck, CheckCircle } from "@phosphor-icons/react";

const guideSequence = "ATGGAACGTTCTAGCCGTCA";
const pamSequence = "AGG";

const offTargets = [
  { locus: "Chr 04 : 18,294,102", mismatches: 0, risk: "None", barWidth: "4%" },
  { locus: "Chr 09 : 04,812,551", mismatches: 2, risk: "Low", barWidth: "12%" },
  { locus: "Chr 01 : 31,048,990", mismatches: 3, risk: "Negligible", barWidth: "2%" },
];

export const HeroSequenceCard = memo(function HeroSequenceCard() {
  return (
    <div className="relative w-full max-w-lg bg-white rounded-3xl border border-zinc-200/60 shadow-[0_20px_40px_-15px_rgba(15,23,42,0.06)] p-6 space-y-5 overflow-hidden">
      {/* Ambient decorative blur */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* 1. Header Section */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-800 flex-shrink-0">
            <Dna size={20} weight="regular" className="text-[#0F766E]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-sans text-[13px] font-semibold text-zinc-950">
                OsDREB1A
              </span>
              <span className="text-[12px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200/70">
                Exon 1
              </span>
            </div>
            <p className="text-[12px] text-zinc-500 font-sans mt-0.5">
              SpCas9 Reference Candidate
            </p>
          </div>
        </div>

        {/* Status indicator with pulsing teal dot */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-50 border border-zinc-200/70">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E] status-pulse-teal" />
          <span className="text-[12px] font-sans font-medium text-zinc-600">
            Validated
          </span>
        </div>
      </div>

      {/* 2. 23-Cell Sequence Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[12px] font-sans text-zinc-600 font-medium">
            20-nt Spacer + PAM (5' → 3')
          </span>
          <span className="text-[12px] font-mono text-[#0F766E] font-medium">
            SpCas9 Target
          </span>
        </div>

        {/* 23 Equal Grid Cells Container */}
        <div className="relative rounded-2xl bg-zinc-50 border border-zinc-200/80 p-3 overflow-hidden">
          {/* Scanning sheen across the sequence */}
          <div className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-[#0F766E]/15 to-transparent pointer-events-none animate-hero-scan" />

          {/* 23 Equal Cells: 20 spacer + 3 PAM */}
          <div className="grid grid-cols-[repeat(23,minmax(0,1fr))] items-center font-mono text-[10px] sm:text-[13px] font-semibold select-none">
            {/* 20 Spacer Cells */}
            {guideSequence.split("").map((nt, idx) => (
              <div
                key={idx}
                className="flex items-center justify-center py-1 text-zinc-900"
                title={`Position ${idx + 1}: ${nt}`}
              >
                {nt}
              </div>
            ))}

            {/* 3 PAM Cells (Highlight together as one teal-tinted group) */}
            <div className="col-span-3 grid grid-cols-3 bg-[#0F766E]/10 border border-[#0F766E]/30 rounded-md text-[#0F766E] font-bold">
              {pamSequence.split("").map((nt, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-center py-1"
                  title={`PAM Position ${idx + 1}: ${nt}`}
                >
                  {nt}
                </div>
              ))}
            </div>
          </div>

          {/* Aligned labels under matching cells */}
          <div className="grid grid-cols-[repeat(23,minmax(0,1fr))] mt-2.5 pt-2 border-t border-zinc-200/60 font-mono text-[12px] text-zinc-500 select-none">
            <div className="col-span-9 text-left">
              <span>1</span>
            </div>
            <div className="col-span-11 text-center">
              <span>10–20 (seed)</span>
            </div>
            <div className="col-span-3 text-center text-[#0F766E] font-medium">
              <span>PAM</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Efficiency Score Section */}
      <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/70">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-[12px] font-sans text-zinc-600 block">
              Predicted On-Target Efficiency
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-mono text-3xl font-semibold text-zinc-950 tracking-tight">
                0.920
              </span>
              <span className="text-[12px] font-sans text-zinc-500">
                / 1.000 (98.4th percentile)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[12px] font-sans text-[#0F766E] font-medium">
            <CheckCircle size={16} weight="regular" />
            <span>Optimal</span>
          </div>
        </div>

        {/* Model Ensemble Split */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-zinc-200/60 text-center">
          <div>
            <span className="text-[12px] font-sans text-zinc-500 block">XGBoost</span>
            <span className="font-mono text-[12px] font-semibold text-zinc-800">0.932</span>
          </div>
          <div className="border-x border-zinc-200/60">
            <span className="text-[12px] font-sans text-zinc-500 block">LightGBM</span>
            <span className="font-mono text-[12px] font-semibold text-zinc-800">0.914</span>
          </div>
          <div>
            <span className="text-[12px] font-sans text-zinc-500 block">Random Forest</span>
            <span className="font-mono text-[12px] font-semibold text-zinc-800">0.915</span>
          </div>
        </div>
      </div>

      {/* 4. Off-Target Bar List */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[12px] font-sans font-medium text-zinc-700 flex items-center gap-1.5">
            <ShieldCheck size={16} weight="regular" className="text-[#0F766E]" />
            Off-Target Mismatch Profile
          </span>
          <span className="text-[12px] font-sans text-zinc-500">
            Cas-OFFinder Scan
          </span>
        </div>

        <div className="space-y-2">
          {offTargets.map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between text-[12px] font-sans">
                <span className="font-mono text-zinc-600">{item.locus}</span>
                <span className="text-zinc-500">
                  {item.mismatches} MM ·{" "}
                  <strong className="text-zinc-800 font-medium">{item.risk}</strong>
                </span>
              </div>
              <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#0F766E] rounded-full transition-all duration-500"
                  style={{ width: item.barWidth }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
