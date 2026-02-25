# PROJECT_MEMORY.md — bst-visual-lab-gpt

Last updated: 2026-02-25 (Asia/Shanghai)

## Project Purpose
Build a polished, Apple-like minimal interactive website to teach **Binary Search Tree (BST)** concepts from CSCI2100C slides, with:
- concept explanation,
- interactive BST insertion/search demo,
- visual traversal process and complexity intuition,
- usable teaching UX for larger datasets.

Live site: https://arvinclaw.github.io/bst-visual-lab-gpt/
Repo: https://github.com/arvinclaw/bst-visual-lab-gpt

## What was done today (chronological)

1. **Initial project publish + deployment setup**
   - Project copied into clean folder and initialized as its own repo.
   - Deployment log added.
   - GitHub repo created/pushed; Pages enabled.

2. **UI bug fixes (background layering and scrolling behavior)**
   - Removed/fixed decorative glow issues that overlapped content.
   - Constrained tree scrolling to demo area to avoid whole-page horizontal drift.
   - Added auto-centering of tree viewport after render/zoom.

3. **Demo usability upgrades**
   - Added insert modes:
     - direct insert,
     - step-by-step insertion process.
   - Added zoom controls and two-directional scrolling.
   - Added auto-fit zoom during insert so tree stays visible.
   - Made tree spacing more compact while avoiding overlap.
   - Lowered minimum zoom to 35%.
   - Added node-count guidance (recommend <= 35 nodes for readability).

4. **Log and viewport improvements**
   - Traversal log converted to fixed-height scrollable panel.
   - Log auto-follows latest entry during running processes.
   - Tree viewport enlarged for better visualization.

5. **Toggle control refinements**
   - Insert mode changed to inline switch in insert row.
   - OFF: white background/black text, knob left.
   - ON: blue background/white text, knob right.
   - Synced gradient-like transition with knob movement.
   - Fixed knob alignment and overlap issues with text.

6. **Skip + collapsible quiz features**
   - Added **Skip Animation** button for:
     - insertion demo animation,
     - search step-by-step animation.
   - On skip: remaining logs generated immediately and animation ends.
   - Bottom Q&A changed to collapsible items (default collapsed).

## Current UX/Feature Summary
- BST insert/search visualization with highlighted traversal.
- Step-by-step insertion/search with optional skipping.
- Auto-fit + manual zoom + 2D scroll in tree canvas.
- Fixed-height auto-follow traversal log.
- Collapsible checkpoint Q&A.
- Public GitHub Pages deployment.

## Key files
- `index.html` — structure and sections.
- `styles.css` — visual theme + interaction styles.
- `script.js` — BST logic + rendering + animations + controls.
- `DEPLOYMENT_LOG.md` — publishing history and infra notes.

## Commit timeline today
- `4e7dad0` Initial publish: Apple-style BST visual lab
- `0c04fdc` docs: record GitHub CLI auth blocker in deployment log
- `0a71d43` docs: finalize deployment log with GitHub repo URL
- `3e46174` chore: trigger GitHub Pages deployment
- `9d74e6e` fix(ui): keep decorative glow behind content and non-fixed
- `3e4bdd1` feat(ui): remove glow, add zoom+2D scroll, and step-by-step insertion mode
- `4a234e9` fix(demo): confine tree scroll area and auto-center viewport on render/zoom
- `af5696a` feat(demo): auto-fit tree on insert, compact layout, lower min zoom, add node-count hint
- `10cae8e` feat(ui): fixed-height auto-follow log, larger tree viewport, inline insert-mode toggle
- `0c88aa7` fix(toggle): proper on/off visuals with synced gradient transition and full knob travel
- `83cd6a2` fix(toggle): center knob, move fully right on ON, and keep text unobstructed
- `c968920` feat(demo): add skip control for animated search/insert and collapsible Q&A

## Notes for future continuation
- If future UX requests arrive, keep priority on:
  1) demo clarity,
  2) no layout drift,
  3) fast “skip to result” controls for teaching sessions.
- If adding more controls, keep them in the existing minimalist visual language.
