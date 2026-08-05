# TargetX — Required Datasets & Machine Learning Models

This document details all **machine learning models**, **predictive algorithms**, and **biological datasets** required to train, evaluate, and run the TargetX AI-driven CRISPR design platform.

---

## 1. Machine Learning & Predictive Models

TargetX utilizes a hybrid AI pipeline combining NLP query understanding, multi-model ensemble sequence efficiency scoring, off-target cleavage modeling, and explainable AI (XAI).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            1. NLP Intent Model                              │
│         Parses natural language prompts into target gene, exon, organism     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                    2. Multi-Model On-Target ML Ensemble                     │
│   ┌────────────────────┬─────────────────────┬──────────────────────────┐   │
│   │ XGBoost Regressor  │ LightGBM Regressor  │ Random Forest Regressor  │   │
│   └─────────┬──────────┴──────────┬──────────┴────────────┬─────────────┘   │
│             └─────────────────────┼───────────────────────┘                 │
│                                   ▼                                         │
│                      Weighted Ensemble Score ($S_{on}$)                     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                    3. Off-Target Cleavage Models                            │
│     - CFD Score Model (Matrix-based mismatch penalties)                     │
│     - MIT Score Model (Distance-weighted position penalties)                 │
│     - CRISPRoff / Elevation (Machine Learning Off-Target Score)             │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                   4. Explainable AI (SHAP Diagnostics)                      │
│     - SHAP TreeExplainer for feature attribution breakdown (Positional, Tm) │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.1 Model Details & Architecture

| Model Category | Specific Model / Algorithm | Purpose & Input Features | Output Target |
| :--- | :--- | :--- | :--- |
| **NLP Target Parser** | BioBERT / PubMedBERT or Gemini 3.6 / GPT-4o API | **Input**: Natural language prompt (e.g. *"Knockout human TP53 exon 4"*) | **Output**: Structured JSON `{ gene: "TP53", exon: 4, organism: "hg38", action: "knockout" }` |
| **On-Target Efficiency** | **XGBoost Regressor** | **Input**: 30-dim feature vector (Positional nucleotides 1-20, GC skew, $T_m$, dinucleotide runs, self-complementarity) | On-target efficiency probability ($0.0 - 1.0$) |
| **On-Target Efficiency** | **LightGBM Regressor** | **Input**: Same 30-dim biological feature vector; optimized for leaf-wise fast inference | On-target efficiency probability ($0.0 - 1.0$) |
| **On-Target Efficiency** | **Random Forest Regressor**| **Input**: 30-dim feature vector; acts as bagged tree baseline to stabilize variance | On-target efficiency probability ($0.0 - 1.0$) |
| **On-Target Ensemble** | **Weighted Average Ensemble** | **Formula**: $S_{ensemble} = \frac{\text{XGBoost} + \text{LightGBM} + \text{RandomForest}}{3}$ | Composite confidence score ($0.0 - 1.0$) |
| **Off-Target Scoring** | **CFD (Cutting Frequency Determination)** | **Input**: 20nt protospacer + PAM mismatch position matrix | Off-target cleavage probability per site |
| **Off-Target Scoring** | **MIT Off-Target Algorithm** | **Input**: Mismatch counts and pairwise distances between mismatches | Aggregate locus safety score ($0 - 100$) |
| **Model Explainability** | **SHAP (SHapley Additive exPlanations)** | **Input**: Trained XGBoost/LightGBM model + candidate feature vector | Feature attribution values ($\Delta$ efficiency per feature) |

---

## 2. Required Biological Datasets

To train, validate, and benchmark the TargetX prediction engines, the following public biological datasets are required:

### 2.1 On-Target Efficiency Training & Validation Datasets

