from math import ceil
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.oxml.xmlchemy import OxmlElement

# ---------- THEME ----------
BG = RGBColor(0x0D, 0x11, 0x17)
HDR = RGBColor(0x16, 0x1B, 0x22)
CARD = RGBColor(0x14, 0x1A, 0x22)
CYAN = RGBColor(0x00, 0xD2, 0xFF)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
MUTED = RGBColor(0x8B, 0x94, 0x9E)
FONT, MONO = "Calibri", "Consolas"
PROJECT = "TargetX: In Silico CRISPR/Cas9 gRNA Design Platform"
TOTAL = 21

prs = Presentation()
prs.slide_width, prs.slide_height = Inches(13.333), Inches(7.5)
BLANK = prs.slide_layouts[6]
N = 0


# ---------- HELPERS ----------
def rect(s, x, y, w, h, fill, line=None, shape=MSO_SHAPE.RECTANGLE, adj=None):
    sh = s.shapes.add_shape(shape, Inches(x), Inches(y), Inches(w), Inches(h))
    sh.fill.solid()
    sh.fill.fore_color.rgb = fill
    if line is not None:
        sh.line.color.rgb = line
        sh.line.width = Pt(1.25)
    else:
        sh.line.fill.background()
    sh.shadow.inherit = False
    if adj is not None:
        sh.adjustments[0] = adj
    return sh


def rich(p, text, size, color=WHITE, font=FONT, bold_all=False):
    """**text** -> bold cyan run; everything else normal."""
    for i, part in enumerate(text.split("**")):
        if not part:
            continue
        r = p.add_run()
        r.text = part
        r.font.size, r.font.name = Pt(size), font
        hot = i % 2 == 1
        r.font.bold = hot or bold_all
        r.font.color.rgb = CYAN if hot else color


def label(s, x, y, w, h, text, size=18, color=WHITE, bold=False,
          align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, font=FONT):
    tb = s.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = anchor
    for i, line in enumerate(text.split("\n")):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        rich(p, line, size, color, font, bold)
    return tb


def body(s, x, y, w, h, items, size=16, bullet=True, font=FONT, space=7):
    tb = s.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = tb.text_frame
    tf.word_wrap = True
    for i, it in enumerate(items):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.space_after = Pt(space)
        if bullet:
            pPr = p._p.get_or_add_pPr()
            pPr.set("marL", str(int(Inches(0.28))))
            pPr.set("indent", str(-int(Inches(0.28))))
            clr = OxmlElement("a:buClr")
            c = OxmlElement("a:srgbClr")
            c.set("val", "00D2FF")
            clr.append(c)
            pPr.append(clr)
            bu = OxmlElement("a:buChar")
            bu.set("char", "\u2022")
            pPr.append(bu)
        rich(p, it, size, WHITE, font)
    return tb


def footer(s):
    label(s, 0.5, 7.07, 9, 0.3, PROJECT, 11, MUTED)
    label(s, 11.3, 7.07, 1.55, 0.3, f"{N} / {TOTAL}", 11, MUTED, align=PP_ALIGN.RIGHT)


def new_slide(title, notes, header=True):
    global N
    N += 1
    s = prs.slides.add_slide(BLANK)
    s.background.fill.solid()
    s.background.fill.fore_color.rgb = BG
    if header:
        rect(s, 0, 0, 13.333, 1.05, HDR)
        rect(s, 0, 1.05, 13.333, 0.05, CYAN)
        label(s, 0.5, 0.1, 12.3, 0.85, title, 28, WHITE, True, anchor=MSO_ANCHOR.MIDDLE)
    footer(s)
    s.notes_slide.notes_text_frame.text = notes
    return s


def card(s, x, y, w, h, head, items, size=16, bullet=True, font=FONT):
    rect(s, x, y, w, h, CARD, CYAN, MSO_SHAPE.ROUNDED_RECTANGLE, 0.03)
    rect(s, x, y + 0.12, 0.09, 0.45, CYAN)
    label(s, x + 0.25, y + 0.08, w - 0.4, 0.55, head, 19, CYAN, True, anchor=MSO_ANCHOR.MIDDLE)
    body(s, x + 0.25, y + 0.75, w - 0.5, h - 0.85, items, size, bullet, font)


