/**
 * TargetX DNA Sequence Processing Module
 *
 * Implements pure, deterministic, and testable functions for:
 * 1. DNA Sequence Sanitization & FASTA Parsing
 * 2. Unambiguous IUPAC Validation (rejects non-canonical / ambiguous bases for precise gRNA design)
 * 3. Reverse-Complement Generation
 * 4. Dual-Strand SpCas9 PAM Detection (NGG on '+' strand, CCN on '-' strand)
 * 5. 1-Based Sequence-Relative Coordinate Mapping
 * 6. Real Sequence-Derived Feature Extraction (GC%, poly-T, homopolymer runs)
 * 7. Deterministic Empirical Rule-Based Heuristic Scoring
 */

export interface SanitizedDnaResult {
  valid: boolean;
  sequence: string;
  header?: string;
  error?: string;
}

export interface PamSiteMatch {
  strand: "+" | "-";
  /** 1-based inclusive start coordinate of the 23-nt target site on the sequence */
  startPosition: number;
  /** 1-based inclusive end coordinate of the 23-nt target site on the sequence */
  endPosition: number;
  /** 1-based inclusive coordinates for the 20-nt protospacer */
  protospacerStart: number;
  protospacerEnd: number;
  /** 1-based inclusive coordinates for the 3-nt PAM */
  pamStart: number;
  pamEnd: number;
  /** 20-nt guide sequence in standard 5'-to-3' orientation */
  guideSequence: string;
  /** 3-nt PAM in standard 5'-to-3' orientation (NGG) */
  pamSequence: string;
  /** 3-nt PAM motif as observed directly on the top strand (NGG on +, CCN on -) */
  topStrandPam: string;
  /**
   * 30-mer context sequence in standard 5'-to-3' targeting-strand orientation:
   * 4-nt 5' flank + 20-nt protospacer + 3-nt PAM + 3-nt 3' flank.
   * Null if target is within 4 nt of 5' sequence boundary or 3 nt of 3' boundary.
   */
  sequence30: string | null;
  /** Whether the complete 30-mer genomic context is available without truncation */
  hasFullContext: boolean;
}

export interface GrnaFeatureVector {
  gcContent: number; // 0.0 - 1.0
  hasPolyT: boolean; // >= 4 consecutive Ts (Pol III termination signal)
  homopolymerRunMax: number;
  hasSelfComplementarityRisk: boolean;
  position1G: number;
  position20G: number;
  firstNucleotide: string;
  lastNucleotide: string;
  /**
   * Deterministic sequence-quality heuristic score (0.0 - 100.0).
   * NOTE: This is a transparent rule-based heuristic based on GC balance,
   * termination signal absence, and seed nucleotide preference.
   * It is NOT an ML prediction and does NOT measure validated editing efficiency.
   */
  heuristicScore: number;
  confidence: "high" | "medium" | "low";
}

export interface ProcessedGrnaCandidate extends PamSiteMatch, GrnaFeatureVector {
  guideName: string;
  finalRank: number;
  /**
   * ML On-Target Efficiency Score (Azimuth 2.0 Surrogate).
   * Continuous regression estimate in [0.0, 1.0].
   * Null if full 30-mer context is unavailable or if ML inference is unperformed/failed.
   */
  randomForestScore: number | null;
  mlStatus: "ok" | "incomplete_context" | "inference_failed" | "unassessed";
  [key: string]: unknown;
}

/**
 * Sanitizes and validates a DNA sequence or FASTA text.
 * - Extracts FASTA header if present
 * - Strips all whitespace and newlines
 * - Converts to uppercase
 * - Validates against canonical unambiguous DNA alphabet: A, C, G, T
 * - Ambiguous IUPAC symbols (e.g., N, R, Y, S, W, K, M, B, D, H, V) are rejected
 *   because precise guide synthesis requires exact nucleotide specifications.
 */
export function sanitizeDnaSequence(rawInput: string): SanitizedDnaResult {
  if (!rawInput || typeof rawInput !== "string") {
    return { valid: false, sequence: "", error: "No sequence input provided." };
  }

  const lines = rawInput.trim().split(/\r?\n/);
  let header: string | undefined = undefined;
  const sequenceLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith(">")) {
      if (!header) {
        header = trimmed.substring(1).trim();
      }
    } else if (trimmed.length > 0) {
      sequenceLines.push(trimmed);
    }
  }

  const sequence = sequenceLines.join("").replace(/\s+/g, "").toUpperCase();

  if (sequence.length === 0) {
    return { valid: false, sequence: "", header, error: "DNA sequence is empty." };
  }

  // Reject invalid or ambiguous characters
  const invalidChars = sequence.replace(/[ACGT]/g, "");
  if (invalidChars.length > 0) {
    const uniqueInvalid = Array.from(new Set(invalidChars.split(""))).join(", ");
    return {
      valid: false,
      sequence: "",
      header,
      error: `Invalid nucleotide character(s) detected: [${uniqueInvalid}]. Only canonical DNA nucleotides (A, C, G, T) are accepted for precise gRNA design. Ambiguous IUPAC symbols are rejected.`,
    };
  }

  if (sequence.length < 23) {
    return {
      valid: false,
      sequence,
      header,
      error: `Sequence length (${sequence.length} nt) is shorter than the minimum 23 nt required for SpCas9 protospacer (20 nt) + PAM (3 nt).`,
    };
  }

  return { valid: true, sequence, header };
}

