# TargetX ML — Raw Datasets

This directory contains all raw datasets used for CRISPR guide RNA efficiency and off-target prediction inside the TargetX ML pipeline.

**Do not modify files in this directory.** All preprocessing outputs go to `../processed/`, feature matrices to `../features/`, and metadata to `../metadata/`.

---

## Directory Structure

```
raw/
├── crispr_efficiency/
│   ├── azimuth/          ✅ Present — Azimuth Rule Set 1 & 2 (Doench 2016)
│   ├── crispron/         ✅ Present — CRISPRon / DeepCRISPRon (Kim 2019, Luo 2020)
│   └── crisprbench/      ❌ Missing — CRISPRBench benchmark
│
├── offtarget/
│   ├── guide_seq/        ❌ Missing — GUIDE-seq (Tsai 2015)
│   ├── change_seq/       ❌ Missing — CHANGE-seq (Lazzarotto 2020)
│   └── circle_seq/       ⚠️ Partial — CRISPRoff SITE-seq proxy present
│
└── genomes/
    ├── oryza_sativa/     ✅ Present — IRGSP-1.0 genome + GTF/GFF3/CDS
    ├── homo_sapiens/     ❌ Missing — GRCh38
    ├── arabidopsis_thaliana/ ❌ Missing — TAIR10
    ├── mus_musculus/     ❌ Missing — GRCm39
    └── zea_mays/         ❌ Missing — NAM-5.0
```

---

## Dataset Descriptions

### 1. Azimuth Rule Set 2
**Location:** `crispr_efficiency/azimuth/`
**Paper:** Doench et al., *Nature Biotechnology* 34, 184–191 (2016)
**DOI:** https://doi.org/10.1038/nbt.3437

The Azimuth dataset is the primary benchmark for SpCas9 on-target guide RNA efficiency prediction in human cell lines. It contains measured cutting efficiency scores for thousands of 30-nt guides targeting multiple human genes across two rule sets.

| File | Description |
|---|---|
| `V2_data.xlsx` | **Primary training file.** Rule Set 2 guide efficiency scores (Doench 2016). ~14,000 guides. |
| `V1_data.xlsx` | Rule Set 1 data (Wang et al. 2014 / Doench 2014 combined). |
| `V1_suppl_data.txt` | Supplementary Rule Set 1 screen data. |
| `FC_plus_RES_withPredictions.csv` | Full combined fold-change data with RS1+RS2 model predictions. |
| `1000guides.csv` | 1000-guide test set used in published Azimuth benchmarks. |

**Key columns in V2_data.xlsx:** `30mer`, `Target gene`, `Percent Peptide`, `Normalized efficacy`

---

