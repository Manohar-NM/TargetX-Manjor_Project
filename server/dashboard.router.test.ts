import "dotenv/config";
import { describe, expect, it, afterAll } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestCaller() {
  const user: AuthenticatedUser = {
    id: 9992,
    openId: "test-dashboard-user",
    email: "dashboard-test@targetx.bio",
    name: "Dashboard Test Researcher",
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

describe("TargetX Phase 4 Step 3: Dashboard Data & Analytics Integration", () => {
  const createdProjectIds: number[] = [];

  afterAll(async () => {
    // Teardown test projects
    for (const id of createdProjectIds) {
      try {
        await db.deleteProject(id, 9992);
      } catch {
        // Ignore deletion errors during cleanup
      }
    }
  });

  it("strictly scopes candidate queries to activeProjectId without leaking records from other projects", async () => {
    const { caller } = createTestCaller();

    // Create Project A
    const projectA = await caller.projects.create({
      name: "Dashboard Scope Project A",
      organism: "Homo sapiens",
      inputMode: "sequence",
      inputText: "ATGCATGCATGCATGC",
    });
    createdProjectIds.push(projectA.id);

    // Create Project B
    const projectB = await caller.projects.create({
      name: "Dashboard Scope Project B",
      organism: "Homo sapiens",
      inputMode: "sequence",
      inputText: "CGTACGTACGTACGTA",
    });
    createdProjectIds.push(projectB.id);

    // Add candidate to Project A
    await db.createGrnaCandidate({
      projectId: projectA.id,
      guideName: "Guide_A_Only",
      guideSequence: "ATGGAACGTTCTAGCCGTCA",
      pamSequence: "AGG",
      gcContent: 0.55,
      scores: {
        randomForestScore: 0.458,
        ensembleScore: 0.8,
      },
      finalRank: 1,
      confidence: "high",
      offTargetRisk: "unassessed",
    });

    // Add candidate to Project B
    await db.createGrnaCandidate({
      projectId: projectB.id,
      guideName: "Guide_B_Only",
      guideSequence: "CCGTAGCTTAAGCCTGATAG",
      pamSequence: "TGG",
      gcContent: 0.5,
      scores: {
        randomForestScore: null,
        ensembleScore: 0.7,
      },
      finalRank: 1,
      confidence: "medium",
      offTargetRisk: "unassessed",
    });

    // Query Project A
    const candidatesA = await caller.candidates.list({ projectId: projectA.id });
    expect(candidatesA).toHaveLength(1);
    expect(candidatesA[0].guideName).toBe("Guide_A_Only");
    expect(candidatesA[0].randomForestScore).toBeCloseTo(0.458, 3);

    // Query Project B
    const candidatesB = await caller.candidates.list({ projectId: projectB.id });
    expect(candidatesB).toHaveLength(1);
    expect(candidatesB[0].guideName).toBe("Guide_B_Only");
    expect(candidatesB[0].randomForestScore).toBeNull();
  });

  it("accurately returns null randomForestScore for guides lacking 30-mer flanking context", async () => {
    const { caller } = createTestCaller();

    const project = await caller.projects.create({
      name: "Null Score Context Test",
      organism: "Homo sapiens",
      inputMode: "sequence",
      inputText: "ATGCATGCATGC",
    });
    createdProjectIds.push(project.id);

    await db.createGrnaCandidate({
      projectId: project.id,
      guideName: "Edge_Guide_Null_RF",
      guideSequence: "ATGGAACGTTCTAGCCGTCA",
      gcContent: 0.55,
      scores: {
        randomForestScore: null, // Context incomplete
        ensembleScore: 0.75,
      },
      finalRank: 1,
      confidence: "medium",
      offTargetRisk: "unassessed",
    });

    const candidates = await caller.candidates.list({ projectId: project.id });
    expect(candidates).toHaveLength(1);
    expect(candidates[0].randomForestScore).toBeNull();
    expect(candidates[0].offTargetRisk).toBe("unassessed");
  });

  it("handles empty candidate results correctly when a project produces zero PAM sites", async () => {
    const { caller } = createTestCaller();

    const project = await caller.projects.create({
      name: "Empty Candidates Project",
      organism: "Homo sapiens",
      inputMode: "sequence",
      inputText: "AAAAATTTTTAAAAATTTTT",
    });
    createdProjectIds.push(project.id);

    const candidates = await caller.candidates.list({ projectId: project.id });
    expect(candidates).toHaveLength(0);

    const stats = await caller.projects.stats({ projectId: project.id });
    expect(stats).toBeDefined();
    expect(stats?.totalCandidates).toBe(0);
  });

  it("throws NOT_FOUND error when querying a non-existent project ID", async () => {
    const { caller } = createTestCaller();

    await expect(caller.projects.get({ projectId: 99999999 })).rejects.toThrow("Project not found");
  });

  it("returns project-wide SHAP summary stored by the pipeline engine", async () => {
    const { caller } = createTestCaller();

    const project = await caller.projects.create({
      name: "SHAP Summary Project",
      organism: "Homo sapiens",
      inputMode: "gene",
      inputText: "TP53",
    });
    createdProjectIds.push(project.id);

    const cand = await db.createGrnaCandidate({
      projectId: project.id,
      guideName: "Guide_SHAP_Test",
      guideSequence: "ATGGAACGTTCTAGCCGTCA",
      gcContent: 0.55,
      scores: { ensembleScore: 0.8 },
      finalRank: 1,
      offTargetRisk: "unassessed",
    });

    await db.createShapResult({
      candidateId: cand.id,
      projectId: project.id,
      featureName: "gc_content",
      shapValue: 0.25,
      featureValue: 0.55,
      direction: "positive",
    });

    const shapSummary = await caller.shap.summary({ projectId: project.id });
    expect(shapSummary).toHaveLength(1);
    expect(shapSummary[0].featureName).toBe("gc_content");
    expect(shapSummary[0].avgShapValue).toBeCloseTo(0.25, 2);
  });
});