| Dataset Name | Source / Publication | Size | Description & Use Case |
| :--- | :--- | :--- | :--- |
| **Doench et al. (2016) / Rule Set 2** | *Nature Biotechnology 2016* / Broad Institute | ~2,500 gRNAs | Primary gold-standard benchmark dataset of CRISPR/Cas9 knockout efficiencies across human (*FCGR2A*, *HPRT1*) and mouse genes. |
| **Wang et al. (2014) Screen** | *Science 2014* / Broad Institute | ~1,800 gRNAs | Essential gene knockout screens in HL60 and K562 human cell lines. |
| **Xu et al. (2015) Dataset** | *Genome Research 2015* | ~1,000 gRNAs | Experimental efficiency screening in mouse embryonic stem cells (mESCs). |
| **DeepCRISPR Dataset** | *Genome Biology 2018* | >18,000 gRNAs | Large-scale dataset spanning 4 human cell lines (HEK293T, HCT116, HeLa, HL60) with epigenetic profiles. |
| **Chari et al. (2015)** | *Nature Methods 2015* / Harvard | ~1,500 gRNAs | High-throughput gRNA activity data for SpCas9 and variant PAM Cas9 orthologs. |

---

### 2.2 Off-Target Cleavage & Specificity Datasets

| Dataset Name | Source / Publication | Size | Description & Use Case |
| :--- | :--- | :--- | :--- |
| **GUIDE-seq Dataset** | *Nature Biotechnology 2015* (Tsai et al.) | ~10 gRNAs (Genome-wide) | Unbiased, empirical cell-based off-target cleavage site measurements. Used to calibrate off-target mismatch weights. |
| **CHANGE-seq Dataset** | *Nature Biotechnology 2020* (Lazzarotto et al.) | >200 gRNAs (>100k sites) | High-throughput in vitro genome-wide off-target cleavage dataset for SpCas9. |
| **CIRCLE-seq Dataset** | *Nature Methods 2017* (Tsai et al.) | ~20 gRNAs | Sensitive in vitro off-target detection dataset across human cell lines. |
| **CRISPRoff / Elevation Benchmark** | *Nature Biomedical Engineering* | Synthetic Mismatch Sets | Mismatch datasets (0 to 4 mismatches) used to train ML-based off-target cleavage probability estimators. |

---

### 2.3 Reference Genome & Annotation Datasets

| Dataset Name | Source | Format | Purpose |
| :--- | :--- | :--- | :--- |
| **GRCh38 / hg38 Human Genome** | UCSC / NCBI / Ensembl | FASTA (`.fa`) | Primary human reference genome assembly for PAM searching and coordinate mapping. |
| **GRCm39 / mm10 Mouse Genome** | UCSC / Ensembl | FASTA (`.fa`) | Primary mouse reference genome for murine gene targets. |
| **GENCODE Human Annotations** | GENCODE (v44) | GTF / GFF3 | Exon boundaries, transcripts, CDS (coding regions), UTRs, and gene symbols. |
| **NCBI Entrez / RefSeq Database** | NCBI | TSV / JSON | Gene symbol resolution, alias mapping (e.g. `p53` -> `TP53`), and transcript mapping. |

---

### 2.4 Epigenomic & Chromatin Datasets (Optional Advanced Features)

| Dataset Name | Source | Format | Purpose |
| :--- | :--- | :--- | :--- |
| **ENCODE DNase-seq / ATAC-seq** | ENCODE Consortium | BigWig / BED | Chromatin accessibility data used to weight off-target risk based on open vs. closed heterochromatin. |

---

## 3. Summary Matrix

```
TargetX Machine Learning Engine
├── NLP Parser Model: BioBERT / PubMedBERT / LLM (Gemini/GPT-4o)
├── On-Target ML Ensemble: XGBoost + LightGBM + Random Forest
│   └── Trained on: Doench (2016), Wang (2014), Xu (2015), DeepCRISPR
├── Off-Target Score Engine: CFD Matrix + MIT Score + CRISPRoff
│   └── Validated on: GUIDE-seq, CHANGE-seq, CIRCLE-seq
├── Genomic Reference: GRCh38/hg38 + GENCODE GTF Annotations
└── Explainability Engine: SHAP TreeExplainer
```

---

*Document created for TargetX platform — Version 1.0.0*
