#!/usr/bin/env python3
"""
TargetX — Random Forest On-Target Efficiency Inference Runner
Phase 3 Step 3B: Controlled ML Inference Adapter

Loads `models/random_forest_efficiency_v1.joblib` and computes on-target
cleavage efficiency predictions (Azimuth 2.0 surrogate) on valid 30-mers.

Input: JSON via stdin:
[
  { "id": "gRNA_01", "sequence30": "AAAACTGTGAGTGTGGGACCTGCTGGGGGC" }
]

Output: JSON via stdout:
{
  "status": "success",
  "model": "random_forest_efficiency_v1.joblib",
  "predictions": [
    { "id": "gRNA_01", "randomForestScore": 0.4580757, "status": "ok" }
  ]
}
"""

import sys
import os
import json
import numpy as np

# Resolve base directories
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(os.path.dirname(SCRIPT_DIR))
MODEL_PATH = os.path.join(PROJECT_ROOT, "models", "random_forest_efficiency_v1.joblib")

CANONICAL_BASES = set("ACGT")

def calculate_gc(seq):
    seq = seq.upper()
    g = seq.count('G')
    c = seq.count('C')
    return (g + c) / len(seq) if seq else 0.0

def extract_features(sequence):
    """
    Exact reference feature encoder from scripts/build_models.py (128 features):
    - 0-119: 30 positions x 4-channel one-hot (A, C, G, T)
    - 120: Overall GC content of the 30-mer (normalized by 30)
    - 121-126: Normalized counts of 6 dinucleotides ('AA', 'TT', 'GG', 'CC', 'AT', 'GC')
               using Python non-overlapping str.count() semantics normalized by 29
    - 127: Maximum consecutive identical nucleotide run length
    """
    seq = sequence.upper()[:30].ljust(30, 'N')
    nuc_map = {'A': [1, 0, 0, 0], 'C': [0, 1, 0, 0], 'G': [0, 0, 1, 0], 'T': [0, 0, 0, 1]}
    one_hot = []
    for char in seq:
        one_hot.extend(nuc_map.get(char, [0, 0, 0, 0]))

    gc_content = calculate_gc(seq)

    dinucs = ['AA', 'TT', 'GG', 'CC', 'AT', 'GC']
    dinuc_counts = [seq.count(d) / max(1, len(seq) - 1) for d in dinucs]

    max_run = 1
    curr = 1
    for i in range(1, len(seq)):
        if seq[i] == seq[i - 1]:
            curr += 1
            max_run = max(max_run, curr)
        else:
            curr = 1

    return np.array(one_hot + [gc_content] + dinuc_counts + [max_run], dtype=np.float32)

def validate_30mer(seq):
    """Validates that sequence is strictly a 30-nt canonical DNA sequence."""
    if not isinstance(seq, str):
        return False, "sequence_not_string"
    s = seq.strip().upper()
    if len(s) != 30:
        return False, f"invalid_length_{len(s)}_expected_30"
    invalid_chars = set(s) - CANONICAL_BASES
    if invalid_chars:
        return False, f"invalid_bases_{''.join(sorted(invalid_chars))}"
    return True, s

def main():
    try:
        raw_input = sys.stdin.read()
        if not raw_input or not raw_input.strip():
            print(json.dumps({"status": "error", "message": "empty_input_payload"}))
            sys.exit(0)

        payload = json.loads(raw_input)
        if not isinstance(payload, list):
            print(json.dumps({"status": "error", "message": "payload_must_be_list"}))
            sys.exit(0)

        if not os.path.exists(MODEL_PATH):
            print(json.dumps({
                "status": "error",
                "message": f"model_artifact_not_found: {MODEL_PATH}"
            }))
            sys.exit(0)

        # Lazy load joblib to minimize overhead if input is invalid
        import joblib
        rf_model = joblib.load(MODEL_PATH)

        if getattr(rf_model, "n_features_in_", None) != 128:
            print(json.dumps({
                "status": "error",
                "message": f"unexpected_feature_dimension: {getattr(rf_model, 'n_features_in_', None)}"
            }))
            sys.exit(0)

        results = []
        valid_indices = []
        feature_list = []

        for idx, item in enumerate(payload):
            cand_id = item.get("id", f"candidate_{idx}")
            seq_raw = item.get("sequence30")

            if not seq_raw:
                results.append({
                    "id": cand_id,
                    "randomForestScore": None,
                    "status": "missing_sequence"
                })
                continue

            is_valid, validated_seq = validate_30mer(seq_raw)
            if not is_valid:
                results.append({
                    "id": cand_id,
                    "randomForestScore": None,
                    "status": validated_seq
                })
                continue

            feat = extract_features(validated_seq)
            valid_indices.append(len(results))
            feature_list.append(feat)
            results.append({
                "id": cand_id,
                "randomForestScore": None,
                "status": "pending"
            })

        # Run batch prediction if there are valid candidates
        if feature_list:
            X_batch = np.vstack(feature_list)
            preds = rf_model.predict(X_batch)

            for i, result_idx in enumerate(valid_indices):
                val = float(preds[i])
                if np.isfinite(val):
                    results[result_idx]["randomForestScore"] = round(val, 6)
                    results[result_idx]["status"] = "ok"
                else:
                    results[result_idx]["randomForestScore"] = None
                    results[result_idx]["status"] = "non_finite_output"

        output = {
            "status": "success",
            "model": "random_forest_efficiency_v1.joblib",
            "predictions": results
        }
        print(json.dumps(output))

    except Exception as e:
        print(json.dumps({
            "status": "error",
            "message": f"inference_exception: {str(e)}"
        }))
        sys.exit(1)

if __name__ == "__main__":
    main()
