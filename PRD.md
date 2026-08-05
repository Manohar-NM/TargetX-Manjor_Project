# Product Requirements Document (PRD): TargetX

**Project Name**: TargetX — AI-Powered CRISPR Design & Bioinformatics Command Center  
**Document Status**: Final / Active Specification (Updated with PDF Dataset & Model Pairings)  
**Version**: 1.2.0  
**Target Audience**: Molecular Biologists, Genetic Engineers, Bioinformaticians, Clinical Researchers, and Biotech Engineering Teams  

---

## 1. Executive Summary & Vision

**TargetX** is a research-grade, AI-driven CRISPR genome engineering and bioinformatics platform designed to transform complex guide RNA (gRNA) candidate selection into an intuitive, automated, and explainable workflow. 

By unifying natural language genomic intent parsing, target sequence retrieval, 128-dimensional biological feature engineering, multi-model Machine Learning ensembles (DeepHF PyTorch CNN+Attention, DeepCRISPR Autoencoder, DeepSpCas9 CNN, CatBoost, XGBoost, LightGBM, Random Forest, Stacking Meta-Learner), thermodynamic free-energy ($\Delta G$) folding engines, inDelphi microhomology DNA repair predictors, off-target cleavage profiling (CRISPR-Net, CFD Matrix, MIT Score), and SHAP-based Explainable AI (XAI) diagnostics, TargetX reduces gRNA design cycles from days to minutes with empirical precision.

### 1.1 Core Vision
- **Accelerate Gene Editing**: Enable researchers to input high-level biological targets or raw sequences and obtain lab-ready gRNA candidate rankings backed by empirical confidence scores.
- **Demystify Black-Box Predictions**: Provide transparent SHAP feature attributions so bioinformaticians understand *why* a specific guide RNA is scored highly.
- **Command Center User Experience**: Deliver a dark-mode "Genome Noir" bio-command center interface optimized for long research sessions and dense data visualization.

---

## 2. Problem Statement & Target Audience

### 2.1 Problem Statement
1. **Low On-Target Efficiency & High Off-Target Risk**: Traditional CRISPR design tools rely on simplistic rule-based scoring (e.g., GC content thresholds) or single-model heuristics, leading to high failure rates in bench validation.
2. **Lack of Model Explainability**: Modern deep learning models offer higher accuracy but lack interpretability, leaving researchers uncertain about feature contributions (e.g., seed position dinucleotides, Tm, self-complementarity).
3. **Fragmented Workflows**: Researchers currently switch between multiple single-purpose web utilities for PAM searching, efficiency prediction, BLAST/off-target alignment, and report generation.
4. **Poor UI/UX in Scientific Software**: Existing tools suffer from clunky, uninspired interfaces that hinder productivity and rapid data comparison.

### 2.2 Target Personas
- **Dr. Elena Vance (Lead Geneticist)**: Needs fast, reliable gRNA candidates for human cell line gene knockouts; requires downloadable executive summary reports for lab protocols.
- **Marcus Chen (Bioinformatics Engineer)**: Requires full access to feature vector breakdowns, ensemble sub-scores (DeepHF, DeepCRISPR, CatBoost, XGBoost vs. LightGBM vs. Random Forest), and off-target mismatch matrices.
- **Prof. Sarah Jenkins (Principal Investigator)**: Evaluates overall project progress, budget allocations, and experiment risk profiles via executive dashboards.

---

## 3. System Architecture & Tech Stack

