# TargetX Application Run & Visual Preview Walkthrough

This document provides the exact **terminal commands** to build, train, run, and preview the TargetX AI-Powered CRISPR Design & Bioinformatics Command Center.

---

## 1. Terminal Execution Commands

### A. Train & Serialize AI/ML Models
To re-run model training across PyTorch DeepHF, DeepCRISPR, DeepSpCas9, CatBoost, XGBoost, LightGBM, Random Forest, and InDelphi:

```bash
# Prepare dataset structures
python scripts/prepare_additional_pdf_datasets.py

# Train baseline GBDT ensemble
python scripts/build_models.py

# Train PyTorch DeepHF CNN+Attention & InDelphi Repair models
python scripts/train_advanced_deep_models.py

# Train all PDF-specified model-dataset pairings (CatBoost, DeepCRISPR, DeepSpCas9, CRISPR-Net, CFD, MIT)
python scripts/train_pdf_specified_models.py
```

### B. Build & Start Web Application

```bash
# Install frontend dependencies (if not already installed)
pnpm install

# Build client assets & server bundle
pnpm build

# Start production server on port 3000
pnpm start
# OR directly via node:
node dist/index.js
```

> The server will start and listen on **`http://localhost:3000`**.

---

## 2. Visual Preview & Application Screenshots

The TargetX platform is running live at `http://localhost:3000`. Below are live application screenshots verified during runtime:

### 2.1 "Genome Noir" Command Center Home Page
![TargetX Home Page](file:///C:/Users/Manohar%20NM/.gemini/antigravity-ide/brain/c8d9b5c7-c7e5-44b9-98ee-d03a04f0680e/home_page_1785935386590.png)

---

### 2.2 8-Stage Automated Pipeline Execution & Telemetry
![TargetX Pipeline Results](file:///C:/Users/Manohar%20NM/.gemini/antigravity-ide/brain/c8d9b5c7-c7e5-44b9-98ee-d03a04f0680e/pipeline_page_results_1785935438092.png)

---

### 2.3 Interactive Command Dashboard & Candidate Rankings
![TargetX Dashboard](file:///C:/Users/Manohar%20NM/.gemini/antigravity-ide/brain/c8d9b5c7-c7e5-44b9-98ee-d03a04f0680e/dashboard_page_ranking_1785935466288.png)

---

*Walkthrough generated for TargetX platform — Version 1.2.0*
