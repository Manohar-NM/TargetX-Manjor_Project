import "dotenv/config";
import { describe, expect, it, afterAll, beforeAll } from "vitest";
import { eq } from "drizzle-orm";
import * as db from "./db";
import { users, projects, grnaCandidates, pipelineStages } from "../drizzle/schema";

describe("TargetX Phase 3 Step 5: Backend Database Integration Test", () => {
  let testOpenId: string;
  let testUserId: number;
  let testProjectId: number;
  let candNullId: number;
  let candFloatId: number;
  let stageId: number;

  beforeAll(async () => {
    testOpenId = `test_integration_user_${Date.now()}`;

    // 1. Create isolated test user
    await db.upsertUser({
      openId: testOpenId,
      name: "TargetX Automated Integration User",
      email: "test.integration@targetx.internal",
      loginMethod: "test",
      role: "user",
    });

    const user = await db.getUserByOpenId(testOpenId);
    expect(user).toBeDefined();
    testUserId = user!.id;
  });

  afterAll(async () => {
    const dbConn = await db.getDb();
    if (dbConn) {
      // Clean up test records strictly scoped to our isolated test IDs
      if (testProjectId) {
        await dbConn.delete(grnaCandidates).where(eq(grnaCandidates.projectId, testProjectId));
        await dbConn.delete(pipelineStages).where(eq(pipelineStages.projectId, testProjectId));
        await dbConn.delete(projects).where(eq(projects.id, testProjectId));
      }
      if (testOpenId) {
        await dbConn.delete(users).where(eq(users.openId, testOpenId));
      }

      // Verify that cleanup succeeded
      if (testProjectId) {
        const remainingCands = await db.getProjectCandidates(testProjectId);
        expect(remainingCands.length).toBe(0);
        const remainingProj = await db.getProjectById(testProjectId);
        expect(remainingProj).toBeUndefined();
      }
      if (testOpenId) {
        const remainingUser = await db.getUserByOpenId(testOpenId);
        expect(remainingUser).toBeUndefined();
      }
    }
  });

  it("creates and retrieves a new TargetX project in Aiven MySQL", async () => {
    const created = await db.createProject({
      userId: testUserId,
      name: `TargetX Test Run ${Date.now()}`,
      description: "Automated Phase 3 Step 5 Database Integration Test",
      organism: "Homo sapiens",
      genome: "hg38",
      pamType: "NGG",
      inputMode: "sequence",
      inputText: "AAAACTGTGAGTGTGGGACCTGCTGGGGGC",
      targetGene: "SAMPLE_LOCUS",
      targetSequence: "AAAACTGTGAGTGTGGGACCTGCTGGGGGC",
    });

    expect(created.id).toBeGreaterThan(0);
    testProjectId = created.id;

    const retrieved = await db.getProjectById(testProjectId, testUserId);
    expect(retrieved).toBeDefined();
    expect(retrieved!.id).toBe(testProjectId);
    expect(retrieved!.userId).toBe(testUserId);
    expect(retrieved!.status).toBe("draft");
    expect(retrieved!.organism).toBe("Homo sapiens");
    expect(retrieved!.inputMode).toBe("sequence");
    expect(retrieved!.inputText).toBe("AAAACTGTGAGTGTGGGACCTGCTGGGGGC");
  });

  it("persists and retrieves a gRNA candidate with NULL randomForestScore and 'unassessed' offTargetRisk", async () => {
    expect(testProjectId).toBeDefined();

    const created = await db.createGrnaCandidate({
      projectId: testProjectId,
      guideName: "gRNA_test_null_ml",
      guideSequence: "ATGGAACGTTCTAGCCGTCA",
      pamSequence: "CGG",
      chromosome: "chr1",
      startPosition: 100,
      endPosition: 123,
      strand: "+",
      gcContent: 0.5,
      scores: {
        xgboostScore: 0.65,
        lightgbmScore: 0.62,
        randomForestScore: null, // Critical: Explicit NULL score
        ensembleScore: 0.635,
      },
      finalRank: 1,
      confidence: "medium",
      offTargetRisk: "unassessed", // Critical: Unassessed risk
    });

    expect(created.id).toBeGreaterThan(0);
    candNullId = created.id;

    const cand = await db.getCandidateById(candNullId, testProjectId);
    expect(cand).toBeDefined();
    expect(cand!.id).toBe(candNullId);
    expect(cand!.projectId).toBe(testProjectId);
    expect(cand!.guideName).toBe("gRNA_test_null_ml");

    // Critical assertion: randomForestScore must be strictly null (not 0, not undefined)
    expect(cand!.randomForestScore).toBeNull();

    // Critical assertion: offTargetRisk must be strictly 'unassessed'
    expect(cand!.offTargetRisk).toBe("unassessed");
  });

  it("persists and retrieves a gRNA candidate with a real float randomForestScore", async () => {
    expect(testProjectId).toBeDefined();

    const created = await db.createGrnaCandidate({
      projectId: testProjectId,
      guideName: "gRNA_test_float_ml",
      guideSequence: "AAAACTGTGAGTGTGGGACC",
      pamSequence: "TGG",
      chromosome: "chr1",
      startPosition: 150,
      endPosition: 173,
      strand: "+",
      gcContent: 0.55,
      scores: {
        xgboostScore: 0.72,
        lightgbmScore: 0.69,
        randomForestScore: 0.458076, // Verified deterministic model prediction
        ensembleScore: 0.705,
      },
      finalRank: 2,
      confidence: "high",
      offTargetRisk: "unassessed",
    });

    expect(created.id).toBeGreaterThan(0);
    candFloatId = created.id;

    const cand = await db.getCandidateById(candFloatId, testProjectId);
    expect(cand).toBeDefined();
    expect(cand!.id).toBe(candFloatId);
    expect(cand!.projectId).toBe(testProjectId);
    expect(cand!.guideName).toBe("gRNA_test_float_ml");

    // Verify float preservation
    expect(cand!.randomForestScore).toBeCloseTo(0.458076, 5);
    expect(cand!.offTargetRisk).toBe("unassessed");
  });

  it("retrieves project candidates preserving score differentiation and project association", async () => {
    const candidates = await db.getProjectCandidates(testProjectId);
    expect(candidates.length).toBe(2);

    const nullCand = candidates.find((c) => c.guideName === "gRNA_test_null_ml");
    const floatCand = candidates.find((c) => c.guideName === "gRNA_test_float_ml");

    expect(nullCand).toBeDefined();
    expect(nullCand!.randomForestScore).toBeNull();
    expect(nullCand!.offTargetRisk).toBe("unassessed");

    expect(floatCand).toBeDefined();
    expect(floatCand!.randomForestScore).toBeCloseTo(0.458076, 5);
    expect(floatCand!.offTargetRisk).toBe("unassessed");
  });

  it("creates and retrieves pipeline stages consistently for the test project", async () => {
    const stage = await db.createPipelineStage({
      projectId: testProjectId,
      stageName: "efficiency",
      stageOrder: 4,
      inputSummary: "Evaluating on-target efficiency models",
      outputSummary: "Random Forest inference completed",
      outputData: { scoredCount: 1, incompleteContextCount: 1 },
    });

    expect(stage.id).toBeGreaterThan(0);
    stageId = stage.id;

    const stages = await db.getPipelineStages(testProjectId);
    expect(stages.length).toBe(1);
    expect(stages[0].id).toBe(stageId);
    expect(stages[0].stageName).toBe("efficiency");
    expect(stages[0].status).toBe("pending");
  });

  it("updates project status correctly in Aiven MySQL", async () => {
    await db.updateProjectStatus(testProjectId, "running");
    let proj = await db.getProjectById(testProjectId);
    expect(proj!.status).toBe("running");

    await db.updateProjectStatus(testProjectId, "complete");
    proj = await db.getProjectById(testProjectId);
    expect(proj!.status).toBe("complete");
  });
});
