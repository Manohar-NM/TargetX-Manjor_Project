import { jsPDF } from 'jspdf';
import fs from 'fs';
import path from 'path';

const doc = new jsPDF({
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4'
});

const pageWidth = 210;
const pageHeight = 297;
const margin = 16;
const contentWidth = pageWidth - margin * 2;
let y = margin;

function checkPageBreak(neededHeight) {
  if (y + neededHeight > pageHeight - 20) {
    doc.addPage();
    y = margin + 5;
    drawHeader();
  }
}

function drawHeader() {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('TARGETX — SYSTEM ARCHITECTURE & TECH STACK DOSSIER', margin, 10);
  doc.setFont('helvetica', 'normal');
  doc.text('TECHNICAL JURY EVALUATION SPECIFICATION', pageWidth - margin - 68, 10);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, 12, pageWidth - margin, 12);
}

function addSectionTitle(title) {
  checkPageBreak(15);
  doc.setFillColor(15, 23, 42); // slate-900
  doc.roundedRect(margin, y, contentWidth, 11, 2, 2, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(56, 189, 248); // sky-400
  doc.text(title.toUpperCase(), margin + 5, y + 7.5);
  
  y += 15;
}

function addLanguageCard(langName, version, domain, badgeColor = [14, 165, 233]) {
  checkPageBreak(18);
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, 12, 1.5, 1.5, 'FD');
  
  // Left vertical badge
  doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
  doc.rect(margin, y, 3, 12, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(langName, margin + 6, y + 8);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Version: ${version}`, margin + 55, y + 8);
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(badgeColor[0], badgeColor[1], badgeColor[2]);
  doc.text(`Domain: ${domain}`, margin + 95, y + 8);
  
  y += 15;
}

function addParagraph(text, color = [51, 65, 85]) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.8);
  doc.setTextColor(color[0], color[1], color[2]);
  const lines = doc.splitTextToSize(text, contentWidth);
  checkPageBreak(lines.length * 4.3 + 2);
  doc.text(lines, margin, y);
  y += lines.length * 4.3 + 2;
}

function addBullet(title, text) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.6);
  doc.setTextColor(15, 23, 42);
  const prefix = `• ${title}: `;
  const prefixWidth = doc.getTextWidth(prefix);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  const lines = doc.splitTextToSize(text, contentWidth - prefixWidth);
  checkPageBreak(lines.length * 4.2 + 2);
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(prefix, margin, y);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(lines[0], margin + prefixWidth, y);
  
  for (let i = 1; i < lines.length; i++) {
    doc.text(lines[i], margin + 6, y + (i * 4.2));
  }
  y += lines.length * 4.2 + 1.8;
}

function addTable(headers, rows, colWidths) {
  const rowHeight = 6.5;
  const tableHeight = (rows.length + 1) * rowHeight;
  checkPageBreak(tableHeight + 4);
  
  // Header
  doc.setFillColor(30, 41, 59);
  doc.rect(margin, y, contentWidth, rowHeight, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  
  let curX = margin;
  headers.forEach((h, i) => {
    doc.text(h, curX + 2, y + 4.5);
    curX += colWidths[i];
  });
  y += rowHeight;
  
  // Rows
  rows.forEach((r, rIdx) => {
    checkPageBreak(rowHeight);
    doc.setFillColor(rIdx % 2 === 0 ? 248 : 255, rIdx % 2 === 0 ? 250 : 255, rIdx % 2 === 0 ? 252 : 255);
    doc.rect(margin, y, contentWidth, rowHeight, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(margin, y + rowHeight, margin + contentWidth, y + rowHeight);
    
    curX = margin;
    r.forEach((cell, cIdx) => {
      doc.setFont('helvetica', cIdx === 0 ? 'bold' : 'normal');
      doc.setFontSize(7.6);
      doc.setTextColor(15, 23, 42);
      const textLines = doc.splitTextToSize(String(cell), colWidths[cIdx] - 4);
      doc.text(textLines[0], curX + 2, y + 4.5);
      curX += colWidths[cIdx];
    });
    y += rowHeight;
  });
  y += 4;
}

// ==========================================
// HERO HEADER
// ==========================================
doc.setFillColor(15, 23, 42);
doc.rect(0, 0, pageWidth, 42, 'F');

doc.setFont('helvetica', 'bold');
doc.setFontSize(16);
doc.setTextColor(56, 189, 248);
doc.text('TARGETX — TECH STACK & PROGRAMMING LANGUAGES', margin, 17);

doc.setFont('helvetica', 'normal');
doc.setFontSize(9.5);
doc.setTextColor(226, 232, 240);
doc.text('Comprehensive Technical Architecture, Domains, Sub-Domains & Framework Specification', margin, 24);

doc.setFont('helvetica', 'italic');
doc.setFontSize(8);
doc.setTextColor(148, 163, 184);
doc.text('Prepared for Chief Technology Officers, Software Engineering Leads & Academic Tech Jurors', margin, 31);

y = 48;

// ==========================================
// 1. EXECUTIVE SUMMARY & ARCHITECTURE TABLE
// ==========================================
addSectionTitle('1. Technology Matrix at a Glance');

addParagraph(
  'TargetX was engineered using an enterprise polyglot micro-architecture combining high-performance scientific Python computing with a full-stack, end-to-end type-safe TypeScript/Node.js web platform:'
);

const matrixHeaders = ['Language', 'Core Domain', 'Key Sub-Domains', 'Primary Libraries & Engines'];
const matrixWidths = [28, 48, 52, 50];
const matrixRows = [
  ['Python 3.10+', 'AI, ML & Biophysics', 'Deep Learning, GBDT, XAI, Biophysics', 'PyTorch, XGBoost, LightGBM, SHAP, Scikit'],
  ['TypeScript 5.9+', 'Full-Stack Type System', 'Type-Safe RPC, Contracts, Schemas, ORM', 'tRPC v11, Zod v4, Drizzle ORM, Node Types'],
  ['JavaScript / Node', 'Async Server Runtime', 'Event Loop, REST Routing, Reactive UI', 'Node.js 20+, Express 4, React 19, jsPDF'],
  ['CSS3 / HTML5', 'Bio-Informatics UI/UX', 'Glassmorphism, SVG Visuals, Tokens', 'Tailwind CSS v4, Recharts, Framer Motion'],
  ['SQL (Relational)', 'Data Persistence', 'Relational Schemas, Migrations, ACID', 'MySQL / SQLite via Drizzle ORM Migrations'],
  ['Dockerfile / Shell', 'DevOps & Deployment', 'Multi-Stage Builds, Bundling, PaaS', 'Docker, Vite 7, esbuild, Render Cloud PaaS']
];
addTable(matrixHeaders, matrixRows, matrixWidths);

y += 2;

// ==========================================
// 2. PYTHON DEEP DIVE
// ==========================================
addSectionTitle('2. Python (v3.10+) — AI, Deep Learning & Biophysics');

addLanguageCard('Python', '3.10.x / 3.11.x', 'Scientific Computing & Machine Learning', [2, 132, 199]);

addBullet(
  'Deep Learning & Attention Networks',
  'PyTorch (torch, torch.nn) powering the DeepHF Conv-Attention model (1D-CNN with kernel sizes 3 & 5 + MultiheadAttention num_heads=4 + Batch Normalization) and DeepSpCas9 CNN for sequence-dependent cutting kinetics.'
);
addBullet(
  'Gradient Boosted Decision Trees (GBDT)',
  'XGBoost (xgboost) and LightGBM (lightgbm) trained on 30-dimensional engineered genomic feature vectors, capturing non-linear nucleotide interactions and GC-skew dynamics.'
);
addBullet(
  'Bagged Ensembles & Stacking Meta-Learner',
  'Scikit-Learn (ExtraTreesRegressor, RandomForestRegressor, Ridge) forming the meta-stacking ensemble layer that yields Pearson r = 0.9782 and RMSE = 0.0299.'
);
addBullet(
  'Biophysical Thermodynamics & Repair',
  'Nearest-neighbor thermodynamic algorithms implementing the SantaLucia thermodynamic free energy (Delta G, Delta H, Delta S) and inDelphi microhomology (MMEJ vs NHEJ) repair outcome predictors.'
);
addBullet(
  'Explainable AI (XAI)',
  'SHAP (shap.TreeExplainer) for game-theoretic feature attribution, breaking down exact delta contributions per nucleotide position for laboratory validation.'
);
addBullet(
  'Data Serialization & Benchmarking',
  'NumPy and Pandas for genomic vector transformation; Joblib for high-throughput model weight serialization and loading.'
);

y += 2;

// ==========================================
// 3. TYPESCRIPT DEEP DIVE
// ==========================================
addSectionTitle('3. TypeScript (v5.9+) — Type Safety & Domain Architecture');

addLanguageCard('TypeScript', '5.9.3 (Strict Mode)', 'Full-Stack Type-Safe System & Contracts', [49, 120, 198]);

addBullet(
  'End-to-End Type Safety (tRPC v11)',
  'Uses @trpc/server, @trpc/client, and @trpc/react-query to share compile-time data contracts between server and client without code generation or manual OpenAPI schemas.'
);
addBullet(
  'Biological Input Validation (Zod v4)',
  'Validates user prompts, IUPAC nucleotide sequences (A, C, G, T, N), genomic loci coordinates, and organism identifiers at the API boundaries to prevent invalid bioinformatics inputs.'
);
addBullet(
  'Object-Relational Mapping (Drizzle ORM)',
  'Type-safe SQL query builder and schema management (drizzle-orm, drizzle-kit) defining models for Projects, Pipeline Stages, gRNA Candidates, Off-Target Loci, and SHAP results.'
);
addBullet(
  'Asynchronous Pipeline State Machine',
  'Strictly-typed 8-stage state handler (server/pipeline/stageHandlers.ts) managing asynchronous transitions, error handling, telemetry stats, and database transaction tracking.'
);

y += 2;

// ==========================================
// 4. JAVASCRIPT & NODE.JS
// ==========================================
addSectionTitle('4. JavaScript (ES2022+) & Node.js — Runtime & Reactive UI');

addLanguageCard('JavaScript / Node.js', 'Node v20+ / ES2022', 'Asynchronous Runtime & Frontend Engine', [234, 179, 8]);

addBullet(
  'Backend Application Server',
  'Node.js asynchronous event-driven I/O engine running Express 4 (express) for HTTP routing, CORS security headers, reverse-proxying, and session handling.'
);
addBullet(
  'Frontend Reactive UI Library',
  'React 19 (react, react-dom) utilizing functional components, concurrent rendering, and context-based state management (ProjectContext).'
);
addBullet(
  'Asynchronous Query & Caching',
  'TanStack React Query v5 (@tanstack/react-query) for intelligent query caching, background data revalidation, and live polling of pipeline stage telemetry.'
);
addBullet(
  'Headless & In-Browser PDF Generation',
  'jsPDF (jspdf) engine enabling vector rendering of clinical research reports, jury guides, and executive briefing dossiers directly from application state.'
);

y += 2;

// ==========================================
// 5. CSS, HTML & VISUALIZATION
// ==========================================
addSectionTitle('5. CSS3 & HTML5 — Styling, Tokens & Scientific Visuals');

addLanguageCard('Tailwind CSS & SVG', 'Tailwind v4 / HTML5', 'Bioinformatics UX & Visualization', [6, 182, 212]);

addBullet(
  'Design System & Glassmorphism',
  'Tailwind CSS v4 with custom utility tokens, dark mode backdrop filters (backdrop-blur-md, bg-[#0d1117]/85), and bioluminescent neon cyber-cyan borders.'
);
addBullet(
  'Interactive Scientific Visualizations',
  'Recharts (recharts) rendering responsive SVG charts for model radar scores, GC-content curves, nucleotide distributions, and variance metrics.'
);
addBullet(
  'Micro-Animations & HUD Steppers',
  'Framer Motion (framer-motion) driving fluid UI animations across the 8-stage Genomic HUD Stepper, glowing laser connectors, and real-time telemetry tickers.'
);
addBullet(
  'Accessible Design Primitives',
  'Radix UI primitives (@radix-ui/react-*) ensuring WAI-ARIA accessibility across modal dialogs, tabs, tooltips, dropdowns, and sliders.'
);

y += 2;

// ==========================================
// 6. DEVOPS, DEPLOYMENT & SQL
// ==========================================
addSectionTitle('6. DevOps, Containerization & SQL Database');

addBullet(
  'Multi-Stage Docker Container',
  'Containerized via multi-stage Dockerfile running Node.js alpine base images, caching dependencies, and isolating production artifacts for cloud execution.'
);
addBullet(
  'Production Bundling & Compilers',
  'Vite 7 (vite) for rapid frontend tree-shaking and HMR; esbuild (0.25+) for sub-second Node.js TypeScript server bundling into an optimized ESM dist file.'
);
addBullet(
  'Cloud Platform-as-a-Service (Render PaaS)',
  'Live continuous deployment on Render Cloud PaaS (https://target-x.onrender.com) with automated environment variable injection, TLS termination, and health checks.'
);
addBullet(
  'Relational Persistence (SQL)',
  'Structured schemas supporting ACID transactions across multi-step pipeline results, candidate rankings, and off-target mismatch matrices.'
);

y += 3;

// ==========================================
// 7. ARCHITECTURAL JUSTIFICATION FOR TECH HEADS
// ==========================================
addSectionTitle('7. Architectural Justification (Why this Polyglot Stack?)');

addParagraph(
  'Why not build everything purely in Python or purely in Node.js? Tech jurors often look for architectural justification:'
);

addBullet(
  'Separation of Concerns',
  'Python is the undisputed global benchmark for tensor operations (PyTorch), machine learning (XGBoost), and bioinformatics algorithms. However, Python web frameworks (Flask/Django) have slower concurrency and lack native modern reactive UI ecosystems.'
);
addBullet(
  'Node.js + React Concurrency',
  'TypeScript/React provides ultra-fast event loop concurrency, reactive state management, and instant HMR, giving users a sleek, commercial-grade biotechnology HUD command center.'
);
addBullet(
  'End-to-End Type Safety',
  'tRPC and Zod eliminate runtime schema mismatches between the front-end telemetry and backend pipeline, making the system resilient to unexpected bioinformatics payload errors.'
);

// Page Numbers & Footer
const totalPages = doc.internal.getNumberOfPages();
for (let i = 1; i <= totalPages; i++) {
  doc.setPage(i);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`TargetX Technical Architecture Dossier  |  Page ${i} of ${totalPages}`, margin, pageHeight - 10);
  doc.text('https://target-x.onrender.com', pageWidth - margin - 35, pageHeight - 10);
}

const outputPath = path.join(process.cwd(), 'TargetX_Technology_Stack_and_Languages_Dossier.pdf');
const pdfBytes = doc.output('arraybuffer');
fs.writeFileSync(outputPath, Buffer.from(pdfBytes));
console.log(`[SUCCESS] Tech Stack PDF generated at: ${outputPath}`);
