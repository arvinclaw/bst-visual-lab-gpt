class Node {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.id = `n-${value}-${Math.random().toString(36).slice(2, 7)}`;
  }
}

class BST {
  constructor() {
    this.root = null;
  }

  insert(value) {
    if (Number.isNaN(value)) return false;
    const n = new Node(value);
    if (!this.root) {
      this.root = n;
      return true;
    }
    let cur = this.root;
    while (cur) {
      if (value === cur.value) return false;
      if (value < cur.value) {
        if (!cur.left) {
          cur.left = n;
          return true;
        }
        cur = cur.left;
      } else {
        if (!cur.right) {
          cur.right = n;
          return true;
        }
        cur = cur.right;
      }
    }
    return false;
  }

  getHeight(node = this.root) {
    if (!node) return 0;
    return 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
  }

  searchPath(target) {
    const path = [];
    let cur = this.root;
    while (cur) {
      if (target === cur.value) {
        path.push({ node: cur, decision: "found" });
        return { found: true, path };
      }
      if (target < cur.value) {
        path.push({ node: cur, decision: "left" });
        cur = cur.left;
      } else {
        path.push({ node: cur, decision: "right" });
        cur = cur.right;
      }
    }
    return { found: false, path };
  }
}

const SAMPLE = [50, 30, 70, 20, 40, 60, 80];
const bst = new BST();

const svg = document.getElementById("treeSvg");
const insertInput = document.getElementById("insertInput");
const insertBtn = document.getElementById("insertBtn");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const resetBtn = document.getElementById("resetBtn");
const clearTraceBtn = document.getElementById("clearTraceBtn");
const traceList = document.getElementById("traceList");
const heightValue = document.getElementById("heightValue");
const stepsValue = document.getElementById("stepsValue");
const complexityValue = document.getElementById("complexityValue");

let nodePositions = new Map();
let currentHighlights = [];

function resetTree() {
  bst.root = null;
  SAMPLE.forEach((v) => bst.insert(v));
  clearTrace();
  renderTree();
}

function parseNumbers(raw) {
  return raw
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => !Number.isNaN(n));
}

function clearSvg() {
  while (svg.firstChild) svg.removeChild(svg.firstChild);
}

function calculateLayout() {
  const nodes = [];
  function inorder(node, depth = 0) {
    if (!node) return;
    inorder(node.left, depth + 1);
    nodes.push({ node, depth });
    inorder(node.right, depth + 1);
  }
  inorder(bst.root);

  const width = 1200;
  const xStep = width / (nodes.length + 1 || 1);
  const yBase = 70;
  const yStep = 84;
  nodePositions = new Map();

  nodes.forEach((entry, i) => {
    nodePositions.set(entry.node.id, {
      x: xStep * (i + 1),
      y: yBase + entry.depth * yStep,
      node: entry.node,
      depth: entry.depth,
    });
  });
}

function drawEdges(node) {
  if (!node) return;
  const pos = nodePositions.get(node.id);
  [node.left, node.right].forEach((child) => {
    if (!child) return;
    const childPos = nodePositions.get(child.id);
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", pos.x);
    line.setAttribute("y1", pos.y);
    line.setAttribute("x2", childPos.x);
    line.setAttribute("y2", childPos.y);
    line.setAttribute("class", "edge");
    svg.appendChild(line);
  });
  drawEdges(node.left);
  drawEdges(node.right);
}

function drawNodes(node) {
  if (!node) return;
  const pos = nodePositions.get(node.id);
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("class", "node");
  g.setAttribute("data-node-id", node.id);

  const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  c.setAttribute("cx", pos.x);
  c.setAttribute("cy", pos.y);
  c.setAttribute("r", 20);

  const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
  t.setAttribute("x", pos.x);
  t.setAttribute("y", pos.y + 0.5);
  t.textContent = String(node.value);

  g.appendChild(c);
  g.appendChild(t);
  svg.appendChild(g);

  drawNodes(node.left);
  drawNodes(node.right);
}

function renderTree() {
  clearSvg();
  calculateLayout();
  drawEdges(bst.root);
  drawNodes(bst.root);
  updateStats();
}

function updateStats(lastSteps = "-", complexity = "-") {
  const h = bst.getHeight();
  heightValue.textContent = h;
  stepsValue.textContent = lastSteps;
  complexityValue.textContent = complexity;
}

function markNode(nodeId, cls) {
  const nodeEl = svg.querySelector(`[data-node-id="${nodeId}"]`);
  if (!nodeEl) return;
  nodeEl.classList.add(cls);
  currentHighlights.push({ nodeEl, cls });
}

function clearHighlight() {
  currentHighlights.forEach(({ nodeEl, cls }) => nodeEl.classList.remove(cls));
  currentHighlights = [];
}

function clearTrace() {
  traceList.innerHTML = "";
  clearHighlight();
  updateStats("-", "-");
}

function appendTrace(text) {
  const li = document.createElement("li");
  li.textContent = text;
  traceList.appendChild(li);
}

function complexityHint(height, steps) {
  if (height <= 0 || steps <= 0) return "-";
  const balancedThreshold = Math.ceil(Math.log2(SAMPLE.length + 8));
  if (height <= balancedThreshold + 1) {
    return `Likely near balanced: search ≈ O(log n), actual steps: ${steps}`;
  }
  return `Tree is getting skewed: search can drift toward O(n), actual steps: ${steps}`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runSearch() {
  const target = Number(searchInput.value);
  if (Number.isNaN(target)) return;
  clearTrace();

  const result = bst.searchPath(target);
  if (!bst.root) {
    appendTrace("Tree is empty. Insert values first.");
    return;
  }

  searchBtn.disabled = true;
  insertBtn.disabled = true;

  for (const step of result.path) {
    markNode(step.node.id, "visited");
    if (step.decision === "left") {
      appendTrace(`${step.node.value}: target ${target} < ${step.node.value} → go LEFT`);
    } else if (step.decision === "right") {
      appendTrace(`${step.node.value}: target ${target} > ${step.node.value} → go RIGHT`);
    } else {
      appendTrace(`${step.node.value}: target ${target} found ✅`);
    }
    await sleep(650);
  }

  if (result.found && result.path.length) {
    const finalNode = result.path[result.path.length - 1].node;
    markNode(finalNode.id, "found");
  } else if (result.path.length) {
    const lastNode = result.path[result.path.length - 1].node;
    markNode(lastNode.id, "miss");
    appendTrace(`Stopped at ${lastNode.value}; next child is null → target not found ❌`);
  } else {
    appendTrace("Tree is empty or no traversal happened.");
  }

  const steps = result.path.length;
  updateStats(steps, complexityHint(bst.getHeight(), steps));
  searchBtn.disabled = false;
  insertBtn.disabled = false;
}

insertBtn.addEventListener("click", () => {
  const values = parseNumbers(insertInput.value);
  if (!values.length) return;
  let inserted = 0;
  values.forEach((v) => {
    if (bst.insert(v)) inserted += 1;
  });
  appendTrace(`Inserted ${inserted}/${values.length} value(s). Duplicates are ignored.`);
  insertInput.value = "";
  renderTree();
});

searchBtn.addEventListener("click", runSearch);

resetBtn.addEventListener("click", resetTree);
clearTraceBtn.addEventListener("click", clearTrace);

resetTree();