def circle(s, x, y, num, d=0.6):
    rect(s, x, y, d, d, CYAN, shape=MSO_SHAPE.OVAL)
    label(s, x, y, d, d, str(num), 20, BG, True, PP_ALIGN.CENTER, MSO_ANCHOR.MIDDLE)


# ---------- SLIDE TYPES ----------
def list_slide(title, items, notes, size=20, bullet=True, font=FONT, intro=None, space=7):
    s = new_slide(title, notes)
    y = 1.45
    if intro:
        label(s, 0.7, y, 11.9, 0.9, intro, 17, MUTED)
        y += 1.0
    rect(s, 0.5, y - 0.05, 12.33, 6.85 - y + 0.05, CARD, CYAN, MSO_SHAPE.ROUNDED_RECTANGLE, 0.02)
    body(s, 0.85, y + 0.15, 11.6, 6.8 - y - 0.2, items, size, bullet, font, space)
    return s


def cards_slide(title, cards, notes, cols=None, size=16):
    s = new_slide(title, notes)
    n = len(cards)
    cols = cols or n
    rows = ceil(n / cols)
    gap = 0.3
    w = (12.33 - (cols - 1) * gap) / cols
    h = (5.45 - (rows - 1) * gap) / rows
    for i, (head, items) in enumerate(cards):
        r, c = divmod(i, cols)
        card(s, 0.5 + c * (w + gap), 1.4 + r * (h + gap), w, h, head, items, size)
    return s


def rows_slide(title, rows, notes, size=15):
    s = new_slide(title, notes)
    h = 5.45 / len(rows)
    for i, (head, items) in enumerate(rows):
        y = 1.4 + i * h
        rect(s, 0.5, y, 12.33, h - 0.15, CARD, CYAN, MSO_SHAPE.ROUNDED_RECTANGLE, 0.04)
        circle(s, 0.75, y + 0.25, i + 1)
        label(s, 1.55, y + 0.1, 11, 0.5, head, 19, CYAN, True)
        body(s, 1.55, y + 0.58, 11, h - 0.75, items, size, True, space=3)
    return s


# ======================================================================
# 1  TITLE
# ======================================================================
N += 1
s = prs.slides.add_slide(BLANK)
s.background.fill.solid()
s.background.fill.fore_color.rgb = BG
rect(s, 0, 0, 0.35, 7.5, CYAN)
label(s, 0.9, 0.9, 11.8, 2.3,
      "**TargetX:**\nAutonomous In Silico CRISPR/Cas9 Guide RNA Design & Cleavage Prediction Platform",
      34, WHITE, True)
label(s, 0.9, 3.45, 5, 0.4, "Team Members", 18, CYAN, True)
label(s, 0.9, 3.9, 6.5, 1.6,
      "Manu (4AL23CS079)\nManisha K (USN)\nNireeksha S Salian (USN)\nRakesh K (USN)", 17)
label(s, 7.6, 3.45, 5, 0.4, "Guide", 18, CYAN, True)
label(s, 7.6, 3.9, 5.2, 0.9, "Dr. Madhusudhan S\nDepartment of CSE", 17)
label(s, 7.6, 4.85, 5.2, 0.5, "Live: https://target-x.onrender.com", 16, CYAN)
rect(s, 0.9, 5.75, 11.8, 0.03, CYAN)
label(s, 0.9, 5.9, 11.8, 0.9,
      "Alva's Institute of Engineering and Technology, Moodbidri\n"
      "Affiliated to Visvesvaraya Technological University (VTU)", 15, MUTED)
footer(s)
s.notes_slide.notes_text_frame.text = (
    "Good morning, respected jury. We present TargetX, an AI platform that designs "
    "CRISPR guide RNAs in 10 seconds instead of 6\u201312 months.")

# ======================================================================
# 2  CONTENTS
# ======================================================================
list_slide("Contents", [
    "Introduction & Motivation",
    "Problem Statement and Objectives",
    "Literature Review & Research Gap",
    "Proposed Methodology (8-Stage Pipeline)",
    "System Flow & Architecture",
    "Algorithm / ML Ensemble & Biophysics",
    "Key Innovation",
    "Project Outcomes, Metrics & Rice Case Study",
    "Live Deployment & Tech Stack",
    "Conclusion & Future Scope",
    "References",
], "This is the roadmap, from the problem to the live deployed system.", size=21, space=5)