### 2. CRISPRon — DeepCRISPRon (Kim 2019 / Luo 2020)
**Location:** `crispr_efficiency/crispron/`
**Papers:**
- Kim et al., *Nature Biotechnology* 37, 427–429 (2019) — [DOI: 10.1038/s41587-019-0037-5](https://doi.org/10.1038/s41587-019-0037-5)
- Luo et al., *Nucleic Acids Research* (2020) — [DOI: 10.1093/nar/gkaa1140](https://doi.org/10.1093/nar/gkaa1140)

CRISPRon uses a deep learning model (bidirectional LSTM) trained on 30-mer guide sequences to predict SpCas9 on-target efficiency. It combines the Kim 2019 large-scale screen with the Luo 2020 extended dataset.

| File | Description |
|---|---|
| `Luo2020_Kim2019.xlsx` | **Primary dataset.** Combined Luo2020 + Kim2019 guide efficiency scores. |
| `30mers.fa` | Test guide sequences in 30-mer FASTA format (includes 4 nt upstream + 3 nt PAM). |
| `23mers.fa` | Test guide sequences in standard 23-mer format. |
| `CRISPRparams.tsv` | Full scoring table with model-predicted efficiency values for test guides. |
| `crispron.csv` | CRISPRon predicted efficiency scores for test set. |
| `DeepCRISPRon_train.py` | Original training script (BiLSTM model, Keras/TensorFlow). |
| `DeepCRISPRon_eval.py` | Evaluation script for trained models. |

**Input format:** 30-mer sequences (4 nt 5' context + 20 nt protospacer + 3 nt PAM + 3 nt 3' context)

---

### 3. CRISPRBench
**Location:** `crispr_efficiency/crisprbench/`
**Status:** ❌ Not yet downloaded

CRISPRBench is a comparative benchmark that evaluates multiple CRISPR efficiency prediction tools (Azimuth, DeepHF, CRISPRscan, etc.) on standardised datasets.

**Download:**
```
https://github.com/RTH-tools/crisprbench/archive/refs/heads/master.zip
```
Extract into `crispr_efficiency/crisprbench/`.

---

### 4. GUIDE-seq
**Location:** `offtarget/guide_seq/`
**Status:** ❌ Not yet downloaded
**Paper:** Tsai et al., *Nature Biotechnology* 33, 187–197 (2015)
**DOI:** https://doi.org/10.1038/nbt.3117

GUIDE-seq (Genome-wide Unbiased Identification of DSBs Evaluated by Sequencing) uses double-stranded oligonucleotide incorporation at cut sites to identify genome-wide off-target cleavage sites.

**Download:**
```
https://github.com/tsailabSJ/guideseq/archive/refs/heads/master.zip
```
Validated off-target tables are in `guideseq/test/` and the supplementary tables of the paper.

---

### 5. CHANGE-seq
**Location:** `offtarget/change_seq/`
**Status:** ❌ Not yet downloaded
**Paper:** Lazzarotto et al., *Nature Biotechnology* 38, 1336–1345 (2020)
**DOI:** https://doi.org/10.1038/s41587-020-0555-7

CHANGE-seq (Cleavage-based Assessment of Nuclease-Generated Effects by Sequencing) is a cell-free biochemical method for genome-wide CRISPR off-target profiling. It is one of the most comprehensive off-target datasets available.

**Download (Zenodo):**
```
https://zenodo.org/record/4540713/files/changeseq_data.csv
```

---

### 6. CIRCLE-seq / CRISPRoff SITE-seq (Proxy)
**Location:** `offtarget/circle_seq/`
**Status:** ⚠️ Partial — SITE-seq validated data present; raw CIRCLE-seq BAMs missing
**Papers:**
- CIRCLE-seq: Tsai et al., *Nature Methods* 14, 607–614 (2017) — [DOI: 10.1038/nmeth.4278](https://doi.org/10.1038/nmeth.4278)
- CRISPRoff: Alkan et al., *Nature Biotechnology* 36, 578–580 (2018)

The CRISPRoff SITE-seq data currently present (`risearch_SITE-seq_VEGFA.out.gz`, `risearch_SITE-seq_XRCC5.out.gz`) provides validated off-target hybridisation data for two guides (VEGFA, XRCC5). The large TSV files contain full off-target scoring tables.

**For full CIRCLE-seq data:**
```
# Tool repo with test data:
https://github.com/tsailabSJ/circleseq/archive/refs/heads/master.zip

# Raw BAM files (requires NCBI SRA Toolkit):
prefetch SRP072973
fastq-dump --split-files SRP072973
```

---

### 7. Oryza sativa — IRGSP-1.0 (Ensembl Plants r62)
**Location:** `genomes/oryza_sativa/`
**Status:** ✅ Present — all annotation types available
**Source:** [Ensembl Plants](https://plants.ensembl.org/Oryza_sativa)

| File | Type | Size | Description |
|---|---|---|---|
| `Oryza_sativa.IRGSP-1.0.dna.toplevel.fa.gz` | Genome | 109.3 MB | Full chromosome sequences |
| `Oryza_sativa.IRGSP-1.0.62.gtf.gz` | Annotation | 8.2 MB | GTF gene model |
| `Oryza_sativa.IRGSP-1.0.62.gff3.gz` | Annotation | 7.0 MB | GFF3 gene model |
| `Oryza_sativa.IRGSP-1.0.cds.all.fa.gz` | CDS | 12.7 MB | All CDS sequences |
| `Oryza_sativa.IRGSP-1.0.pep.all.fa.gz` | Proteins | 8.7 MB | All peptide sequences |

---

### 8–11. Missing Reference Genomes

Download these and place in the corresponding `genomes/<organism>/` directory.

#### Homo sapiens — GRCh38 (Ensembl r113)
```bash
# Genome
wget https://ftp.ensembl.org/pub/release-113/fasta/homo_sapiens/dna/Homo_sapiens.GRCh38.dna.toplevel.fa.gz
# GTF
wget https://ftp.ensembl.org/pub/release-113/gtf/homo_sapiens/Homo_sapiens.GRCh38.113.gtf.gz
# GFF3
wget https://ftp.ensembl.org/pub/release-113/gff3/homo_sapiens/Homo_sapiens.GRCh38.113.gff3.gz
# CDS
wget https://ftp.ensembl.org/pub/release-113/fasta/homo_sapiens/cds/Homo_sapiens.GRCh38.cds.all.fa.gz
```

#### Arabidopsis thaliana — TAIR10 (Ensembl Plants r60)
```bash
BASE=https://ftp.ensemblgenomes.ebi.ac.uk/pub/plants/release-60
wget $BASE/fasta/arabidopsis_thaliana/dna/Arabidopsis_thaliana.TAIR10.dna.toplevel.fa.gz
wget $BASE/gtf/arabidopsis_thaliana/Arabidopsis_thaliana.TAIR10.60.gtf.gz
wget $BASE/gff3/arabidopsis_thaliana/Arabidopsis_thaliana.TAIR10.60.gff3.gz
wget $BASE/fasta/arabidopsis_thaliana/cds/Arabidopsis_thaliana.TAIR10.cds.all.fa.gz
```

#### Mus musculus — GRCm39 (Ensembl r113)
```bash
wget https://ftp.ensembl.org/pub/release-113/fasta/mus_musculus/dna/Mus_musculus.GRCm39.dna.toplevel.fa.gz
wget https://ftp.ensembl.org/pub/release-113/gtf/mus_musculus/Mus_musculus.GRCm39.113.gtf.gz
wget https://ftp.ensembl.org/pub/release-113/gff3/mus_musculus/Mus_musculus.GRCm39.113.gff3.gz
wget https://ftp.ensembl.org/pub/release-113/fasta/mus_musculus/cds/Mus_musculus.GRCm39.cds.all.fa.gz
```

#### Zea mays — NAM-5.0 (Ensembl Plants r60)
```bash
BASE=https://ftp.ensemblgenomes.ebi.ac.uk/pub/plants/release-60
wget $BASE/fasta/zea_mays/dna/Zea_mays.Zm-B73-REFERENCE-NAM-5.0.dna.toplevel.fa.gz
wget $BASE/gtf/zea_mays/Zea_mays.Zm-B73-REFERENCE-NAM-5.0.60.gtf.gz
wget $BASE/gff3/zea_mays/Zea_mays.Zm-B73-REFERENCE-NAM-5.0.60.gff3.gz
wget $BASE/fasta/zea_mays/cds/Zea_mays.Zm-B73-REFERENCE-NAM-5.0.cds.all.fa.gz
```

---

## Notes

- All `.fa.gz` and `.gtf.gz` files are standard gzip-compressed and can be read directly by most bioinformatics tools (e.g., STAR, HISAT2, Bowtie2, pybedtools, pyfaidx).
- Do **not** decompress genome files — keep them gzipped to save disk space.
- See `DATASET_INVENTORY.md` in this directory for per-file checksums (MD5), sizes, and duplicate/corruption status.
