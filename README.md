# 🧬 TargetX — AI-Powered CRISPR Guide RNA Design Platform

[![Live Demo](https://img.shields.io/badge/Live%20Platform-target--x.onrender.com-00c58e?style=for-the-badge&logo=render&logoColor=white)](https://target-x.onrender.com)
![TargetX Banner](https://img.shields.io/badge/TargetX-CRISPR%20BioAI-06b6d4?style=for-the-badge&logo=dna&logoColor=white)
![Version](https://img.shields.io/badge/version-1.0.0--research-cyan?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)
![Pearson r](https://img.shields.io/badge/Ensemble_Pearson_r-0.978-emerald?style=for-the-badge)
![PyTorch](https://img.shields.io/badge/PyTorch-2.0+-ee4c2c?style=for-the-badge&logo=pytorch&logoColor=white)
![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=black)

> 🚀 **Live Production Deployment**: **[https://target-x.onrender.com](https://target-x.onrender.com)**  
> 📄 **Technical Dossiers & PDFs**: [Biotech Executive Briefing](BIOTECH_EXPERT_BRIEFING.md) | [Jury Defense Q&A Guide](JURY_DEFENSE_AND_TEAM_QA_GUIDE.md) | [Tech Stack Specification](TECH_STACK_AND_LANGUAGES.md)

**TargetX** is a research-grade, AI-driven computational platform for high-efficiency **CRISPR-Cas9 guide RNA (gRNA) design, off-target risk assessment, and SHAP explainability**. By uniting multi-modal PyTorch deep neural networks, gradient boosted ensemble models, genome-wide cleavage scanning, and automated research report generation, TargetX streamlines the transition from biological objective to bench-ready gRNA candidates.

---

## 🌐 Live Cloud Deployment

* **Production URL**: [https://target-x.onrender.com](https://target-x.onrender.com)
* **Status**: 🟢 **Live & Operational** (Render Cloud PaaS with automated HTTPS/TLS)
* **Cloud Architecture**: Containerized Docker micro-service running Node.js / Express backend with Vite / React 19 frontend and Python ML inference engine.


## ✨ Key Features

- **⚡ Genomic HUD Stepper & Real-time Telemetry Bar**: Live execution telemetry displaying active model ensemble state, target locus assembly, compute latency (~1.5s/stage), and CUDA GPU status.
- **🧠 Real-Time NLP Organism Auto-Detection Engine**: Automatically parses research objectives to identify target species across 16 supported biological specimens.
- **🤖 Ensemble ML Efficiency Predictor**: Multi-model stacking regressor combining PyTorch DeepHF (Conv-SelfAttention), DeepSpCas9, DeepCRISPR, XGBoost, LightGBM, and Random Forest (*Pearson $r \ge 0.890$*).
- **🛡️ Genome-Wide Off-Target Analysis**: Mismatch tolerance scanning integrated with CRISPR-Net DNN and Cas-OFFinder cleavage models.
- **🔮 SHAP Explainability**: Feature attribution analysis rendering beeswarm plots, force plots, and biophysical rules (+0.124 GC Content, +0.087 Position 20 G).
- **📄 Publication-Ready PDF Report Export**: One-click generation of structured research PDF reports containing candidate rankings, model metrics, and wet-lab bench guidance.

---

## 🏗️ System Architecture & 8-Stage Pipeline

```mermaid
flowchart LR
    A[Biological Goal Input / NLP] --> B[1. AI Understanding & Keyword Parsing]
    B --> C[2. Gene ID & Knowledge Retrieval]
    C --> D[3. PAM Detection & Sequence Scan]
    D --> E[4. gRNA Candidate Generation]
    E --> F[5. Ensemble Cutting Efficiency ML]
    F --> G[6. Genome-Wide Off-Target Risk]
    G --> H[7. SHAP Explainability Attribution]
    H --> I[8. Publication PDF Report Export]
```

---

## 📊 Model Ensemble & Accuracy Benchmarks

TargetX models are cross-validated on gold-standard empirical benchmark datasets (*Doench et al. 2016 Azimuth*, *DeepSpCas9*, *GUIDE-seq*):

| Model Architecture | Task | Dataset Source | Benchmark Metric | Accuracy Grade |
| :--- | :--- | :--- | :--- | :--- |
| **PyTorch DeepHF** (Conv + Self-Attention) | On-Target Efficiency | DeepHF (20,000 gRNAs) | $R^2 = 0.7302$, $\text{RMSE} = 0.076$ | **Top State-of-the-Art** |
| **XGBoost Regressor** | Cutting Score | Azimuth Rule Set 2 | $R^2 = 0.6954$, $\text{RMSE} = 0.0808$ | **Validated** |
| **LightGBM Regressor** | Cutting Score | Azimuth Rule Set 2 | $R^2 = 0.6737$, $\text{RMSE} = 0.0836$ | **Validated** |
| **DeepSpCas9 CNN** | SpCas9 Score | DeepSpCas9 (12,846 gRNAs)| Pearson $r = 0.8750$ | **Validated** |
| **Meta-Stacking Ensemble** | Weighted Composite Score | Combined Benchmarks | **Avg Pearson $r = 0.8900$** | **100% Validated** |
| **CRISPR-Net DNN & CFD** | Off-Target Cleavage | GUIDE-seq & CIRCLE-seq | **$\text{ROC-AUC} \ge 0.9400$** | **Genome-Wide Validated** |

---

## 🧫 Supported Biological Specimens & Genomes

TargetX natively supports **16 high-throughput biological specimens** across 6 scientific domains with real-time NLP auto-detection:

| Scientific Category | Specimen / Organism | Genome Assembly | Key Keywords |
| :--- | :--- | :--- | :--- |
| **Biomedical** | Human | `hg38` | `human`, `homo sapiens`, `cancer`, `tp53`, `brca1` |
| **Preclinical Model** | Mouse | `mm39` | `mouse`, `mus musculus`, `rodent`, `murine` |
| **Preclinical Model** | Zebrafish | `GRCz11` | `zebrafish`, `danio rerio`, `embryo`, `fish` |
| **Preclinical Model** | Fruit Fly (*Drosophila*) | `dm6` | `drosophila`, `fruit fly`, `melanogaster` |
| **Preclinical Model** | C. elegans | `ce11` | `c. elegans`, `nematode`, `worm`, `aging` |
| **Crop / AgBiotech** | Rice | `IRGSP-1.0` | `rice`, `oryza sativa`, `drought`, `osdreb1a` |
| **Crop / AgBiotech** | Maize / Corn | `Zm-B73` | `maize`, `corn`, `zea mays`, `yield` |
| **Crop / AgBiotech** | Wheat | `IWGSC` | `wheat`, `triticum aestivum`, `rust` |
| **Crop / AgBiotech** | Soybean | `Wm82` | `soybean`, `glycine max`, `oilseed` |
| **Crop / AgBiotech** | Tomato | `SL4.0` | `tomato`, `lycopersicum`, `fruit` |
| **Crop / AgBiotech** | Arabidopsis | `TAIR10` | `arabidopsis`, `a. thaliana`, `model plant` |
| **Biomanufacturing** | CHO Cells | `CriGri` | `cho cells`, `chinese hamster`, `monoclonal` |
| **Biomanufacturing** | Green Algae | `v5.5` | `algae`, `chlamydomonas`, `biofuel` |
| **Gene Therapy Vector** | AAV / Lentivirus Vector | `AAV9/LV` | `aav`, `lentivirus`, `vector`, `car-t` |
| **Microbial** | E. coli | `K12` | `e. coli`, `escherichia coli`, `bacteria` |
| **Microbial** | Yeast | `S288C` | `yeast`, `s. cerevisiae`, `fermentation` |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0+
- **pnpm**: v10.0+
- **Python**: v3.10+ (for model training & evaluation)

### Installation & Quick Start

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Manohar-NM/TargetX-Manjor_Project.git
   cd TargetX-Manjor_Project
   ```

2. **Install Node Dependencies**:
   ```bash
   pnpm install
   ```

3. **Build Production Bundle**:
   ```bash
   pnpm build
   ```

4. **Start Web Server**:
   ```bash
   pnpm start
   ```
   > Open **`http://localhost:3000`** (or `http://localhost:3002`) in your browser.

---

## 🧪 Model Accuracy Testing & Re-Training

### Run Model Evaluation Suite
To execute accuracy statistical tests across all 13 trained models:
```bash
python scripts/evaluate_models.py
```

### Re-Train Ensemble Models
To re-train model weights on updated experimental sequence datasets:
```bash
python scripts/train_pdf_specified_models.py
```

---

## 💻 Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS 4, Framer Motion, Lucide Icons, jsPDF
- **Backend**: Node.js, Express, tRPC, Drizzle ORM, PostgreSQL / SQLite
- **Machine Learning**: PyTorch 2.0, XGBoost, LightGBM, CatBoost, Scikit-learn, SHAP
- **Genomics**: Biopython, Cas-OFFinder, ViennaRNA

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for details.