# ======================================================================
# 3  INTRODUCTION & MOTIVATION
# ======================================================================
cards_slide("Introduction & Motivation", [
    ("CRISPR Challenge", [
        "CRISPR-Cas9 works as molecular scissors for curing genetic disorders and building climate-resilient crops.",
        "Choosing the right guide RNA is slow, costly and risky.",
        "Wrong cuts can trigger cell toxicity or cancer."]),
    ("Motivation", [
        "Replace wet-lab guesswork with in silico design.",
        "Give researchers lab-ready guides in under 10 seconds.",
        "Bring computational AI to medicine and agriculture."]),
    ("Aim", [
        "Build an autonomous, web-based gRNA design platform.",
        "Support 16 organisms from a natural-language goal.",
        "Combine deep learning, boosted trees and biophysics.",
        "Deliver explainable, publication-ready outputs."]),
], "CRISPR is powerful, but choosing the guide is the bottleneck. We automate it.", size=15)

# ======================================================================
# 4  PROBLEM STATEMENT & OBJECTIVES
# ======================================================================
s = new_slide("Problem Statement and Objectives",
              "Our four objectives map directly to the speed, accuracy, safety and trust gaps.")
card(s, 0.5, 1.4, 5.7, 5.45, "Problem Statement", [
    "Wet-lab guide screening takes 6\u201312 months and costs over $2M\u2013$3M per clinical candidate.",
    "Off-target cleavage risks oncogenesis (cancer) in patients.",
    "Existing tools often give single-model scores with no explanation or end-to-end workflow."], 17)
label(s, 6.5, 1.35, 6, 0.5, "Objectives", 21, CYAN, True)
objs = [("Autonomous Pipeline", "Natural language to ranked guides."),
        ("Accurate Prediction", "A high-correlation ML ensemble."),
        ("Off-Target Safety", "CFD/MIT scoring on GUIDE-seq data."),
        ("Explainability", "SHAP plus a lab-ready PDF dossier.")]
for i, (h_, d_) in enumerate(objs):
    y = 1.95 + i * 1.2
    rect(s, 6.5, y, 6.33, 1.05, CARD, CYAN, MSO_SHAPE.ROUNDED_RECTANGLE, 0.1)
    circle(s, 6.7, y + 0.22, i + 1)
    label(s, 7.5, y + 0.1, 5.2, 0.4, h_, 18, WHITE, True)
    label(s, 7.5, y + 0.52, 5.2, 0.4, d_, 15, MUTED)

# ======================================================================
# 5  LITERATURE REVIEW (table)
# ======================================================================
s = new_slide("Literature Review",
              "Each prior tool solves one piece. Our work unifies them.")
label(s, 0.5, 1.3, 12.3, 0.9,
      "The reviewed work covers guide-efficiency prediction, off-target scoring, repair-outcome "
      "prediction, explainable AI and boosted-tree methods.", 16, MUTED)
lit = [("Year", "Work", "Contribution"),
       ("2013", "Hsu et al. (MIT score)", "Cas9 targeting specificity and off-target scoring"),
       ("2015", "Tsai et al. (GUIDE-seq)", "Empirical genome-wide off-target detection"),
       ("2016", "Doench et al. (Rule Set 2 / CFD)", "On-target activity model and CFD off-target score"),
       ("2016\u201317", "Chen & Guestrin; Ke et al.", "XGBoost and LightGBM gradient boosting"),
       ("2017", "Lundberg & Lee (SHAP)", "Game-theoretic feature attribution"),
       ("2018", "Chuai et al. (DeepCRISPR)", "Deep learning with autoencoder for guide design"),
       ("2018", "Shen et al. (inDelphi)", "Repair-outcome (MMEJ/NHEJ) prediction"),
       ("2019", "Kim et al. (DeepSpCas9); Wang et al. (DeepHF)", "Deep models of SpCas9 / high-fidelity Cas9 activity")]
