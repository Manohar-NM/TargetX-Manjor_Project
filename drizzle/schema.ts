import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, double, json } from "drizzle-orm/mysql-core";

/* ──────────────────────────────────────────────────────────────────────────────
   Core user table backing auth flow.
   Columns use camelCase to match both database fields and generated types.
   ────────────────────────────────────────────────────────────────────────────── */

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/* ──────────────────────────────────────────────────────────────────────────────
   TargetX CRISPR Analysis Schema
   ────────────────────────────────────────────────────────────────────────────── */

/**
 * CRISPR research projects — top-level container for an analysis session.
 * Each project represents one biological goal and its full pipeline results.
 */
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  description: text("description"),
  organism: varchar("organism", { length: 128 }).notNull(),
  genome: varchar("genome", { length: 64 }).notNull().default("hg38"),
  pamType: varchar("pamType", { length: 16 }).notNull().default("NGG"),
  inputMode: mysqlEnum("inputMode", ["nlp", "gene", "sequence"]).notNull().default("nlp"),
  inputText: text("inputText").notNull(),
  targetGene: varchar("targetGene", { length: 64 }),
  targetSequence: text("targetSequence"),
  status: mysqlEnum("status", ["draft", "running", "complete", "error"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Pipeline stage results — stores the output of each stage in the 8-stage pipeline.
 * Stages: ai_understanding, gene_id, pam_detection, grna_generation,
 *          efficiency, offtarget, explainability, ranking, report
 */
export const pipelineStages = mysqlTable("pipelineStages", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  stageName: mysqlEnum("stageName", [
    "ai_understanding",
    "gene_id",
    "pam_detection",
    "grna_generation",
    "efficiency",
    "offtarget",
    "explainability",
    "ranking",
    "report",
  ]).notNull(),
  status: mysqlEnum("status", ["pending", "running", "complete", "error"]).default("pending").notNull(),
  stageOrder: int("stageOrder").notNull(),
  inputSummary: text("inputSummary"),
  outputSummary: text("outputSummary"),
  outputData: json("outputData"),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  error: text("error"),
});

export type PipelineStage = typeof pipelineStages.$inferSelect;
export type InsertPipelineStage = typeof pipelineStages.$inferInsert;

/**
 * gRNA candidates — the core output of the pipeline.
 * Each row represents one candidate guide RNA with its full feature vector
 * and prediction scores.
 */
export const grnaCandidates = mysqlTable("grnaCandidates", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  guideName: varchar("guideName", { length: 64 }).notNull(),
  guideSequence: varchar("guideSequence", { length: 20 }).notNull(),
  pamSequence: varchar("pamSequence", { length: 3 }).notNull().default("NGG"),
  chromosome: varchar("chromosome", { length: 8 }),
  startPosition: int("startPosition"),
  endPosition: int("endPosition"),
  strand: varchar("strand", { length: 1 }).default("+"),
  gcContent: double("gcContent").notNull(),

  /* ── Feature Vector (30 biological features) ── */
  position1A: double("position1A").default(0),
  position1G: double("position1G").default(0),
  position1T: double("position1T").default(0),
  position1C: double("position1C").default(0),
  position2A: double("position2A").default(0),
  position2G: double("position2G").default(0),
  position2T: double("position2T").default(0),
  position2C: double("position2C").default(0),
  gcContentSkew: double("gcContentSkew").default(0),
  firstNucleotideA: double("firstNucleotideA").default(0),
  firstNucleotideT: double("firstNucleotideT").default(0),
  firstNucleotideG: double("firstNucleotideG").default(0),
  firstNucleotideC: double("firstNucleotideC").default(0),
  dinucleotideAA: double("dinucleotideAA").default(0),
  dinucleotideTT: double("dinucleotideTT").default(0),
  dinucleotideGG: double("dinucleotideGG").default(0),
  dinucleotideCC: double("dinucleotideCC").default(0),
  dinucleotideAT: double("dinucleotideAT").default(0),
  dinucleotideGC: double("dinucleotideGC").default(0),
  trimerGC: double("trimerGC").default(0),
  trimerAA: double("trimerAA").default(0),
  trimerGG: double("trimerGG").default(0),
  trimerTT: double("trimerTT").default(0),
  selfComplementarity: double("selfComplementarity").default(0),
  tm: double("tm").default(0),
  homopolymerRunMax: int("homopolymerRunMax").default(0),
  pamDistance: int("pamDistance").default(0),

  /* ── Prediction Scores ── */
  xgboostScore: double("xgboostScore").default(0),
  lightgbmScore: double("lightgbmScore").default(0),
  randomForestScore: double("randomForestScore").default(0),
  ensembleScore: double("ensembleScore").default(0),
  finalRank: int("finalRank").default(0),
  confidence: mysqlEnum("confidence", ["high", "medium", "low"]).default("medium"),

  /* ── Off-target Metrics ── */
  totalOfftargetSites: int("totalOfftargetSites").default(0),
  offTargetRisk: mysqlEnum("offTargetRisk", ["low", "medium", "high"]).default("low"),
  seedMismatchCount: int("seedMismatchCount").default(0),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GrnaCandidate = typeof grnaCandidates.$inferSelect;
export type InsertGrnaCandidate = typeof grnaCandidates.$inferInsert;

/**
 * Off-target analysis results — detailed off-target site information
 * for each gRNA candidate.
 */
export const offTargetSites = mysqlTable("offTargetSites", {
  id: int("id").autoincrement().primaryKey(),
  candidateId: int("candidateId").notNull(),
  projectId: int("projectId").notNull(),
  chromosome: varchar("chromosome", { length: 8 }).notNull(),
  position: int("position").notNull(),
  strand: varchar("strand", { length: 1 }).default("+"),
  mismatchCount: int("mismatchCount").notNull(),
  mismatchPositions: json("mismatchPositions"),
  pamSequence: varchar("pamSequence", { length: 3 }),
  cleavageProbability: double("cleavageProbability").default(0),
  severity: mysqlEnum("severity", ["safe", "caution", "risk", "critical"]).default("safe"),
  genomicContext: varchar("genomicContext", { length: 128 }),
  isInCodingRegion: int("isInCodingRegion").default(0),
});

export type OffTargetSite = typeof offTargetSites.$inferSelect;
export type InsertOffTargetSite = typeof offTargetSites.$inferInsert;

/**
 * SHAP explainability results — stores feature importance data
 * for each gRNA candidate.
 */
export const shapResults = mysqlTable("shapResults", {
  id: int("id").autoincrement().primaryKey(),
  candidateId: int("candidateId").notNull(),
  projectId: int("projectId").notNull(),
  featureName: varchar("featureName", { length: 64 }).notNull(),
  shapValue: double("shapValue").notNull(),
  featureValue: double("featureValue").default(0),
  contribution: double("contribution").default(0),
  direction: mysqlEnum("direction", ["positive", "negative"]).default("positive"),
});

export type ShapResult = typeof shapResults.$inferSelect;
export type InsertShapResult = typeof shapResults.$inferInsert;

/**
 * Analysis reports — final compiled research reports for each project.
 */
export const reports = mysqlTable("reports", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  reportTitle: varchar("reportTitle", { length: 256 }).notNull(),
  executiveSummary: text("executiveSummary"),
  methodology: text("methodology"),
  results: json("results"),
  topCandidates: json("topCandidates"),
  recommendations: text("recommendations"),
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
});

export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;
