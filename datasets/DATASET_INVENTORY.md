# DATASET INVENTORY
> Auto-generated · targetx-backend/ml/datasets/raw/ · Last updated: 2025-07
> **82 files · 498.1 MB · 1 empty · 4 duplicates · 0 corrupted**

---

## Summary

| Dataset | Files | Size | Status | Ready |
|---|---|---|---|---|
| Azimuth Rule Set 1 & 2 | 6 | ~4.4 MB | ✅ Present | ✅ Yes |
| CRISPRon (Luo2020/Kim2019) | 12 | ~1.6 MB | ✅ Present | ✅ Yes |
| CRISPRBench | 0 | — | ❌ Missing (no public repo found) | ❌ No |
| GUIDE-seq (Tsai 2015) | 10 | ~20.5 MB | ✅ Present | ✅ Yes |
| CHANGE-seq (Lazzarotto 2020) | 0 | — | ❌ Missing (Zenodo 403) | ❌ No |
| CIRCLE-seq + CRISPRoff | 25 | ~22.2 MB | ✅ Present | ✅ Yes |
| Oryza sativa (IRGSP-1.0) | 5 | ~146 MB | ✅ Present | ✅ Yes |
| Homo sapiens (GRCh38 r113) | 3 | ~136 MB | ✅ Present | ✅ Yes |
| Mus musculus (GRCm39 r113) | 3 | ~90 MB | ✅ Present | ✅ Yes |
| Arabidopsis thaliana (TAIR10 r60) | 3 | ~33 MB | ✅ Present | ✅ Yes |
| Zea mays (NAM-5.0 r60) | 3 | ~43 MB | ✅ Present | ✅ Yes |

---

## Duplicates (4 files — safe to delete)

| Keep | Delete | MD5 |
|---|---|---|
| `crispr_efficiency/azimuth/1000guides.csv` | `crispr_efficiency/azimuth/1000guides_test.csv` | `bdf9f270` |
| `crispr_efficiency/crispron/DeepCRISPRon_train.py` | `crispr_efficiency/crispron/DeepCRISPRon_train_reference.py` | `19ddf299` |

## Empty Files (1)

| File | Action |
|---|---|
| `offtarget/circle_seq/TestSample_identified_unmatched.txt` | Expected empty (no unmatched sites in test sample) — safe to keep |

## Missing Datasets

| Dataset | Reason | Manual Download |
|---|---|---|
| CHANGE-seq | Zenodo returns 403 from this machine | https://zenodo.org/record/4540713 → save to `offtarget/change_seq/` |
| CRISPRBench | No public GitHub repo found under any known name | Search https://github.com/RTH-tools |

---

## All Files