tbl = s.shapes.add_table(len(lit), 3, Inches(0.5), Inches(2.25), Inches(12.33), Inches(4.6)).table
for ci, wd in enumerate((1.3, 4.9, 6.13)):
    tbl.columns[ci].width = Inches(wd)
for ri, row in enumerate(lit):
    for ci, val in enumerate(row):
        c = tbl.cell(ri, ci)
        c.fill.solid()
        c.fill.fore_color.rgb = CYAN if ri == 0 else (CARD if ri % 2 else HDR)
        c.vertical_anchor = MSO_ANCHOR.MIDDLE
        p = c.text_frame.paragraphs[0]
        rich(p, val, 14, BG if ri == 0 else WHITE, FONT, ri == 0)

# ======================================================================
# 6  RESEARCH GAP
# ======================================================================
cards_slide("Research Gap", [
    ("Existing Approaches", [
        "Standalone single-purpose tools such as efficiency-only or off-target-only scorers.",
        "Little explainability for why a guide scores high.",
        "Command-line workflows that need bioinformatics expertise.",
        "Limited organism coverage and no report export."]),
    ("Identified Gap & Our Approach", [
        "Need for one integrated platform covering design, scoring, safety and reporting.",
        "TargetX: an 8-stage pipeline with a hybrid ensemble, thermodynamics and repair modelling.",
        "A natural-language interface with SHAP explanations.",
        "16 organisms, deployed on the web."]),
], "The gap is integration and explainability, and we close both.", size=17)

# ======================================================================
# 7  PROPOSED METHODOLOGY
# ======================================================================
rows_slide("Proposed Methodology", [
    ("Phase 1: Understanding & Retrieval (Stages 1\u20134)", [
        "NLP parses the goal into gene, exon and organism.",
        "Genome coordinates are fetched from GRCh38, IRGSP-1.0 and other references.",
        "NGG PAM scan, then gRNA candidate generation."]),
    ("Phase 2: AI/ML Efficiency Prediction (Stage 5)", [
        "A 30-dimensional feature vector feeds the DL and boosted-tree models.",
        "A meta-stacking ensemble produces the final cleavage score."]),
    ("Phase 3: Safety, Explainability & Export (Stages 6\u20138)", [
        "CFD/MIT genome-wide off-target scoring.",
        "SHAP per-nucleotide attribution.",
        "PDF research dossier for wet-lab synthesis."]),
], "Eight stages are grouped here into three phases: understand, predict, validate.")

# 7A
cards_slide("Proposed Methodology: ML & DL Ensemble", [
    ("Deep Learning", [
        "PyTorch DeepHF: 1D-CNN (kernels 3 and 5), 4-head self-attention, BatchNorm.",
        "DeepSpCas9 CNN.",
        "DeepCRISPR autoencoder."]),
    ("Gradient Boosting", [
        "XGBoost and LightGBM.",
        "30-dimensional engineered genomic features.",
        "Capture nucleotide interactions and GC-skew."]),
    ("Bagging & Stacking", [
        "Random Forest and ExtraTrees bagged ensembles.",
        "Ridge regression meta-stacker combines all base models."]),
], "Different model families make different errors, and stacking combines their strengths.", size=15)

# 7B
cards_slide("Proposed Methodology: Biophysics & Repair", [
    ("SantaLucia Nearest-Neighbor", [
        "Free energy \u0394G\u00b0, \u0394H and \u0394S of the guide.",
        "Melting temperature (Tm).",
        "Hairpin minimum free energy (MFE)."]),
    ("inDelphi Microhomology Repair", [
        "Predicts MMEJ vs NHEJ repair outcome.",
        "Estimates frameshift frequency after the cut."]),
    ("Why It Matters", [
        "Adds physical and repair-outcome context to the ML scores.",
        "Supports better guide selection for knockouts."]),
], "Beyond cutting efficiency, we model structure stability and what the cell does after the cut.", size=15)

# ======================================================================
# 8  SYSTEM FLOW
# ======================================================================
s = new_slide("System Flow",
              "The user types one sentence and the system walks through all eight stages automatically.")
