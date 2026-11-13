import "dotenv/config";
import { describe, expect, it, afterAll } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestCaller() {
  const user: AuthenticatedUser = {
    id: 9991,
    openId: "test-pipeline-router-user",
    email: "router-test@targetx.bio",
    name: "Router Test Researcher",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { caller: appRouter.createCaller(ctx), user };
}

describe("TargetX Phase 4 Step 2: Pipeline Router & UI Procedures", () => {
  const createdProjectIds: number[] = [];

  afterAll(async () => {
    // Teardown test projects created during router tests
    for (const id of createdProjectIds) {
      try {
        await db.deleteProject(id, 9991);
      } catch {
        // Ignore deletion error during cleanup
      }
    }
  });

  it("creates a new project via projects.create procedure with valid parameters", async () => {
    const { caller } = createTestCaller();

    const result = await caller.projects.create({
      name: "Phase 4 Router Test Project",
      description: "Testing tRPC pipeline integration",
      organism: "Oryza sativa",
      genome: "IRGSP-1.0",
      pamType: "NGG",
      inputMode: "sequence",
      inputText: "ATGGAACGTTCTAGCCGTCAGGGTAAGCGGCGGGGCCGGCCCCCCAAAAGGGGGCCAGCCGCAGCTGCCGCAGCAGCCACCACCACCGCCGCGGCGGAGGAGGAGGAGGAGGAGGAGGAGGAGGAGGAGGAGGAGGAGGAGGAGGAGGAGGAGGAGGAGGAGGAGGAG",
    });

    expect(result).toBeDefined();
    expect(result.id).toBeGreaterThan(0);
    createdProjectIds.push(result.id);

    // Verify project can be retrieved
    const project = await caller.projects.get({ projectId: result.id });
    expect(project.name).toBe("Phase 4 Router Test Project");
    expect(project.organism).toBe("Oryza sativa");
    expect(project.status).toBe("draft");
  });

  it("handles invalid DNA sequences by marking Stage 0 as error and setting project status to error", async () => {
    const { caller } = createTestCaller();

    const project = await caller.projects.create({
      name: "Invalid DNA Test",
      organism: "Homo sapiens",
      inputMode: "sequence",
      inputText: "ATGC_INVALID_CHARACTERS_12345!",
    });
    createdProjectIds.push(project.id);

    const runResult = await caller.pipeline.runPipeline({
      projectId: project.id,
      inputMode: "sequence",
      inputText: "ATGC_INVALID_CHARACTERS_12345!",
    });

    expect(runResult.success).toBe(true);

    // Wait for async pipeline execution to reach validation failure
    let projectState = await caller.projects.get({ projectId: project.id });
    let attempts = 0;
    while (projectState.status !== "error" && attempts < 15) {
      await new Promise((r) => setTimeout(r, 400));
      projectState = await caller.projects.get({ projectId: project.id });
      attempts++;
    }

    expect(projectState.status).toBe("error");

    const stages = await caller.pipeline.getStages({ projectId: project.id });
    expect(stages.length).toBeGreaterThan(0);
    const stage0 = stages.find((s) => s.stageOrder === 0);
    expect(stage0).toBeDefined();
    expect(stage0?.status).toBe("error");
    expect(stage0?.outputSummary).toContain("Invalid nucleotide character(s) detected");
  }, 30000);

  it("handles valid sequences with zero PAM sites: completes without fabricating guides, offTargetRisk remains unassessed", async () => {
    const { caller } = createTestCaller();

    // 60-mer with NO 'GG' or 'CC' motifs
    const zeroPamSeq = "AAAAATTTTTAAAAATTTTTAAAAATTTTTAAAAATTTTTAAAAATTTTTAAAAATTTTT";

    const project = await caller.projects.create({
      name: "Zero PAM Validation",
      organism: "Homo sapiens",
      inputMode: "sequence",
      inputText: zeroPamSeq,
    });
    createdProjectIds.push(project.id);

    await caller.pipeline.runPipeline({
      projectId: project.id,
      inputMode: "sequence",
      inputText: zeroPamSeq,
    });

    // Wait for pipeline completion
    let projectState = await caller.projects.get({ projectId: project.id });
    let attempts = 0;
    while (projectState.status !== "complete" && projectState.status !== "error" && attempts < 35) {
      await new Promise((r) => setTimeout(r, 400));
      projectState = await caller.projects.get({ projectId: project.id });
      attempts++;
    }

    expect(projectState.status).toBe("complete");

    // Verify PAM detection stage recorded 0 PAMs
    const stages = await caller.pipeline.getStages({ projectId: project.id });
    const pamStage = stages.find((s) => s.stageOrder === 2);
    expect(pamStage?.status).toBe("complete");
    expect((pamStage?.outputData as any)?.totalPamCount).toBe(0);

    // Verify 0 candidates produced
    const candidates = await caller.candidates.list({ projectId: project.id });
    expect(candidates).toHaveLength(0);

    // Verify report recommends alternative endonuclease
    const report = await caller.reports.get({ projectId: project.id });
    expect(report).toBeDefined();
    expect(report?.recommendations).toContain("Cas12a");
  }, 30000);

  it("executes full 8-stage pipeline for target gene, persisting real candidates with unassessed risk and model scores", async () => {
    const { caller } = createTestCaller();

    const project = await caller.projects.create({
      name: "TP53 Target Analysis",
      organism: "Homo sapiens",
      inputMode: "gene",
      inputText: "TP53",
      targetGene: "TP53",
    });
    createdProjectIds.push(project.id);

    await caller.pipeline.runPipeline({
      projectId: project.id,
      inputMode: "gene",
      inputText: "TP53",
    });

    // Wait for pipeline completion
    let projectState = await caller.projects.get({ projectId: project.id });
    let attempts = 0;
    while (projectState.status !== "complete" && projectState.status !== "error" && attempts < 40) {
      await new Promise((r) => setTimeout(r, 500));
      projectState = await caller.projects.get({ projectId: project.id });
      attempts++;
    }

    expect(projectState.status).toBe("complete");

    // Verify all 8 stages are complete
    const stages = await caller.pipeline.getStages({ projectId: project.id });
    expect(stages.length).toBeGreaterThanOrEqual(8);
    const first8Stages = stages.slice(0, 8);
    for (const stage of first8Stages) {
      expect(stage.status).toBe("complete");
    }

    // Verify candidates were created and retrieved
    const candidates = await caller.candidates.list({ projectId: project.id, sortBy: "finalRank", sortOrder: "asc" });
    expect(candidates.length).toBeGreaterThan(0);

    const topCand = candidates[0];
    expect(topCand.finalRank).toBe(1);
    expect(topCand.guideSequence).toHaveLength(20);
    expect(topCand.offTargetRisk).toBe("unassessed"); // Strictly unassessed, never fabricated low

    // Verify Random Forest score is either a valid probability float in [0, 1] or null (if context incomplete)
    if (topCand.randomForestScore !== null) {
      expect(typeof topCand.randomForestScore).toBe("number");
      expect(topCand.randomForestScore).toBeGreaterThanOrEqual(0);
      expect(topCand.randomForestScore).toBeLessThanOrEqual(1);
    }
  }, 30000);
});
