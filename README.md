# BST Visual Lab (Single-Page, Client-Side)

An Apple-like minimal single-page website to explain and demonstrate Binary Search Tree (BST) search logic.

## What this page includes

- **Slide-context announcement card** (midterm/review reminder + learning goal)
- **Concept explanation**:
  - Why general binary tree / heap are inefficient for arbitrary search
  - Binary search idea from sorted array
  - Mapping that idea to BST (left < node < right)
- **Interactive BST demo**:
  - Insert numbers to build/modify BST
  - Search a target with **step-by-step traversal log**
  - Visual highlight for visited/found/miss nodes
  - Complexity intuition panel: `O(h)`, balanced ~ `O(log n)`, skewed worst `O(n)`
- **Quick checkpoint quiz** section
- **Preloaded sample tree**: `50, 30, 70, 20, 40, 60, 80`

## Run

No build tools needed.

1. Open `index.html` directly in your browser.
2. Or from terminal in this folder:
   - macOS: `open index.html`

## Files

- `index.html` — page structure and section content
- `styles.css` — Apple-like visual style (whitespace, glass cards, soft shadows, smooth transitions)
- `script.js` — BST logic + rendering + step-by-step traversal animation

## Notes

- Fully client-side (HTML/CSS/JS only)
- Duplicates are ignored when inserting
- Works best in modern browsers (Chrome/Safari/Edge/Firefox)