stages = [("AI Understanding", "NLP parses gene, exon, organism"),
          ("Gene Retrieval", "GRCh38 / IRGSP-1.0 coordinates"),
          ("PAM Detection", "NGG PAM scan"),
          ("gRNA Generation", "20-nt protospacer candidates"),
          ("ML Ensemble", "DL + GBDT + stacking"),
          ("Off-Target Scoring", "CFD / MIT on GUIDE-seq"),
          ("SHAP Explainability", "Per-nucleotide attribution"),
          ("PDF Export", "Publication research dossier")]
bw, bh, gap = 2.6, 1.55, 0.45
x0 = (13.333 - (4 * bw + 3 * gap)) / 2
for i, (t, d) in enumerate(stages):
    r, c = divmod(i, 4)
    x, y = x0 + c * (bw + gap), 1.6 + r * 2.2
    rect(s, x, y, bw, bh, CARD, CYAN, MSO_SHAPE.ROUNDED_RECTANGLE, 0.08)
    circle(s, x + 0.12, y + 0.12, i + 1, 0.45)
    label(s, x + 0.65, y + 0.1, bw - 0.7, 0.5, t, 16, CYAN, True, anchor=MSO_ANCHOR.MIDDLE)
    label(s, x + 0.15, y + 0.78, bw - 0.3, 0.7, d, 14, WHITE)
    if c < 3:
        rect(s, x + bw + 0.07, y + bh / 2 - 0.15, gap - 0.14, 0.3, CYAN, shape=MSO_SHAPE.RIGHT_ARROW)
label(s, 0.5, 6.1, 12.3, 0.8,
      "Figure: Overall workflow of the TargetX pipeline, tracked live by an 8-stage HUD stepper.",
      15, MUTED, align=PP_ALIGN.CENTER)

# ======================================================================
# 9  ALGORITHM
# ======================================================================
list_slide("Algorithm: End-to-End gRNA Design & Scoring", [
    "**Input:** natural-language goal, e.g. \"Target rice OsDREB1A for drought tolerance\"",
    "1. Parse gene, organism and exon (Zod-validated).",
    "2. Retrieve the genomic sequence and coordinates.",
    "3. Scan for NGG PAM sites and extract 20-nt protospacers.",
    "4. Build the 30-D features and run the ensemble to score cleavage.",
    "5. Compute CFD/MIT off-target scores and tier guides (safe / caution / risk).",
    "6. Compute \u0394G/Tm/MFE and the MMEJ/NHEJ repair profile.",
    "7. Run SHAP and rank the guides.",
    "**Output:** ranked guides and a PDF dossier.",
], "This is the logic that runs end to end in under 10 seconds.",
    size=17, bullet=False, font=MONO, space=8)

# ======================================================================
# 10  SYSTEM ARCHITECTURE
# ======================================================================
s = new_slide("System Architecture",
              "A polyglot design with Python for science and TypeScript for a type-safe web layer.")
layers = [("Frontend", "React 19  |  Tailwind v4 glassmorphism HUD  |  Framer Motion  |  Recharts"),
          ("Backend", "Node 20  |  Express  |  tRPC v11 + Zod v4  |  typed 8-stage state machine"),
          ("ML & Biophysics", "Python 3.10+  |  PyTorch  |  XGBoost  |  LightGBM  |  SHAP  |  Scikit-learn"),
          ("Persistence", "Drizzle ORM on SQL (MySQL/SQLite)  |  ACID pipeline records")]
for i, (t, d) in enumerate(layers):
    y = 1.4 + i * 1.38
    rect(s, 0.9, y, 2.9, 1.0, CYAN, shape=MSO_SHAPE.ROUNDED_RECTANGLE, adj=0.1)
    label(s, 0.9, y, 2.9, 1.0, t, 20, BG, True, PP_ALIGN.CENTER, MSO_ANCHOR.MIDDLE)
    rect(s, 3.95, y, 8.5, 1.0, CARD, CYAN, MSO_SHAPE.ROUNDED_RECTANGLE, 0.1)
    label(s, 4.15, y, 8.1, 1.0, d, 16, WHITE, anchor=MSO_ANCHOR.MIDDLE)
    if i < 3:
        rect(s, 8.0, y + 1.03, 0.4, 0.3, CYAN, shape=MSO_SHAPE.DOWN_ARROW)
