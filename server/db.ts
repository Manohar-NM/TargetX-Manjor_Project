import { eq, desc, and, gte, lte, inArray, count, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  projects,
  pipelineStages,
  grnaCandidates,
  offTargetSites,
  shapResults,
  reports,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const caPath = path.resolve(process.cwd(), "certs", "aiven-ca.pem");
      if (fs.existsSync(caPath)) {
        const ca = fs.readFileSync(caPath, "utf-8");
        const cleanUrl = process.env.DATABASE_URL.replace(/\?ssl-mode=REQUIRED(&|$)/, "").replace(/\?$/, "");
        const u = new URL(cleanUrl.replace(/^mysql:/, "http:"));
        _db = drizzle({
          connection: {
            host: u.hostname,
            port: parseInt(u.port || "3306"),
            user: u.username,
            password: u.password,
            database: u.pathname.slice(1),
            ssl: {
              ca,
              rejectUnauthorized: true,
            },
          },
        });
      } else {
        _db = drizzle(process.env.DATABASE_URL);
      }
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

/* ──────────────────────────────────────────────────────────────────────────────
   USER QUERIES
   ────────────────────────────────────────────────────────────────────────────── */

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/* ──────────────────────────────────────────────────────────────────────────────
   PROJECT QUERIES
   ────────────────────────────────────────────────────────────────────────────── */

export async function createProject(input: {
  userId: number;
  name: string;
  description?: string;
  organism: string;
  genome?: string;
  pamType?: string;
  inputMode: "nlp" | "gene" | "sequence";
  inputText: string;
  targetGene?: string;
  targetSequence?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [newProject] = await db
    .insert(projects)
    .values({
      userId: input.userId,
      name: input.name,
      description: input.description || null,
      organism: input.organism,
      genome: input.genome || "hg38",
      pamType: input.pamType || "NGG",
      inputMode: input.inputMode,
      inputText: input.inputText,
      targetGene: input.targetGene || null,
      targetSequence: input.targetSequence || null,
      status: "draft",
    })
    .$returningId();

  return { id: newProject.id };
}

export async function getProjectById(projectId: number, userId?: number) {
  const db = await getDb();
  if (!db) return undefined;

  const conditions = [eq(projects.id, projectId)];
  if (userId) conditions.push(eq(projects.userId, userId));

  const result = await db.select().from(projects).where(and(...conditions)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserProjects(userId: number, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return { projects: [], total: 0 };

  const [result, countResult] = await Promise.all([
    db
      .select()
      .from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(desc(projects.updatedAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: count() }).from(projects).where(eq(projects.userId, userId)),
  ]);

  return { projects: result, total: countResult[0]?.count ?? 0 };
}

export async function updateProjectStatus(projectId: number, status: "draft" | "running" | "complete" | "error") {
  const db = await getDb();
  if (!db) return;
  await db.update(projects).set({ status, updatedAt: new Date() }).where(eq(projects.id, projectId));
}

export async function deleteProject(projectId: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(projects).where(and(eq(projects.id, projectId), eq(projects.userId, userId)));
}

/* ──────────────────────────────────────────────────────────────────────────────
   PIPELINE STAGE QUERIES
   ────────────────────────────────────────────────────────────────────────────── */

export async function createPipelineStage(input: {
  projectId: number;
  stageName: string;
  stageOrder: number;
  inputSummary?: string;
  outputSummary?: string;
  outputData?: Record<string, unknown>;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [newStage] = await db
    .insert(pipelineStages)
    .values({
      projectId: input.projectId,
      stageName: input.stageName as any,
      status: "pending",
      stageOrder: input.stageOrder,
      inputSummary: input.inputSummary || null,
      outputSummary: input.outputSummary || null,
      outputData: input.outputData || null,
      startedAt: new Date(),
    })
    .$returningId();

  return { id: newStage.id };
}

export async function updatePipelineStage(stageId: number, update: {
  status?: "pending" | "running" | "complete" | "error";
  outputSummary?: string;
  outputData?: Record<string, unknown>;
  completedAt?: Date;
  error?: string;
}) {
  const db = await getDb();
  if (!db) return;

  const setValues: Record<string, unknown> = {};
  if (update.status !== undefined) setValues.status = update.status;
  if (update.outputSummary !== undefined) setValues.outputSummary = update.outputSummary;
  if (update.outputData !== undefined) setValues.outputData = update.outputData;
  if (update.completedAt !== undefined) setValues.completedAt = update.completedAt;
  if (update.error !== undefined) setValues.error = update.error;

  await db.update(pipelineStages).set(setValues).where(eq(pipelineStages.id, stageId));
}

export async function getPipelineStages(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(pipelineStages)
    .where(eq(pipelineStages.projectId, projectId))
    .orderBy(pipelineStages.stageOrder);
}

/* ──────────────────────────────────────────────────────────────────────────────
   gRNA CANDIDATE QUERIES
   ────────────────────────────────────────────────────────────────────────────── */

export async function createGrnaCandidate(input: {
  projectId: number;
  guideName: string;
  guideSequence: string;
  pamSequence?: string;
  chromosome?: string;
  startPosition?: number;
  endPosition?: number;
  strand?: string;
  gcContent: number;
  features?: Record<string, number>;
  scores?: {
    xgboostScore?: number;
    lightgbmScore?: number;
    randomForestScore?: number | null;
    ensembleScore?: number;
  };
  finalRank?: number;
  confidence?: "high" | "medium" | "low";
  totalOfftargetSites?: number;
  offTargetRisk?: "low" | "medium" | "high" | "unassessed";
  seedMismatchCount?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [newCandidate] = await db
    .insert(grnaCandidates)
    .values({
      projectId: input.projectId,
      guideName: input.guideName,
      guideSequence: input.guideSequence,
      pamSequence: input.pamSequence || "NGG",
      chromosome: input.chromosome || null,
      startPosition: input.startPosition || null,
      endPosition: input.endPosition || null,
      strand: input.strand || "+",
      gcContent: input.gcContent,
      ...(input.features || {}),
      xgboostScore: input.scores?.xgboostScore ?? 0,
      lightgbmScore: input.scores?.lightgbmScore ?? 0,
      randomForestScore: input.scores?.randomForestScore ?? null,
      ensembleScore: input.scores?.ensembleScore ?? 0,
      finalRank: input.finalRank || 0,
      confidence: input.confidence || "medium",
      totalOfftargetSites: input.totalOfftargetSites ?? 0,
      offTargetRisk: input.offTargetRisk || "unassessed",
      seedMismatchCount: input.seedMismatchCount ?? 0,
    })
    .$returningId();

  return { id: newCandidate.id };
}

export async function getProjectCandidates(projectId: number, options?: {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
  confidenceFilter?: "high" | "medium" | "low";
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(grnaCandidates.projectId, projectId)];
  if (options?.confidenceFilter) {
    conditions.push(eq(grnaCandidates.confidence, options.confidenceFilter));
  }

  const orderByClause =
    options?.sortBy === "ensembleScore"
      ? options.sortOrder === "asc"
        ? grnaCandidates.ensembleScore
        : desc(grnaCandidates.ensembleScore)
      : options?.sortBy === "gcContent"
        ? options.sortOrder === "asc"
          ? grnaCandidates.gcContent
          : desc(grnaCandidates.gcContent)
        : grnaCandidates.finalRank;

  return db
    .select()
    .from(grnaCandidates)
    .where(and(...conditions))
    .orderBy(orderByClause)
    .limit(options?.limit ?? 100)
    .offset(options?.offset ?? 0);
}

export async function getCandidateById(candidateId: number, projectId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(grnaCandidates)
    .where(and(eq(grnaCandidates.id, candidateId), eq(grnaCandidates.projectId, projectId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getProjectStats(projectId: number) {
  const db = await getDb();
  if (!db) return null;

  const stats = await db
    .select({
      totalCandidates: count(),
      avgEnsembleScore: sql<number>`AVG(${grnaCandidates.ensembleScore})`,
      avgGcContent: sql<number>`AVG(${grnaCandidates.gcContent})`,
      highConfidence: sql<number>`SUM(CASE WHEN ${grnaCandidates.confidence} = 'high' THEN 1 ELSE 0 END)`,
      lowOfftargetRisk: sql<number>`SUM(CASE WHEN ${grnaCandidates.offTargetRisk} = 'low' THEN 1 ELSE 0 END)`,
    })
    .from(grnaCandidates)
    .where(eq(grnaCandidates.projectId, projectId));

  return stats[0] ?? null;
}

/* ──────────────────────────────────────────────────────────────────────────────
   OFF-TARGET SITE QUERIES
   ────────────────────────────────────────────────────────────────────────────── */

export async function createOffTargetSite(input: {
  candidateId: number;
  projectId: number;
  chromosome: string;
  position: number;
  strand?: string;
  mismatchCount: number;
  mismatchPositions?: number[];
  pamSequence?: string;
  cleavageProbability?: number;
  severity?: "safe" | "caution" | "risk" | "critical";
  genomicContext?: string;
  isInCodingRegion?: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [newSite] = await db
    .insert(offTargetSites)
    .values({
      candidateId: input.candidateId,
      projectId: input.projectId,
      chromosome: input.chromosome,
      position: input.position,
      strand: input.strand || "+",
      mismatchCount: input.mismatchCount,
      mismatchPositions: input.mismatchPositions || null,
      pamSequence: input.pamSequence || null,
      cleavageProbability: input.cleavageProbability ?? 0,
      severity: input.severity || "safe",
      genomicContext: input.genomicContext || null,
      isInCodingRegion: input.isInCodingRegion ? 1 : 0,
    })
    .$returningId();

  return { id: newSite.id };
}

export async function getCandidateOffTargets(candidateId: number, projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(offTargetSites)
    .where(and(eq(offTargetSites.candidateId, candidateId), eq(offTargetSites.projectId, projectId)))
    .orderBy(offTargetSites.severity);
}

export async function getOffTargetStats(projectId: number) {
  const db = await getDb();
  if (!db) return null;

  const stats = await db
    .select({
      totalSites: count(),
      safeCount: sql<number>`SUM(CASE WHEN ${offTargetSites.severity} = 'safe' THEN 1 ELSE 0 END)`,
      cautionCount: sql<number>`SUM(CASE WHEN ${offTargetSites.severity} = 'caution' THEN 1 ELSE 0 END)`,
      riskCount: sql<number>`SUM(CASE WHEN ${offTargetSites.severity} = 'risk' THEN 1 ELSE 0 END)`,
      criticalCount: sql<number>`SUM(CASE WHEN ${offTargetSites.severity} = 'critical' THEN 1 ELSE 0 END)`,
      avgMismatches: sql<number>`AVG(${offTargetSites.mismatchCount})`,
    })
    .from(offTargetSites)
    .where(eq(offTargetSites.projectId, projectId));

  return stats[0] ?? null;
}

/* ──────────────────────────────────────────────────────────────────────────────
   SHAP EXPLAINABILITY QUERIES
   ────────────────────────────────────────────────────────────────────────────── */

export async function createShapResult(input: {
  candidateId: number;
  projectId: number;
  featureName: string;
  shapValue: number;
  featureValue?: number;
  contribution?: number;
  direction?: "positive" | "negative";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [newResult] = await db
    .insert(shapResults)
    .values({
      candidateId: input.candidateId,
      projectId: input.projectId,
      featureName: input.featureName,
      shapValue: input.shapValue,
      featureValue: input.featureValue ?? 0,
      contribution: input.contribution ?? 0,
      direction: input.direction || "positive",
    })
    .$returningId();

  return { id: newResult.id };
}

export async function getCandidateShapResults(candidateId: number, projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(shapResults)
    .where(and(eq(shapResults.candidateId, candidateId), eq(shapResults.projectId, projectId)))
    .orderBy(desc(shapResults.shapValue));
}

export async function getProjectShapSummary(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      featureName: shapResults.featureName,
      avgShapValue: sql<number>`AVG(${shapResults.shapValue})`,
      avgFeatureValue: sql<number>`AVG(${shapResults.featureValue})`,
    })
    .from(shapResults)
    .where(eq(shapResults.projectId, projectId))
    .groupBy(shapResults.featureName)
    .orderBy(desc(sql<number>`AVG(${shapResults.shapValue})`));
}

/* ──────────────────────────────────────────────────────────────────────────────
   REPORT QUERIES
   ────────────────────────────────────────────────────────────────────────────── */

export async function createReport(input: {
  projectId: number;
  reportTitle: string;
  executiveSummary?: string;
  methodology?: string;
  results?: Record<string, unknown>;
  topCandidates?: Record<string, unknown>[];
  recommendations?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [newReport] = await db
    .insert(reports)
    .values({
      projectId: input.projectId,
      reportTitle: input.reportTitle,
      executiveSummary: input.executiveSummary || null,
      methodology: input.methodology || null,
      results: input.results || null,
      topCandidates: input.topCandidates || null,
      recommendations: input.recommendations || null,
    })
    .$returningId();

  return { id: newReport.id };
}

export async function getProjectReport(projectId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(reports)
    .where(eq(reports.projectId, projectId))
    .orderBy(desc(reports.generatedAt))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}
