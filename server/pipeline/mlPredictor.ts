/**
 * TargetX ML Predictor Node.js Adapter
 * Phase 3 Step 3B: Asynchronous Subprocess Bridge for Random Forest Inference
 *
 * Bridges the Node.js/Express pipeline to `server/ml/predict_rf.py` via asynchronous
 * non-blocking child_process.spawn.
 */

import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Project root is 2 levels up from server/pipeline
const PROJECT_ROOT = path.resolve(__dirname, "..", "..");
const PYTHON_RUNNER_PATH = path.resolve(PROJECT_ROOT, "server", "ml", "predict_rf.py");

export interface Candidate30merInput {
  id: string;
  sequence30: string;
}

export interface MlPredictionItem {
  id: string;
  randomForestScore: number | null;
  status: string;
}

export interface MlPredictionBatchResult {
  success: boolean;
  model: string;
  scores: Map<string, number | null>;
  details: MlPredictionItem[];
  error?: string;
  inferenceTimeMs: number;
}

/**
 * Executes asynchronous batch inference for gRNA 30-mers using the Random Forest model.
 *
 * - Non-blocking: Uses child_process.spawn and promises
 * - Enforces timeout: Terminates subprocess if execution exceeds timeoutMs
 * - Graceful degradation: Returns null scores with error status if Python is unavailable
 *   or fails, ensuring the primary pipeline and heuristic scores never crash.
 */
export async function predictRandomForestScores(
  inputs: Candidate30merInput[],
  options: { timeoutMs?: number; pythonPath?: string } = {}
): Promise<MlPredictionBatchResult> {
  const startTime = Date.now();
  const timeoutMs = options.timeoutMs ?? 10000;
  const pythonBin = options.pythonPath || process.env.PYTHON_PATH || "python";

  if (!inputs || inputs.length === 0) {
    return {
      success: true,
      model: "random_forest_efficiency_v1.joblib",
      scores: new Map(),
      details: [],
      inferenceTimeMs: 0,
    };
  }

  return new Promise((resolve) => {
    let stdoutBuffer = "";
    let stderrBuffer = "";
    let isSettled = false;

    const child = spawn(pythonBin, [PYTHON_RUNNER_PATH], {
      cwd: PROJECT_ROOT,
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, PYTHONUNBUFFERED: "1" },
    });

    const timer = setTimeout(() => {
      if (!isSettled) {
        isSettled = true;
        child.kill();
        const duration = Date.now() - startTime;
        console.warn(`[ML Predictor] Python subprocess timed out after ${timeoutMs}ms`);
        const fallbackMap = new Map<string, number | null>();
        const fallbackDetails: MlPredictionItem[] = inputs.map((item) => {
          fallbackMap.set(item.id, null);
          return { id: item.id, randomForestScore: null, status: "timeout" };
        });

        resolve({
          success: false,
          model: "random_forest_efficiency_v1.joblib",
          scores: fallbackMap,
          details: fallbackDetails,
          error: `Execution timed out after ${timeoutMs}ms`,
          inferenceTimeMs: duration,
        });
      }
    }, timeoutMs);

    child.stdout.on("data", (chunk: Buffer) => {
      stdoutBuffer += chunk.toString("utf8");
    });

    child.stderr.on("data", (chunk: Buffer) => {
      stderrBuffer += chunk.toString("utf8");
    });

    child.on("error", (err: Error) => {
      if (!isSettled) {
        isSettled = true;
        clearTimeout(timer);
        const duration = Date.now() - startTime;
        console.warn(`[ML Predictor] Failed to spawn Python process (${pythonBin}):`, err.message);

        const fallbackMap = new Map<string, number | null>();
        const fallbackDetails: MlPredictionItem[] = inputs.map((item) => {
          fallbackMap.set(item.id, null);
          return { id: item.id, randomForestScore: null, status: "spawn_error" };
        });

        resolve({
          success: false,
          model: "random_forest_efficiency_v1.joblib",
          scores: fallbackMap,
          details: fallbackDetails,
          error: `Spawn error: ${err.message}`,
          inferenceTimeMs: duration,
        });
      }
    });

    child.on("close", (code: number | null) => {
      if (!isSettled) {
        isSettled = true;
        clearTimeout(timer);
        const duration = Date.now() - startTime;

        if (code !== 0) {
          console.warn(`[ML Predictor] Python process exited with code ${code}. Stderr: ${stderrBuffer.trim()}`);
          const fallbackMap = new Map<string, number | null>();
          const fallbackDetails: MlPredictionItem[] = inputs.map((item) => {
            fallbackMap.set(item.id, null);
            return { id: item.id, randomForestScore: null, status: `exit_code_${code}` };
          });

          resolve({
            success: false,
            model: "random_forest_efficiency_v1.joblib",
            scores: fallbackMap,
            details: fallbackDetails,
            error: stderrBuffer.trim() || `Process exited with code ${code}`,
            inferenceTimeMs: duration,
          });
          return;
        }

        try {
          const parsed = JSON.parse(stdoutBuffer);
          if (parsed.status !== "success" || !Array.isArray(parsed.predictions)) {
            throw new Error(parsed.message || "Invalid output structure from Python runner");
          }

          const scoreMap = new Map<string, number | null>();
          const details: MlPredictionItem[] = [];

          for (const item of parsed.predictions) {
            scoreMap.set(item.id, item.randomForestScore ?? null);
            details.push({
              id: item.id,
              randomForestScore: item.randomForestScore ?? null,
              status: item.status || "ok",
            });
          }

          resolve({
            success: true,
            model: parsed.model || "random_forest_efficiency_v1.joblib",
            scores: scoreMap,
            details,
            inferenceTimeMs: duration,
          });
        } catch (parseErr) {
          console.warn("[ML Predictor] Failed to parse Python stdout JSON:", parseErr, stdoutBuffer);
          const fallbackMap = new Map<string, number | null>();
          const fallbackDetails: MlPredictionItem[] = inputs.map((item) => {
            fallbackMap.set(item.id, null);
            return { id: item.id, randomForestScore: null, status: "json_parse_error" };
          });

          resolve({
            success: false,
            model: "random_forest_efficiency_v1.joblib",
            scores: fallbackMap,
            details: fallbackDetails,
            error: (parseErr as Error).message,
            inferenceTimeMs: duration,
          });
        }
      }
    });

    // Write input payload to stdin and close stream
    try {
      child.stdin.write(JSON.stringify(inputs));
      child.stdin.end();
    } catch (writeErr) {
      if (!isSettled) {
        isSettled = true;
        clearTimeout(timer);
        resolve({
          success: false,
          model: "random_forest_efficiency_v1.joblib",
          scores: new Map(),
          details: [],
          error: (writeErr as Error).message,
          inferenceTimeMs: Date.now() - startTime,
        });
      }
    }
  });
}