label(s, 0.5, 6.6, 12.3, 0.4, "Figure: TargetX layered system architecture.",
      14, MUTED, align=PP_ALIGN.CENTER)

# ======================================================================
# 11  KEY INNOVATION
# ======================================================================
cards_slide("Key Innovation", [
    ("Key Innovation", [
        "Integration of the full gRNA workflow in one autonomous platform.",
        "Hybrid DL + GBDT + stacking ensemble with biophysics and repair modelling.",
        "SHAP explainability for every nucleotide position.",
        "Natural-language input across 16 organisms."]),
    ("Why It Matters", [
        "Cuts design cycles from months to seconds.",
        "Prioritises guides with fewer predicted off-target risks.",
        "Gives researchers transparent, trustable scores.",
        "Applies to both medicine and agriculture."]),
], "Our novelty is the integration, the explainability and the accessibility.", size=17)

# ======================================================================
# 12  PROJECT OUTCOMES: METRICS
# ======================================================================
s = new_slide("Project Outcomes: Performance Metrics",
              "Reproducible with python scripts/evaluate_models.py.")
metrics = [("**r = 0.9782**", "Pearson correlation"),
           ("**\u03c1 = 0.9761**", "Spearman rank"),
           ("**RMSE = 0.0299**", "Root mean squared error"),
           ("**ROC-AUC > 0.94**", "Off-target discrimination (GUIDE-seq)")]
mw = (12.33 - 3 * 0.3) / 4
for i, (v, l) in enumerate(metrics):
    x = 0.5 + i * (mw + 0.3)
    rect(s, x, 1.6, mw, 2.8, CARD, CYAN, MSO_SHAPE.ROUNDED_RECTANGLE, 0.06)
    label(s, x, 1.95, mw, 1.2, v, 25, WHITE, True, PP_ALIGN.CENTER, MSO_ANCHOR.MIDDLE)
    label(s, x + 0.15, 3.35, mw - 0.3, 0.9, l, 15, MUTED, False, PP_ALIGN.CENTER)
body(s, 0.7, 4.75, 12, 2.1, [
    "**Pearson r = 0.9782**: 100% validated on the DeepSpCas9 benchmark (N = 3,000).",
    "**MSE = 0.00089** | **RMSE = 0.0299**.",
    "**ROC-AUC > 0.94** on empirical GUIDE-seq off-target data.",
    "Reproduce: python scripts/evaluate_models.py"], 17)

# 12A
cards_slide("Project Outcomes: Deliverables & Impact", [
    ("Deliverables", [
        "Live web app on Render.",
        "8-stage automated pipeline with 16 organisms.",
        "Ensemble ML engine and off-target engine.",
        "SHAP explanations and PDF research dossier."]),
    ("User & System Impact", [
        "Design time falls from months to about 10 seconds.",
        "Lower R&D cost and wasted screening.",
        "Risky guides are flagged before synthesis.",
        "Accessible to non-programmers."]),
], "These are concrete, working deliverables, not just a model.", size=17)

# 12B
list_slide("Real-World Case Study: Rice OsDREB1A", [
    "**Input:** \"Target rice OsDREB1A for drought tolerance\" (Oryza sativa, Chromosome 9, IRGSP-1.0).",
    "**Scan:** the pipeline scans the 370-Mb rice genome and ranks guides with the ensemble and CFD off-target checks.",
    "**Impact:** drought-tolerant crops support food security, climate resilience and stable grocery prices for consumers.",
    "**Analogy:** like CFD simulation for aircraft, TargetX is the safety simulator that comes before the wet lab.",
], "A computer prediction on one gene turns into more affordable, resilient food, and the same "
   "engine handles human targets such as TP53, BRCA1 and EGFR.", size=20, space=14)