/**
 * Computes the reverse-complement of a DNA sequence in standard 5'-to-3' orientation.
 */
export function reverseComplement(dna: string): string {
  const complementMap: Record<string, string> = {
    A: "T",
    T: "A",
    C: "G",
    G: "C",
  };

  let rc = "";
  for (let i = dna.length - 1; i >= 0; i--) {
    const base = dna[i];
    rc += complementMap[base] || base;
  }
  return rc;
}

/**
 * Scans a DNA sequence on both strands for SpCas9 NGG PAM sites.
 *
 * SpCas9 targeting conventions:
 * 1. Forward Strand (+):
 *    Top strand:  5'- [20-nt Protospacer] - [N G G] -3'
 *    Guide RNA (5'->3'): Same as 20-nt protospacer
 *    PAM: NGG
 *
 * 2. Reverse Strand (-):
 *    Top strand:  5'- [C C N] - [20-nt Target Region] -3'
 *    Bottom strand (5'->3'): 5'- ReverseComplement(20-nt Target Region) - [N' G G] -3'
 *    Guide RNA (5'->3'): Reverse complement of the 20-nt region immediately downstream of CCN
 *    PAM on bottom strand: N'GG (where N' = complement of N)
 *
 * Coordinates:
 * - 1-based, fully inclusive [start, end]
 * - Relative to the 5' end of the provided sequence (Position 1 = first nucleotide).
 * - Distinctly reports protospacer coordinates vs PAM coordinates.
 */
export function findSpCas9PamSites(seq: string): PamSiteMatch[] {
  const matches: PamSiteMatch[] = [];
  const len = seq.length;

  if (len < 23) {
    return matches;
  }

  // Valid 23-nt windows start from index 0 up to len - 23 (inclusive)
  for (let i = 0; i <= len - 23; i++) {
    // ── 1. Check Forward Strand (+): ...[20nt]...[N][G][G]
    if (seq[i + 21] === "G" && seq[i + 22] === "G") {
      const protospacer = seq.substring(i, i + 20);
      const pam = seq.substring(i + 20, i + 23);
      const hasFullContext = i >= 4 && i + 26 <= len;
      const sequence30 = hasFullContext ? seq.substring(i - 4, i + 26) : null;

      matches.push({
        strand: "+",
        startPosition: i + 1,
        endPosition: i + 23,
        protospacerStart: i + 1,
        protospacerEnd: i + 20,
        pamStart: i + 21,
        pamEnd: i + 23,
        guideSequence: protospacer,
        pamSequence: pam,
        topStrandPam: pam,
        sequence30,
        hasFullContext,
      });
    }

    // ── 2. Check Reverse Strand (-): [C][C][N]...[20nt]...
    if (seq[i] === "C" && seq[i + 1] === "C") {
      const topPam = seq.substring(i, i + 3); // CCN on top strand
      const topProtospacer = seq.substring(i + 3, i + 23); // 20 nt downstream of CCN

      // The active guide on the reverse strand is the reverse complement
      const reverseGuide = reverseComplement(topProtospacer);
      // The PAM on the reverse strand (5'->3') is the reverse complement of CCN -> N'GG
      const bottomPam = reverseComplement(topPam);
      const hasFullContext = i >= 3 && i + 27 <= len;
      const sequence30 = hasFullContext ? reverseComplement(seq.substring(i - 3, i + 27)) : null;

      matches.push({
        strand: "-",
        startPosition: i + 1,
        endPosition: i + 23,
        protospacerStart: i + 4,
        protospacerEnd: i + 23,
        pamStart: i + 1,
        pamEnd: i + 3,
        guideSequence: reverseGuide,
        pamSequence: bottomPam,
        topStrandPam: topPam,
        sequence30,
        hasFullContext,
      });
    }
  }

  return matches;
}

