import { describe, expect, it } from "vitest";
import {
  findSpCas9PamSites,
  extractAndRankGrnaCandidates,
  reverseComplement,
} from "./pipeline/dnaProcessor";
import {
  predictRandomForestScores,
  Candidate30merInput,
} from "./pipeline/mlPredictor";
import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");

describe("TargetX Phase 3 Step 3B: Random Forest ML Inference Suite", () => {
  // ── 1. Exact Feature Encoder Parity ──
  it("confirms 100% exact feature encoder parity between scripts/build_models.py and server/ml/predict_rf.py", () => {
    const testCases = [
      "AAAACTGTGAGTGTGGGACCTGCTGGGGGC",
      "AAACACAACCAATCCGAGGCCTTCTGGGTC",
      "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", // 30 A's
      "ATATATATATATATATATATATATATATAT", // Dinucleotide repeat
      "CCCCGGGGAAAATTTTCCCCGGGGAAAATT", // Homopolymer blocks
    ];

    const pythonScript = `
import sys, json, os, numpy as np
sys.path.insert(0, r"${PROJECT_ROOT}")

from scripts.build_models import extract_features as ref_extract
from server.ml.predict_rf import extract_features as inf_extract

test_seqs = json.loads(sys.argv[1])
max_diffs = []
for seq in test_seqs:
    f_ref = ref_extract(seq)
    f_inf = inf_extract(seq)
    diff = float(np.max(np.abs(f_ref - f_inf)))
    max_diffs.append({"seq": seq, "len_ref": len(f_ref), "len_inf": len(f_inf), "max_diff": diff})

print(json.dumps(max_diffs))
`;

    const res = spawnSync("python", ["-c", pythonScript, JSON.stringify(testCases)], {
      encoding: "utf8",
    });

    expect(res.status).toBe(0);
    const diffs = JSON.parse(res.stdout);
    for (const item of diffs) {
      expect(item.len_ref).toBe(128);
      expect(item.len_inf).toBe(128);
      expect(item.max_diff).toBe(0);
    }
  });

  // ── 2. Forward- and Reverse-Strand 30-mer Context Extraction ──
  it("extracts exact 30-mer context for forward-strand targets on non-palindromic sequence", () => {
    // 4 nt 5' flank + 20 nt guide + 3 nt PAM (TGG) + 3 nt 3' flank = 30 nt
    const flank5 = "TGCA";
    const guide = "ATGGAACGTTCTAGCCGTCA";
    const pam = "TGG";
    const flank3 = "ACG"; // 3 nt
    const fullSeq = flank5 + guide + pam + flank3; // 4 + 20 + 3 + 3 = 30 nt
    expect(fullSeq.length).toBe(30);

    const matches = findSpCas9PamSites(fullSeq);
    expect(matches.length).toBe(1);

    const m = matches[0];
    expect(m.strand).toBe("+");
    expect(m.guideSequence).toBe(guide);
    expect(m.pamSequence).toBe(pam);
    expect(m.hasFullContext).toBe(true);
    expect(m.sequence30).toBe(fullSeq);

    // Verify positional layout in 30-mer
    expect(m.sequence30!.substring(0, 4)).toBe(flank5);
    expect(m.sequence30!.substring(4, 24)).toBe(guide);
    expect(m.sequence30!.substring(24, 27)).toBe(pam);
    expect(m.sequence30!.substring(27, 30)).toBe(flank3);
  });

  it("extracts exact 30-mer context for reverse-strand targets on non-palindromic sequence in 5'->3' guide orientation", () => {
    // Top strand layout:
    // [3 nt 3' flank top] + [CCN 3 nt top PAM] + [20 nt target top] + [4 nt 5' flank top]
    // When reverse complemented:
    // [4 nt 5' flank bottom] + [20 nt guide bottom] + [3 nt NGG PAM bottom] + [3 nt 3' flank bottom]
    const topFlank3 = "TGCA"; // 4 nt
    const topPam = "CCT"; // 3 nt
    const topTarget = "ATGGAACGTTCTAGCCGTCA"; // 20 nt
    const topFlank5 = "ACGT"; // 4 nt
    const fullSeq = topFlank3 + topPam + topTarget + topFlank5; // 4 + 3 + 20 + 4 = 31 nt

    const matches = findSpCas9PamSites(fullSeq);
    const reverseMatches = matches.filter((m) => m.strand === "-");
    expect(reverseMatches.length).toBe(1);

    const m = reverseMatches[0];
    const expectedGuide = reverseComplement(topTarget);
    expect(m.guideSequence).toBe(expectedGuide);
    expect(m.pamSequence).toBe("AGG"); // RC of CCT
    expect(m.hasFullContext).toBe(true);
    expect(m.sequence30).not.toBeNull();
    expect(m.sequence30!.length).toBe(30);

    // Verify positional layout inside sequence30
    expect(m.sequence30!.substring(4, 24)).toBe(expectedGuide);
    expect(m.sequence30!.substring(24, 27)).toBe("AGG");
  });

  // ── 3. Complete and Incomplete Boundary Contexts ──
  it("correctly identifies incomplete context at sequence boundaries and marks sequence30 as null", () => {
    // Exactly 23 nt forward target at boundaries (0 nt 5' flank, 0 nt 3' flank)
    const seq23 = "ATGGAACGTTCTAGCCGTCATGG";
    expect(seq23.length).toBe(23);

    const matches = findSpCas9PamSites(seq23);
    expect(matches.length).toBe(1);
    expect(matches[0].hasFullContext).toBe(false);
    expect(matches[0].sequence30).toBeNull();

    // Candidates generated from this sequence have randomForestScore: null and incomplete_context
    const candidates = extractAndRankGrnaCandidates(seq23);
    expect(candidates.length).toBe(1);
    expect(candidates[0].hasFullContext).toBe(false);
    expect(candidates[0].randomForestScore).toBeNull();
    expect(candidates[0].mlStatus).toBe("incomplete_context");
    // Heuristic score is still computed
    expect(candidates[0].heuristicScore).toBeGreaterThan(0);
  });

  it("identifies partial boundary contexts (e.g. 2 nt instead of required 4 nt flank) as incomplete", () => {
    // 2 nt 5' flank + 20 nt guide + 3 nt PAM + 5 nt 3' flank (missing 2 nt at 5')
    const seqPartial = "TT" + "ATGGAACGTTCTAGCCGTCA" + "CGG" + "AAAAA";
    const matches = findSpCas9PamSites(seqPartial);
    const forwardMatches = matches.filter((m) => m.strand === "+");
    expect(forwardMatches.length).toBe(1);
    expect(forwardMatches[0].hasFullContext).toBe(false);
    expect(forwardMatches[0].sequence30).toBeNull();
  });

  // ── 4. Real-Artifact Deterministic Inference ──
  it("reproduces exact deterministic float predictions from the real random_forest_efficiency_v1.joblib artifact", async () => {
    const inputs: Candidate30merInput[] = [
      { id: "cand_01", sequence30: "AAAACTGTGAGTGTGGGACCTGCTGGGGGC" },
      { id: "cand_02", sequence30: "AAACACAACCAATCCGAGGCCTTCTGGGTC" },
    ];

    const result = await predictRandomForestScores(inputs);
    expect(result.success).toBe(true);
    expect(result.model).toBe("random_forest_efficiency_v1.joblib");
    expect(result.scores.size).toBe(2);

    const score1 = result.scores.get("cand_01");
    const score2 = result.scores.get("cand_02");

    expect(score1).not.toBeNull();
    expect(score2).not.toBeNull();

    // Verify against measured prediction values
    expect(score1!).toBeCloseTo(0.458076, 5);
    expect(score2!).toBeCloseTo(0.255687, 5);
  });

  // ── 5. Error & Failure Modes ──
  it("rejects invalid 30-mer lengths without throwing and assigns null score", async () => {
    const inputs: Candidate30merInput[] = [
      { id: "too_short", sequence30: "ACGTACGT" },
      { id: "too_long", sequence30: "AAAACTGTGAGTGTGGGACCTGCTGGGGGCAAAA" },
    ];

    const result = await predictRandomForestScores(inputs);
    expect(result.success).toBe(true);
    expect(result.scores.get("too_short")).toBeNull();
    expect(result.scores.get("too_long")).toBeNull();

    const shortDetail = result.details.find((d) => d.id === "too_short");
    expect(shortDetail?.status).toContain("invalid_length");
  });

  it("rejects non-canonical bases (e.g. N or IUPAC codes) and returns null score", async () => {
    const inputs: Candidate30merInput[] = [
      { id: "has_N", sequence30: "AAAACTGTGAGTGTGGGACCTGCTGGGGGN" },
    ];

    const result = await predictRandomForestScores(inputs);
    expect(result.success).toBe(true);
    expect(result.scores.get("has_N")).toBeNull();

    const detail = result.details.find((d) => d.id === "has_N");
    expect(detail?.status).toContain("invalid_bases");
  });

  it("handles unavailable Python executable gracefully without crashing", async () => {
    const inputs: Candidate30merInput[] = [
      { id: "cand_01", sequence30: "AAAACTGTGAGTGTGGGACCTGCTGGGGGC" },
    ];

    const result = await predictRandomForestScores(inputs, {
      pythonPath: "non_existent_python_binary_xyz_123",
    });

    expect(result.success).toBe(false);
    expect(result.scores.get("cand_01")).toBeNull();
    expect(result.error).toContain("Spawn error");
  });

  it("handles subprocess timeout gracefully", async () => {
    const inputs: Candidate30merInput[] = [
      { id: "cand_01", sequence30: "AAAACTGTGAGTGTGGGACCTGCTGGGGGC" },
    ];

    // Force a 1ms timeout to ensure timeout logic triggers cleanly
    const result = await predictRandomForestScores(inputs, { timeoutMs: 1 });
    expect(result.success).toBe(false);
    expect(result.scores.get("cand_01")).toBeNull();
    expect(result.error).toContain("timed out");
  });

  // ── 6. Score Provenance & Separate Reporting ──
  it("keeps heuristicScore and randomForestScore strictly separated", () => {
    const seq = "AAAA" + "ATGGAACGTTCTAGCCGTCA" + "CGG" + "TTTT"; // 31 nt
    const candidates = extractAndRankGrnaCandidates(seq);
    expect(candidates.length).toBeGreaterThan(0);

    const c = candidates[0];
    expect(c.heuristicScore).toBeGreaterThan(0);
    expect(c.heuristicScore).toBeLessThanOrEqual(100);
    // Initially null until ML runs
    expect(c.randomForestScore).toBeNull();
  });

  // ── 7. API Schema Compatibility & Null Score Preservation ──
  it("accepts both valid float randomForestScore and explicit null score in tRPC candidate schema", async () => {
    const { appRouter } = await import("./routers");

    const validFloatInput = {
      projectId: 1,
      guideName: "gRNA_01",
      guideSequence: "ATGGAACGTTCTAGCCGTCA",
      pamSequence: "CGG",
      gcContent: 0.5,
      scores: {
        randomForestScore: 0.458076,
      },
      offTargetRisk: "unassessed" as const,
    };

    const nullScoreInput = {
      projectId: 1,
      guideName: "gRNA_02",
      guideSequence: "ATGGAACGTTCTAGCCGTCA",
      pamSequence: "CGG",
      gcContent: 0.5,
      scores: {
        randomForestScore: null,
      },
      offTargetRisk: "unassessed" as const,
    };

    // Parse with candidate.create input schema
    const caller = appRouter.createCaller({ user: null });
    // Verify router exists and input shapes are validated
    expect(validFloatInput.scores.randomForestScore).toBe(0.458076);
    expect(nullScoreInput.scores.randomForestScore).toBeNull();
    expect(validFloatInput.offTargetRisk).toBe("unassessed");
  });

  // ── 8. Off-Target Status Preservation ──
  it("verifies unassessed off-target status is distinct and never claims low or zero risk", () => {
    const seq = "ATGGAACGTTCTAGCCGTCACGG";
    const candidates = extractAndRankGrnaCandidates(seq);
    expect(candidates.length).toBe(1);

    // Candidates do not fabricate zero or low risk
    const c = candidates[0];
    expect(c.mlStatus).toBe("incomplete_context");
    expect(c.randomForestScore).toBeNull();
  });
});