# ======================================================================
# 13  LIVE DEPLOYMENT & TECH STACK
# ======================================================================
cards_slide("Live Deployment & Tech Stack", [
    ("Live Deployment", [
        "https://target-x.onrender.com",
        "GitHub: Manohar-NM/TargetX-Manjor_Project",
        "Docker multi-stage build, continuous deployment on Render."]),
    ("Python 3.10+", [
        "PyTorch, XGBoost, LightGBM",
        "SHAP, Scikit-learn",
        "NumPy, Pandas, Joblib"]),
    ("TypeScript 5.9+ / Node 20+", [
        "tRPC v11, Zod v4",
        "Drizzle ORM, Express",
        "TanStack React Query"]),
    ("Frontend & DevOps", [
        "React 19, Tailwind CSS v4",
        "Framer Motion, Recharts",
        "Vite 7, esbuild, Docker"]),
], "Everything you see is live and reproducible.", cols=2, size=16)

# ======================================================================
# 14  CONCLUSION & FUTURE SCOPE
# ======================================================================
cards_slide("Conclusion & Future Scope", [
    ("Conclusion", [
        "TargetX automates CRISPR gRNA design in about 10 seconds.",
        "The hybrid ensemble reaches **Pearson r = 0.9782** and off-target **ROC-AUC > 0.94**.",
        "Explainable, safety-aware and deployed as a live platform."]),
    ("Future Scope", [
        "Support Cas12a and SaCas9 enzymes.",
        "Drag-and-drop FASTA file upload.",
        "Automated Golden Gate cloning oligo synthesis.",
        "Experimental wet-lab validation."]),
], "TargetX bridges computational AI and real-world medicine and agriculture, and these are the next steps.",
    size=17)

# ======================================================================
# 15  REFERENCES
# ======================================================================
list_slide("References", [
    "Doench et al., \"Optimized sgRNA design to maximize activity and minimize off-target effects,\" Nat. Biotechnol., 2016.",
    "Hsu et al., \"DNA targeting specificity of RNA-guided Cas9 nucleases,\" Nat. Biotechnol., 2013.",
    "Chuai et al., \"DeepCRISPR,\" Genome Biology, 2018.",
    "Kim et al., \"SpCas9 activity prediction by DeepSpCas9,\" Science Advances, 2019.",
    "Wang et al., \"Optimized CRISPR guide RNA design (DeepHF),\" Nat. Commun., 2019.",
    "Shen et al., \"Predictable and precise template-free CRISPR editing (inDelphi),\" Nature, 2018.",
    "SantaLucia, \"A unified view of polymer, dumbbell, and oligonucleotide DNA nearest-neighbor thermodynamics,\" PNAS, 1998.",
    "Lundberg & Lee, \"A unified approach to interpreting model predictions (SHAP),\" NeurIPS, 2017.",
    "Chen & Guestrin, \"XGBoost,\" KDD, 2016.  |  Ke et al., \"LightGBM,\" NeurIPS, 2017.",
    "Tsai et al., \"GUIDE-seq,\" Nat. Biotechnol., 2015.",
], "These are the foundational works our pipeline builds on.", size=14, space=5)

# ======================================================================
# 16  PROJECT SUMMARY
# ======================================================================
list_slide("Project Summary", [
    "AI-driven in silico CRISPR/Cas9 guide design",
    "8-stage autonomous pipeline across 16 organisms",
    "DL + GBDT + stacking ensemble (**r = 0.9782**)",
    "Off-target safety scoring (**ROC-AUC > 0.94**)",
    "SHAP explainability and PDF dossier",
    "Live on Render",
], "One platform, from idea to lab-ready guide.", size=24, space=12)

# ======================================================================
# 17  THANK YOU
# ======================================================================
s = new_slide("", "Thank you, we welcome your questions.", header=False)
rect(s, 0, 0, 0.35, 7.5, CYAN)
label(s, 0.9, 2.3, 11.5, 1.2, "Thank You", 54, WHITE, True, PP_ALIGN.CENTER)
label(s, 0.9, 3.7, 11.5, 0.7, "Questions?", 28, CYAN, True, PP_ALIGN.CENTER)
label(s, 0.9, 4.6, 11.5, 0.6, "https://target-x.onrender.com", 20, MUTED, False, PP_ALIGN.CENTER)

# ---------- SAVE ----------
assert N == TOTAL, f"Slide count mismatch: built {N}, expected {TOTAL}"
prs.save("TargetX_Final_Major_Project.pptx")
print(f"Saved TargetX_Final_Major_Project.pptx ({N} slides)")
