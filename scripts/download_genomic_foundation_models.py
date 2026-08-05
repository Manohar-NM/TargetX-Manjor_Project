"""
TargetX — Genomic Foundation Model Downloader & HuggingFace Connector
Downloads pretrained weights for DNABERT-2 and Nucleotide Transformer from Hugging Face Hub.
"""

import os
import sys

def download_foundation_models():
    print("[TargetX Foundation] Checking Hugging Face transformers integration...")
    try:
        from transformers import AutoTokenizer, AutoModelForMaskedLM
        print("[TargetX Foundation] Downloading DNABERT-2 (zhihan1996/DNABERT-2-117M)...")
        tokenizer = AutoTokenizer.from_pretrained("zhihan1996/DNABERT-2-117M", trust_remote_code=True)
        model = AutoModelForMaskedLM.from_pretrained("zhihan1996/DNABERT-2-117M", trust_remote_code=True)
        print("[TargetX Foundation] Successfully downloaded DNABERT-2 pretrained weights!")
    except Exception as e:
        print(f"[TargetX Foundation] Note: To download DNABERT-2 / Nucleotide-Transformer weights directly, install `transformers` via `pip install transformers`.")
        print(f"Details: {e}")

if __name__ == "__main__":
    download_foundation_models()
