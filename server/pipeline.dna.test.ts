import { describe, expect, it } from "vitest";
import {
  calculateGrnaFeatures,
  extractAndRankGrnaCandidates,
  findSpCas9PamSites,
  reverseComplement,
  sanitizeDnaSequence,
} from "./pipeline/dnaProcessor";

describe("TargetX DNA Processor Module", () => {
  // ── 1. Known Forward-Strand Target ──
  it("detects a known forward-strand target with exact expected guide, PAM, and 1-based coordinates", () => {
    // 20 nt protospacer + 3 nt PAM (CGG) = 23 nt
    const protospacer = "ATGGAACGTTCTAGCCGTCA";
    const pam = "CGG";
    const seq = protospacer + pam; // 23 nt
    expect(seq.length).toBe(23);

    const matches = findSpCas9PamSites(seq);
    expect(matches.length).toBe(1);

    const match = matches[0];
    expect(match.strand).toBe("+");
    expect(match.guideSequence).toBe(protospacer);
    expect(match.pamSequence).toBe(pam);
    expect(match.topStrandPam).toBe(pam);
    // 1-based coordinates
    expect(match.startPosition).toBe(1);
    expect(match.endPosition).toBe(23);
    expect(match.protospacerStart).toBe(1);
    expect(match.protospacerEnd).toBe(20);
    expect(match.pamStart).toBe(21);
    expect(match.pamEnd).toBe(23);

    // Feature calculation
    const features = calculateGrnaFeatures(match.guideSequence);
    // G: 5, C: 5 -> 10 / 20 = 0.50
    expect(features.gcContent).toBe(0.5);
    expect(features.hasPolyT).toBe(false);
    expect(features.position1G).toBe(0); // 'A'
    expect(features.position20G).toBe(0); // 'A'
  });

  // ── 2. Non-Palindromic Reverse-Strand Target ──
  it("detects a non-palindromic reverse-strand target and generates the exact independently verified reverse-complement guide", () => {
    // Top strand: CCN (CCT) + 20 nt target region
    const topPam = "CCT";
    const topProtospacer = "ATGGAACGTTCTAGCCGTCA";
    const seq = topPam + topProtospacer; // 23 nt
    expect(seq.length).toBe(23);

    // Independently verified reverse-complement:
    // 5'-ATGGAACGTTCTAGCCGTCA-3' -> Complement: 3'-TACCTTGCAAGATCGGCAGT-5'
    // Reversed (5'->3'): 5'-TGACGGCTAGAACGTTCCAT-3'
    const expectedReverseGuide = "TGACGGCTAGAACGTTCCAT";
    expect(reverseComplement(topProtospacer)).toBe(expectedReverseGuide);
    // Verify it is strictly non-palindromic
    expect(expectedReverseGuide).not.toBe(topProtospacer);

    const matches = findSpCas9PamSites(seq);
    expect(matches.length).toBe(1);

    const match = matches[0];
    expect(match.strand).toBe("-");
    expect(match.guideSequence).toBe(expectedReverseGuide);
    expect(match.guideSequence.length).toBe(20);
    // Top strand motif is CCT, bottom strand PAM is AGG (reverse complement of CCT)
    expect(match.topStrandPam).toBe("CCT");
    expect(match.pamSequence).toBe("AGG");
    // 1-based coordinates
    expect(match.startPosition).toBe(1);
    expect(match.endPosition).toBe(23);
    expect(match.pamStart).toBe(1);
    expect(match.pamEnd).toBe(3);
    expect(match.protospacerStart).toBe(4);
    expect(match.protospacerEnd).toBe(23);

    // Feature check on the reverse guide
    const features = calculateGrnaFeatures(match.guideSequence);
    // TGACGGCTAGAACGTTCCAT: G: 5, C: 5 -> 10 / 20 = 0.50
    expect(features.gcContent).toBe(0.5);
    expect(features.hasPolyT).toBe(false);
  });

  // ── 3. Multiple PAMs on Both Strands ──
  it("detects multiple PAMs on both strands within the same sequence", () => {
    // 30 nt sequence containing:
    // Reverse target starting at pos 1 (CCT + 20 nt)
    // Forward target ending at pos 28 (...20 nt + GG)
    const seq = "CCTAAAAAAAAAAAAAAAAAAAATTTTGGA";
    expect(seq.length).toBe(30);

    const matches = findSpCas9PamSites(seq);
    expect(matches.length).toBeGreaterThanOrEqual(2);

    const forwardMatches = matches.filter((m) => m.strand === "+");
    const reverseMatches = matches.filter((m) => m.strand === "-");

    expect(forwardMatches.length).toBeGreaterThan(0);
    expect(reverseMatches.length).toBeGreaterThan(0);

    // Verify reverse match at index 0 (startPosition 1)
    const rev = reverseMatches.find((m) => m.startPosition === 1);
    expect(rev).toBeDefined();
    expect(rev?.pamStart).toBe(1);
    expect(rev?.pamEnd).toBe(3);
    expect(rev?.topStrandPam).toBe("CCT");
    expect(rev?.pamSequence).toBe("AGG");
  });

  // ── 4. First and Last Valid Sequence Windows ──
  it("detects targets at the absolute first and last valid sequence windows", () => {
    // In a 26-nt sequence, valid 23-nt windows start at index 0 (window 1) and index 3 (window 4).
    // Construct a sequence with forward PAMs ending at index 22 and index 25:
    const seq = "AAAAAAAAAAAAAAAAAAAATGGTGG";
    expect(seq.length).toBe(26);

    const matches = findSpCas9PamSites(seq);

    // Window 0 (indices 0..22): positions 1..23
    const firstWindow = matches.find((m) => m.startPosition === 1 && m.endPosition === 23);
    expect(firstWindow).toBeDefined();
    expect(firstWindow?.strand).toBe("+");
    expect(firstWindow?.pamStart).toBe(21);
    expect(firstWindow?.pamEnd).toBe(23);

    // Window 3 (indices 3..25): positions 4..26 (last possible window: len - 23 = 3)
    const lastWindow = matches.find((m) => m.startPosition === 4 && m.endPosition === 26);
    expect(lastWindow).toBeDefined();
    expect(lastWindow?.strand).toBe("+");
    expect(lastWindow?.pamStart).toBe(24);
    expect(lastWindow?.pamEnd).toBe(26);
  });

  // ── 5. Zero PAM Matches ──
  it("returns zero candidates cleanly when no PAM sites exist", () => {
    const noPamSeq = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"; // 30 nt poly-A
    const matches = findSpCas9PamSites(noPamSeq);
    expect(matches).toEqual([]);

    const ranked = extractAndRankGrnaCandidates(noPamSeq);
    expect(ranked).toEqual([]);
    expect(ranked.length).toBe(0);
  });

  // ── 6. FASTA Headers, Whitespace, Lowercase, and Invalid Characters ──
  it("correctly handles FASTA headers, trims whitespace, and normalizes case", () => {
    const rawFasta = `>sample_target_exon_1 [organism=Homo sapiens]
      atg gaacg ttct
      agcc gtcacgg
    `;

    const sanitized = sanitizeDnaSequence(rawFasta);
    expect(sanitized.valid).toBe(true);
    expect(sanitized.header).toBe("sample_target_exon_1 [organism=Homo sapiens]");
    expect(sanitized.sequence).toBe("ATGGAACGTTCTAGCCGTCACGG");

    const candidates = extractAndRankGrnaCandidates(sanitized.sequence);
    expect(candidates.length).toBe(1);
    expect(candidates[0].guideSequence).toBe("ATGGAACGTTCTAGCCGTCA");
  });

  it("rejects invalid non-nucleotide characters with a descriptive error message", () => {
    const invalidDna = "ATGG123XYZ!@#ACGTACGTACGTCGG";
    const result = sanitizeDnaSequence(invalidDna);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Invalid nucleotide character(s) detected");
    expect(result.error).toContain("1, 2, 3, X, Y, Z");
  });

  it("rejects ambiguous IUPAC characters to protect precise guide synthesis", () => {
    const ambiguousDna = "ATGGNNNNRYACGTACGTACGTCGG";
    const result = sanitizeDnaSequence(ambiguousDna);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Ambiguous IUPAC symbols are rejected");
  });

  // ── 7. Short Sequences & Boundary Validation ──
  it("rejects sequences shorter than 23 nt without fabricating candidates", () => {
    const shortSeq = "ATGGAACGTTCTAG"; // 14 nt
    const sanitized = sanitizeDnaSequence(shortSeq);
    expect(sanitized.valid).toBe(false);
    expect(sanitized.error).toContain("shorter than the minimum 23 nt required");

    const candidates = findSpCas9PamSites(shortSeq);
    expect(candidates).toEqual([]);
  });

  // ── 8. Ranking, Guide Length & Deterministic Scoring ──
  it("ranks candidates deterministically and calculates true sequence features", () => {
    // 40 nt sequence with two forward candidates:
    // Candidate 1: balanced GC (50%), no poly-T
    // Candidate 2: contains poly-T (TTTT), which incurs a penalty
    const seq = "ATGGAACGTTCTAGCCGTCACGGATTTTCCGCTGAACAGCGACAGG";
    const ranked = extractAndRankGrnaCandidates(seq);

    expect(ranked.length).toBeGreaterThan(0);
    // Ranks must be sequential: 1, 2, ...
    for (let i = 0; i < ranked.length; i++) {
      expect(ranked[i].finalRank).toBe(i + 1);
      expect(ranked[i].guideSequence.length).toBe(20);
      expect(ranked[i].startPosition).toBeGreaterThanOrEqual(1);
      expect(ranked[i].endPosition).toBeLessThanOrEqual(seq.length);
    }

    // Best ranked guide should have a higher or equal heuristic score than subsequent
    for (let i = 0; i < ranked.length - 1; i++) {
      expect(ranked[i].heuristicScore).toBeGreaterThanOrEqual(ranked[i + 1].heuristicScore);
    }
  });
});