| File | Size | MD5 | Status |
|---|---|---|---|
| `crispr_efficiency/azimuth/1000guides.csv` | 60.5 KB | bdf9f270 | ✅ OK |
| `crispr_efficiency/azimuth/1000guides_test.csv` | 60.5 KB | bdf9f270 | ⚠️ DUPE |
| `crispr_efficiency/azimuth/FC_plus_RES_withPredictions.csv` | 498.7 KB | 011305e6 | ✅ OK |
| `crispr_efficiency/azimuth/V1_data.xlsx` | 154.8 KB | 8d1e1dae | ✅ OK |
| `crispr_efficiency/azimuth/V1_suppl_data.txt` | 272.7 KB | 6d78c54d | ✅ OK |
| `crispr_efficiency/azimuth/V2_data.xlsx` | 3.6 MB | 176692a0 | ✅ OK |
| `crispr_efficiency/crispron/23mers.fa` | 13.7 KB | 3d1297d5 | ✅ OK |
| `crispr_efficiency/crispron/30mers.fa` | 16.1 KB | 4b7afbd4 | ✅ OK |
| `crispr_efficiency/crispron/CRISPRon.sh` | 1.1 KB | bec1a547 | ✅ OK |
| `crispr_efficiency/crispron/CRISPRparams.tsv` | 36.6 KB | 3327a748 | ✅ OK |
| `crispr_efficiency/crispron/DeepCRISPRon_eval.py` | 3.8 KB | c8ed96ee | ✅ OK |
| `crispr_efficiency/crispron/DeepCRISPRon_train.py` | 9.0 KB | 19ddf299 | ✅ OK |
| `crispr_efficiency/crispron/DeepCRISPRon_train_reference.py` | 9.0 KB | 19ddf299 | ⚠️ DUPE |
| `crispr_efficiency/crispron/Luo2020_Kim2019.xlsx` | 1.5 MB | 06807988 | ✅ OK |
| `crispr_efficiency/crispron/crispron.csv` | 17.7 KB | 43f1dfeb | ✅ OK |
| `crispr_efficiency/crispron/get_30mers_from_fa.py` | 4.1 KB | 009ddbd7 | ✅ OK |
| `crispr_efficiency/crispron/seq.fa` | 3.6 KB | c0cd1fa2 | ✅ OK |
| `crispr_efficiency/crispron/test.sh` | 206 B | be9dc967 | ✅ OK |
| `genomes/arabidopsis_thaliana/Arabidopsis_thaliana.TAIR10.60.gff3.gz` | 9.1 MB | f5c5a736 | ✅ OK |
| `genomes/arabidopsis_thaliana/Arabidopsis_thaliana.TAIR10.60.gtf.gz` | 10.7 MB | c89df12f | ✅ OK |
| `genomes/arabidopsis_thaliana/Arabidopsis_thaliana.TAIR10.cds.all.fa.gz` | 13.8 MB | b03fbc60 | ✅ OK |
| `genomes/homo_sapiens/Homo_sapiens.GRCh38.113.gff3.gz` | 53.1 MB | ea08f57e | ✅ OK |
| `genomes/homo_sapiens/Homo_sapiens.GRCh38.113.gtf.gz` | 61.2 MB | f5c6ec2e | ✅ OK |
| `genomes/homo_sapiens/Homo_sapiens.GRCh38.cds.all.fa.gz` | 22.1 MB | 6511bffe | ✅ OK |
| `genomes/mus_musculus/Mus_musculus.GRCm39.113.gff3.gz` | 35.3 MB | 0a2c6627 | ✅ OK |
| `genomes/mus_musculus/Mus_musculus.GRCm39.113.gtf.gz` | 38.7 MB | c4d7c9ce | ✅ OK |
| `genomes/mus_musculus/Mus_musculus.GRCm39.cds.all.fa.gz` | 16.3 MB | 28623b18 | ✅ OK |
| `genomes/oryza_sativa/Oryza_sativa.IRGSP-1.0.62.gff3.gz` | 7.0 MB | 44612599 | ✅ OK |
| `genomes/oryza_sativa/Oryza_sativa.IRGSP-1.0.62.gtf.gz` | 8.2 MB | 70c592a9 | ✅ OK |
| `genomes/oryza_sativa/Oryza_sativa.IRGSP-1.0.cds.all.fa.gz` | 12.7 MB | 2392a218 | ✅ OK |
| `genomes/oryza_sativa/Oryza_sativa.IRGSP-1.0.dna.toplevel.fa.gz` | 109.4 MB | 3e9902a7 | ✅ OK |
| `genomes/oryza_sativa/Oryza_sativa.IRGSP-1.0.pep.all.fa.gz` | 8.7 MB | 9b796356 | ✅ OK |
| `genomes/zea_mays/Zea_mays.Zm-B73-REFERENCE-NAM-5.0.60.gff3.gz` | 12.1 MB | e039fc40 | ✅ OK |
| `genomes/zea_mays/Zea_mays.Zm-B73-REFERENCE-NAM-5.0.60.gtf.gz` | 14.2 MB | c406a22f | ✅ OK |
| `genomes/zea_mays/Zea_mays.Zm-B73-REFERENCE-NAM-5.0.cds.all.fa.gz` | 17.5 MB | fd172e21 | ✅ OK |
| `offtarget/circle_seq/CIRCLEseq_MergedTest.yaml` | 531 B | 75f0b95b | ✅ OK |
| `offtarget/circle_seq/CIRCLEseq_StandardTest.yaml` | 557 B | f7695d0f | ✅ OK |
| `offtarget/circle_seq/CIRCLEseq_test_genome.fa` | 97.9 KB | b096a894 | ✅ OK |
| `offtarget/circle_seq/GGGTGGGGGGAGTTTGCTCCTGG.CRISPRoff.tsv` | 2.9 MB | 07f66464 | ✅ OK |
| `offtarget/circle_seq/GGTGGACAAGCGGCAGATAGCGG.CRISPRoff.tsv` | 2.2 MB | 3020df36 | ✅ OK |
| `offtarget/circle_seq/TestSample.bam` | 394.5 KB | 66f16f3a | ✅ OK |
| `offtarget/circle_seq/TestSample.bam.bai` | 512 B | cd74eb62 | ✅ OK |
| `offtarget/circle_seq/TestSample_CONTROL_coordinates.txt` | 124 B | b7fa8b6c | ✅ OK |
| `offtarget/circle_seq/TestSample_NUCLEASE_coordinates.txt` | 22.5 KB | b2bb9513 | ✅ OK |
| `offtarget/circle_seq/TestSample_count.txt` | 781 B | 3c9ee11a | ✅ OK |
| `offtarget/circle_seq/TestSample_identified_matched.txt` | 2.1 KB | 4854f5a4 | ✅ OK |
| `offtarget/circle_seq/TestSample_identified_unmatched.txt` | 0 B | d41d8cd9 | ⚠️ EMPTY (expected) |
| `offtarget/circle_seq/TestSample_sorted.bam` | 419.1 KB | 94a2b59e | ✅ OK |
| `offtarget/circle_seq/control_TestSample.bam` | 167.0 KB | e5544f75 | ✅ OK |
| `offtarget/circle_seq/control_TestSample.bam.bai` | 408 B | c75ac757 | ✅ OK |
| `offtarget/circle_seq/control_TestSample_sorted.bam` | 169.8 KB | 07f93390 | ✅ OK |
| `offtarget/circle_seq/crisproff_grnas_with_pam.fa` | 80 B | e8a2ba39 | ✅ OK |
| `offtarget/circle_seq/risearch_SITE-seq_VEGFA.out.gz` | 6.4 MB | e682440c | ✅ OK |
| `offtarget/circle_seq/risearch_SITE-seq_XRCC5.out.gz` | 4.1 MB | ca8698d1 | ✅ OK |
| `offtarget/circle_seq/test_CRISPRspec.tsv` | 574 B | 5fa5f031 | ✅ OK |
| `offtarget/guide_seq/EMX1_backgroundFiltered.txt` | 712 B | e5b7a9b8 | ✅ OK |
| `offtarget/guide_seq/EMX1_identifiedOfftargets.txt` | 2.2 KB | 684d8e35 | ✅ OK |
| `offtarget/guide_seq/VEGFA_site1_backgroundFiltered.txt` | 724 B | dc7b7265 | ✅ OK |
| `offtarget/guide_seq/VEGFA_site2_backgroundFiltered.txt` | 515 B | fe98c1eb | ✅ OK |
| `offtarget/guide_seq/VEGFA_site3_backgroundFiltered.txt` | 858 B | 1533f99d | ✅ OK |
| `offtarget/guide_seq/control_identifiedOfftargets.txt` | 1.1 KB | 6b374999 | ✅ OK |
| `offtarget/guide_seq/test_genome.fa` | 12.6 KB | db592da8 | ✅ OK |
| `offtarget/guide_seq/test_regions.bed` | 126 B | 2f4c4a29 | ✅ OK |