TargetX follows a modern full-stack TypeScript & Python AI engine architecture with end-to-end type safety.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TargetX Frontend (React 19)                     │
│  - Navigation Shell & Genome Noir Theme System (#0a0e1a + Neon Cyan)  │
│  - Pipeline Visualizer & Interactive 12-Column Modular Grid Dashboards │
│  - TanStack Query v5 + wouter Routing + Lucide Icons + Recharts        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ tRPC v11 RPC (Type-Safe API)
┌───────────────────────────────────▼────────────────────────────────────┐
│                        TargetX Backend (Node.js/Express)               │
│  - tRPC App Router (Projects, Pipeline, Candidates, Off-Target, SHAP) │
│  - Multi-Model ML Ensemble Engine (DeepHF, DeepCRISPR, CatBoost, Meta)│
│  - Off-Target Predictors (CRISPR-Net, CFD, MIT Score)                 │
│  - Thermodynamic MFE Engine + inDelphi Repair Predictor               │
│  - Report Generator & Session Authentication                          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Drizzle ORM
┌───────────────────────────────────▼────────────────────────────────────┐
│                        Database Layer (MySQL/MariaDB)                  │
│  - Schema: users, projects, pipelineStages, grnaCandidates,            │
│            offTargetSites, shapResults, reports                       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Key Product Features & Functional Requirements

### 4.1 8-Stage Automated CRISPR Pipeline
```
[1. AI Intent] -> [2. Gene ID] -> [3. PAM Search] -> [4. gRNA Gen] -> [5. ML Ensemble] -> [6. Off-Target] -> [7. SHAP XAI] -> [8. Ranking & Report]
```

### 4.2 Active AI/ML Models Suite & Dataset Pairings (`models/`)

The platform integrates **12 active machine learning models, biophysics engines, and meta-learners** explicitly paired with their respective datasets per the PDF specification:

| Model Name | Architecture / Framework | Dataset Paired (PDF Spec) | Status / Metric | Serialized File |
| :--- | :--- | :--- | :--- | :--- |
| **DeepCRISPR (Autoencoder+CNN)** | PyTorch Autoencoder + Predictor | **DeepCRISPR Benchmark Dataset** | ✅ **Trained & Ready** | `deepcrispr_autoencoder_v1.pt` |
| **DeepSpCas9 CNN** | PyTorch 1D Convolutional Net | **DeepSpCas9 Benchmark Dataset** | ✅ **Trained & Ready** | `deepspcas9_cnn_v1.pt` |
| **CRISPR-Net (DNN)** | Deep Neural Network Off-Target | **GUIDE-seq + CHANGE-seq + CIRCLE-seq** | ✅ **Trained & Ready** | `crispr_net_dnn_v1.pt` |
| **CFD Score Predictor** | Cutting Frequency Determination | **GUIDE-seq (Tsai 2015)** | ✅ **Calibrated & Ready**| `cfd_mit_offtarget_v1.json` |
| **MIT Off-Target Score** | Position-Weighted Mismatch Penalty | **GUIDE-seq (Tsai 2015)** | ✅ **Calibrated & Ready**| `cfd_mit_offtarget_v1.json` |
| **CatBoost Regressor** | CatBoost Gradient Boosting | **Azimuth + CRISPRon Datasets** | ✅ **Trained & Ready** | `catboost_efficiency_v1.joblib` |
| **Ensemble Meta Model** | Stacking Ridge Regressor | **RF + XGBoost + LightGBM + DeepHF + DeepCRISPR** | ✅ **Trained & Ready** | `ensemble_meta_model_v1.joblib` |
| **DeepHF Conv-Attention** | 1D CNN + Self-Attention (PyTorch) | Doench et al. (2016) Azimuth | ✅ **$R^2 = 0.7302$** | `deephf_cnn_attention_v1.pt` |
| **XGBoost / GBR Regressor** | Gradient Boosted Trees | Doench et al. (2016) Azimuth | ✅ **$R^2 = 0.6954$** | `xgboost_efficiency_v1.joblib` |
| **LightGBM Regressor** | Leaf-Wise Gradient Boosting | Doench et al. (2016) Azimuth | ✅ **$R^2 = 0.6737$** | `lightgbm_efficiency_v1.joblib` |
| **Random Forest Regressor** | Bagged Decision Trees | Doench et al. (2016) Azimuth | ✅ **$R^2 = 0.6448$** | `random_forest_efficiency_v1.joblib` |
| **inDelphi Repair Predictor** | ExtraTrees Microhomology Model | Local repeat cut-site features | ✅ **Frameshift %** | `indelphi_repair_v1.joblib` |
| **SantaLucia Thermodynamics**| Nearest-Neighbor Free Energy ($\Delta G^\circ$) | SantaLucia (1998) parameters | ✅ **Hairpin MFE** | `thermo_mfe_v1.json` |

---

### 4.3 Biological Datasets & Annotation Knowledge Bases (`datasets/`)

The repository incorporates **all datasets specified in the PDF** without duplicating existing files:

1. **Efficiency Datasets**:
   - **DeepCRISPR Benchmark Dataset** (`datasets/crispr_efficiency/deepcrispr/deepcrispr_benchmark.csv`)
   - **DeepSpCas9 Dataset** (`datasets/crispr_efficiency/deepspcas9/deepspcas9_dataset.csv`)
   - **Azimuth Rule Set 1 & 2** (`datasets/crispr_efficiency/azimuth/`)
   - **CRISPRon (Luo2020/Kim2019)** (`datasets/crispr_efficiency/crispron/`)
2. **Off-Target Datasets**:
   - **CHANGE-seq Dataset** (`datasets/offtarget/change_seq/change_seq_offtarget.csv`)
   - **GUIDE-seq Dataset** (`datasets/offtarget/guide_seq/`)
   - **CIRCLE-seq + CRISPRoff Dataset** (`datasets/offtarget/circle_seq/`)
3. **Annotation Knowledge Bases** (`datasets/annotations/`):
   - **Gene Ontology (GO)** (`gene_ontology.json`)
   - **UniProt Knowledge** (`uniprot_spcas9.json`)
   - **KEGG Biological Pathways** (`kegg_pathways.json`)
   - **dbSNP & ClinVar Genetic Variants** (`dbsnp_clinvar_variants.json`)
4. **Reference Genomes**:
   - **Homo sapiens** (`GRCh38.113` GTF, GFF3, CDS FASTA)
   - **Mus musculus** (`GRCm39.113` GTF, GFF3, CDS FASTA)
   - *Arabidopsis thaliana*, *Oryza sativa*, *Zea mays* reference files.

---

## 5. Database Schema & Data Models

TargetX uses MySQL with Drizzle ORM. The relational schema supports complete session persistence:

```
┌──────────┐ 1      * ┌──────────┐ 1      * ┌─────────────────┐
│  users   ├─────────►│ projects ├─────────►│ pipelineStages  │
└──────────┘          └────┬─────┘          └─────────────────┘
                           │ 1
                           │
                           │ *
                      ┌────┴──────────┐
                      │grnaCandidates │
                      └────┬──────┬───┘
                         1 │      │ 1
                         * │      │ *
         ┌─────────────────┴─┐  ┌─┴─────────────┐
         │  offTargetSites   │  │  shapResults  │
         └───────────────────┘  └───────────────┘
```

---

## 6. Roadmap & Completion Matrix

### Phase 1: MVP & Core Pipeline (Completed)
- [x] "Genome Noir" dark command center UI shell
- [x] PyTorch DeepHF CNN+Attention model ($R^2 = 0.7302$)
- [x] XGBoost, LightGBM, Random Forest ML Ensemble models
- [x] inDelphi microhomology DNA repair predictor & SantaLucia MFE engine

### Phase 2: PDF Additional Models & Dataset Pairings (Completed)
- [x] **DeepCRISPR (PyTorch CNN + Autoencoder)** trained on **DeepCRISPR Dataset**
- [x] **DeepSpCas9 (PyTorch CNN)** trained on **DeepSpCas9 Dataset**
- [x] **CRISPR-Net (DNN)** trained on **GUIDE-seq + CHANGE-seq + CIRCLE-seq**
- [x] **CFD Score Predictor** & **MIT Off-target Score** calibrated on **GUIDE-seq**
- [x] **CatBoost Regressor** trained on **Azimuth + CRISPRon**
- [x] **Ensemble Meta Model** stacking **RF + XGBoost + LightGBM + DeepHF + DeepCRISPR**
- [x] Integrated **Gene Ontology (GO)**, **UniProt**, **KEGG**, **dbSNP**, and **ClinVar** annotations

---

*End of Product Requirements Document (PRD) — TargetX v1.2.0*
