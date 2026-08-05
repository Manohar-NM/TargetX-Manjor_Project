# TargetX Frontend Design Brainstorm

## Reference Style
The user provided a reference image showing a dark futuristic genomics dashboard with:
- Deep navy/black background (#0a0e1a)
- Neon cyan (#06b6d4) primary accent with glow effects
- Glassmorphism panels with subtle borders
- Circuit-board trace decorations in background
- Holographic data visualizations
- Monospace typography for data, clean sans-serif for labels

---

## Three Stylistic Approaches

### 1. "Genome Noir" — Dark Bioinformatics Command Center
- Deep obsidian background with cyan/teal neon circuit traces and hexagonal grid patterns
- Glassmorphism data panels floating over subtle particle backgrounds
- Holographic-style data visualizations with glow effects
- Probability: 0.08

### 2. "Laboratory Clean" — Clinical Research Aesthetic
- Warm off-white background with deep teal accents and subtle paper texture
- Clean grid layout with card-based data presentation
- Medical/institutional feel with serif headings and structured tables
- Probability: 0.03

### 3. "Quantum Biology" — Sci-Fi Research Interface
- Gradient background from deep purple to midnight blue
- Animated DNA helix and molecular structures as decorative elements
- Futuristic HUD-style panels with angular cuts and scan-line effects
- Probability: 0.02

---

## Selected Approach: Genome Noir

The user's reference image clearly aligns with the "Genome Noir" aesthetic — a dark futuristic bioinformatics command center. This is the chosen direction and will be followed strictly.

---

## Deep Design Specification

### Design Movement
Dark-mode scientific software with bioluminescent accents. Draws from laboratory darkroom aesthetics, circuit-board PCB traces, and holographic display interfaces. Think: NASA mission control meets molecular biology.

### Core Principles
1. **Information density without clutter** — Every pixel earns its place; data-heavy panels feel organized, not chaotic
2. **Bioluminescent hierarchy** — Cyan glow indicates active/important elements; muted elements recede into the background
3. **Scientific precision** — Monospace for sequences and coordinates; clean type for labels and descriptions
4. **Modular depth** — Panels layer over each other with subtle depth cues (glassmorphism, shadow, border glow)

### Color Philosophy
- **Background**: Deep obsidian (#0a0e1a) — not pure black, but a dark navy that feels alive
- **Primary accent**: Neon cyan (#06b6d4) — the "bioluminescent" color that signals data, action, and importance
- **Secondary accent**: Electric blue (#3b82f6) — for secondary information and hover states
- **Success/positive**: Emerald green (#10b981) — for high-efficiency, safe, on-target
- **Warning**: Amber (#f59e0b) — for medium-risk, caution indicators
- **Danger/negative**: Crimson red (#ef4444) — for high-risk, off-target, errors
- **Surface**: Glass panels at rgba(255,255,255,0.05) with 1px cyan-tinted borders
- **Text primary**: Off-white (#e2e8f0) for readability against dark background
- **Text secondary**: Muted blue-gray (#94a3b8) for labels, descriptions, metadata

### Layout Paradigm
Asymmetric dashboard grid with a persistent left sidebar navigation (220px) and a main content area that shifts between full-width views and multi-panel grids. The sidebar collapses on mobile. Panels use a 12-column grid system with variable span widths (3/12, 4/12, 5/12, 8/12). No centered hero text — information is left-aligned with data flowing to the right.

### Signature Elements
1. **Circuit-board trace background** — Subtle SVG pattern of cyan circuit traces and connection nodes in the background of all pages
2. **Glowing border panels** — Cards and panels have a 1px border that glows cyan on hover/active state
3. **Pulse animation on live data** — Status indicators and pipeline stages pulse with a subtle cyan glow

### Interaction Philosophy
- Hover states produce a cyan glow bloom effect on panels
- Click transitions are snappy (120ms ease-out)
- Data updates trigger subtle fade-in animations
- Pipeline stages light up sequentially as analysis progresses

### Animation
- Page transitions: 200ms slide-left with opacity fade
- Panel entrance: 150ms scale from 0.97 with opacity, staggered 40ms per panel
- Pipeline progress: Sequential glow activation from left to right, 100ms per stage
- Hover on data cards: 100ms border glow intensification
- No bouncing, no spring physics — everything is crisp and precise

### Typography System
- **Headings**: "JetBrains Mono" — monospace for scientific precision, bold weight for titles
- **Body/Labels**: "Inter" — clean sans-serif for readability in descriptions and metadata
- **Data/Sequences**: "JetBrains Mono" — all DNA sequences, coordinates, and numerical data
- **Hierarchy**: H1 at 2rem/bold, H2 at 1.5rem/semibold, H3 at 1.125rem/medium, body at 0.875rem/regular

### Brand Essence
A research-grade AI platform that transforms complex CRISPR genome engineering into an intuitive, visual, and explainable workflow for molecular biologists and geneticists.

**Personality**: Precise, Authoritative, Illuminating

### Brand Voice
- Headlines: Direct and scientific, no marketing fluff
- CTAs: Action-oriented with clear scientific purpose
- Microcopy: Concise, data-driven, no filler

**Examples**:
- "Design guide RNAs with AI precision"
- "47 candidates analyzed. 3 high-confidence guides identified."

### Wordmark & Logo
Bold geometric "X" formed by intersecting DNA double-helix strands, rendered in cyan with a subtle glow. The X represents the CRISPR cut site and the intersection of AI and biology.

### Signature Brand Color
**Neon Cyan (#06b6d4)** — This is unmistakably TargetX. Every active element, glow, border, and data highlight uses this color.

## Style Decisions
- No centered hero layouts — asymmetric with left-aligned content
- Circuit-board SVG traces as subtle background decoration
- Glassmorphism panels (bg-white/5 with backdrop-blur and cyan-tinted borders)
- Monospace for all biological data (sequences, coordinates, scores)
- Pipeline visualization uses sequential glow animation
- All interactive elements have cyan glow on hover
- Dark background never uses pure black — always dark navy (#0a0e1a)
- Every product route must use the same Genome Noir command-center shell: persistent left navigation, asymmetric modular grid, subtle cyan circuit-trace background, and glass data panels over deep navy.
- Neon cyan #06b6d4 is the only dominant brand/action glow; purple may appear only as a low-level atmospheric trace and must never compete with cyan for hierarchy.
- The TargetX mark is a geometric glowing DNA-strand X, and it must appear consistently in the app chrome and primary brand moments.