/**
 * Computes deterministic biological sequence features and a rule-based heuristic score.
 *
 * Scoring Heuristic Rationale (transparent, empirical rules):
 * - Base suitability score: 50.0
 * - GC Content: Optimal 40% - 60% (+25 pts); moderate 35%-40% or 60%-70% (+10 pts); extreme <30% or >80% (-20 pts).
 * - Poly-T Presence (>= 4 consecutive Ts): -35 pts (causes premature termination in U6/H1 Pol III expression).
 * - Position 20 Nucleotide (immediately 5' of PAM): Guanine (+10 pts) favored; Thymine (-10 pts) disfavored.
 * - Homopolymer Run >= 5 nt: -15 pts (synthesis difficulty and indel risk).
 * - Internal Inverted Repeat: -10 pts (self-annealing / hairpin formation penalty).
 */
export function calculateGrnaFeatures(guideSequence: string): GrnaFeatureVector {
  const guide = guideSequence.toUpperCase();
  const len = guide.length; // Expected: 20

  // 1. GC Content
  const gCount = (guide.match(/G/g) || []).length;
  const cCount = (guide.match(/C/g) || []).length;
  const gcContent = parseFloat(((gCount + cCount) / len).toFixed(4));

  // 2. Poly-T termination signal
  const hasPolyT = /TTTT/.test(guide);

  // 3. Homopolymer Run Max
  const homopolymerMatches = guide.match(/(.)\1+/g) || [];
  let homopolymerRunMax = 1;
  for (const m of homopolymerMatches) {
    if (m.length > homopolymerRunMax) {
      homopolymerRunMax = m.length;
    }
  }

  // 4. Positional nucleotides
  const position1G = guide[0] === "G" ? 1 : 0;
  const position20G = guide[19] === "G" ? 1 : 0;
  const firstNucleotide = guide[0] || "";
  const lastNucleotide = guide[19] || "";

  // 5. Basic self-complementarity / hairpin check (4-nt inverted repeats)
  let hasSelfComplementarityRisk = false;
  if (len >= 8) {
    const prefix = guide.substring(0, 4);
    const suffix = guide.substring(len - 4);
    if (prefix === reverseComplement(suffix)) {
      hasSelfComplementarityRisk = true;
    }
  }

  // 6. Transparent Empirical Heuristic Suitability Score (0.0 to 100.0)
  let score = 50.0;

  // GC balance
  if (gcContent >= 0.4 && gcContent <= 0.6) {
    score += 25.0;
  } else if ((gcContent >= 0.35 && gcContent < 0.4) || (gcContent > 0.6 && gcContent <= 0.7)) {
    score += 10.0;
  } else if (gcContent < 0.3 || gcContent > 0.8) {
    score -= 20.0;
  }

  // Poly-T termination penalty
  if (hasPolyT) {
    score -= 35.0;
  }

  // Positional preferences
  if (guide[19] === "G") {
    score += 10.0; // G immediately adjacent to PAM is favored
  } else if (guide[19] === "T") {
    score -= 10.0; // T immediately adjacent to PAM is disfavored
  }

  // Homopolymer penalty
  if (homopolymerRunMax >= 5) {
    score -= 15.0;
  }

  // Self-complementarity penalty
  if (hasSelfComplementarityRisk) {
    score -= 10.0;
  }

  // Clamp score between 0.0 and 100.0
  score = Math.max(0.0, Math.min(100.0, score));
  const heuristicScore = parseFloat(score.toFixed(1));

  const confidence: "high" | "medium" | "low" =
    heuristicScore >= 70.0 ? "high" : heuristicScore >= 50.0 ? "medium" : "low";

  return {
    gcContent,
    hasPolyT,
    homopolymerRunMax,
    hasSelfComplementarityRisk,
    position1G,
    position20G,
    firstNucleotide,
    lastNucleotide,
    heuristicScore,
    confidence,
  };
}

/**
 * Extracts, annotates, and ranks all valid SpCas9 gRNA candidates from a DNA sequence.
 * - Detects dual-strand SpCas9 PAM sites
 * - Calculates sequence-derived features and heuristic scores
 * - Ranks candidates deterministically by heuristicScore descending
 * - Returns an empty array if no PAM sites are found (zero artificial inflation)
 */
export function extractAndRankGrnaCandidates(seq: string): ProcessedGrnaCandidate[] {
  const pamMatches = findSpCas9PamSites(seq);

  if (pamMatches.length === 0) {
    return [];
  }

  const annotated = pamMatches.map((pam) => {
    const features = calculateGrnaFeatures(pam.guideSequence);
    return {
      ...pam,
      ...features,
    };
  });

  // Sort descending by heuristicScore, then by startPosition ascending
  annotated.sort((a, b) => {
    if (b.heuristicScore !== a.heuristicScore) {
      return b.heuristicScore - a.heuristicScore;
    }
    return a.startPosition - b.startPosition;
  });

  return annotated.map((c, index) => ({
    ...c,
    guideName: `gRNA_${(index + 1).toString().padStart(2, "0")}`,
    finalRank: index + 1,
    randomForestScore: null,
    mlStatus: c.hasFullContext ? ("unassessed" as const) : ("incomplete_context" as const),
  }));
}
