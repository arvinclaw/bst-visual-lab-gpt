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
    return this.insertWithPath(value).inserted;
  }

  insertWithPath(value) {
    if (Number.isNaN(value)) return { inserted: false, duplicate: false, path: [], newNode: null };

    const newNode = new Node(value);
    if (!this.root) {
      this.root = newNode;
      return { inserted: true, duplicate: false, path: [], newNode };
    }

    const path = [];
    let cur = this.root;
    while (cur) {
      if (value === cur.value) {
        return { inserted: false, duplicate: true, path, newNode: null };
      }

      if (value < cur.value) {
        path.push({ node: cur, decision: "left" });
        if (!cur.left) {
          cur.left = newNode;
          return { inserted: true, duplicate: false, path, newNode };
        }
        cur = cur.left;
      } else {
        path.push({ node: cur, decision: "right" });
        if (!cur.right) {
          cur.right = newNode;
          return { inserted: true, duplicate: false, path, newNode };
        }
        cur = cur.right;
      }
    }

    return { inserted: false, duplicate: false, path, newNode: null };
  }

  getHeight(node = this.root) {
    if (!node) return 0;
    return 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
  }

  countNodes(node = this.root) {
    if (!node) return 0;
    return 1 + this.countNodes(node.left) + this.countNodes(node.right);
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
const treeWrap = document.getElementById("treeWrap");
const insertInput = document.getElementById("insertInput");
const insertBtn = document.getElementById("insertBtn");
const insertModeToggle = document.getElementById("insertModeToggle");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const resetBtn = document.getElementById("resetBtn");
const clearTraceBtn = document.getElementById("clearTraceBtn");
const zoomInBtn = document.getElementById("zoomInBtn");
const zoomOutBtn = document.getElementById("zoomOutBtn");
const zoomResetBtn = document.getElementById("zoomResetBtn");
const zoomValue = document.getElementById("zoomValue");
const traceList = document.getElementById("traceList");
const heightValue = document.getElementById("heightValue");
const stepsValue = document.getElementById("stepsValue");
const complexityValue = document.getElementById("complexityValue");

let nodePositions = new Map();
let currentHighlights = [];
let isBusy = false;
let zoomLevel = 1;
let currentLayout = { width: 1200, height: 500 };

const MIN_ZOOM = 0.35;
const MAX_ZOOM = 2.2;
const SOFT_NODE_LIMIT = 35;

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
  let maxDepth = 0;

  function inorder(node, depth = 0) {
    if (!node) return;
    inorder(node.left, depth + 1);
    nodes.push({ node, depth });
    maxDepth = Math.max(maxDepth, depth);
    inorder(node.right, depth + 1);
  }

  inorder(bst.root);

  const width = Math.max(980, (nodes.length + 1) * 72);
  const yBase = 68;
  const yStep = 82;
  const height = Math.max(500, yBase + (maxDepth + 1) * yStep + 50);
  const xStep = width / (nodes.length + 1 || 1);

  nodePositions = new Map();
  nodes.forEach((entry, i) => {
    nodePositions.set(entry.node.id, {
      x: xStep * (i + 1),
      y: yBase + entry.depth * yStep,
      node: entry.node,
      depth: entry.depth,
    });
  });

  return { width, height, maxDepth, count: nodes.length };
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

function centerTreeInViewport() {
  if (!treeWrap) return;

  const maxLeft = Math.max(0, treeWrap.scrollWidth - treeWrap.clientWidth);
  const maxTop = Math.max(0, treeWrap.scrollHeight - treeWrap.clientHeight);

  treeWrap.scrollLeft = Math.max(0, Math.min(maxLeft, Math.round(maxLeft / 2)));
  treeWrap.scrollTop = Math.max(0, Math.min(maxTop, Math.round(maxTop / 2)));
}

function autoFitZoom() {
  if (!treeWrap) return;

  const availableW = Math.max(1, treeWrap.clientWidth - 18);
  const availableH = Math.max(1, treeWrap.clientHeight - 18);
  const fitScale = Math.min(availableW / currentLayout.width, availableH / currentLayout.height);

  // Auto-fit focuses on keeping full tree visible during insertion; avoid auto-upscaling past 100%.
  zoomLevel = Math.max(MIN_ZOOM, Math.min(1, fitScale));
}

function applyZoom(shouldCenter = false) {
  const scaledWidth = Math.round(currentLayout.width * zoomLevel);
  const scaledHeight = Math.round(currentLayout.height * zoomLevel);
  svg.style.width = `${scaledWidth}px`;
  svg.style.height = `${scaledHeight}px`;
  zoomValue.textContent = `${Math.round(zoomLevel * 100)}%`;

  if (shouldCenter) {
    requestAnimationFrame(centerTreeInViewport);
  }
}

function renderTree(options = {}) {
  const { shouldCenter = true, autoFit = false } = options;

  clearSvg();
  currentLayout = calculateLayout();

  svg.setAttribute("viewBox", `0 0 ${currentLayout.width} ${currentLayout.height}`);
  svg.setAttribute("width", String(currentLayout.width));
  svg.setAttribute("height", String(currentLayout.height));

  drawEdges(bst.root);
  drawNodes(bst.root);

  if (autoFit) autoFitZoom();
  applyZoom(shouldCenter);
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
  const traceBox = traceList.closest(".trace");
  if (traceBox) traceBox.scrollTop = 0;
  clearHighlight();
  updateStats("-", "-");
}

function appendTrace(text, autoFollow = true) {
  const li = document.createElement("li");
  li.textContent = text;
  traceList.appendChild(li);

  if (autoFollow) {
    const traceBox = traceList.closest(".trace");
    if (traceBox) traceBox.scrollTop = traceBox.scrollHeight;
  }
}

function complexityHint(height, steps) {
  const nodeCount = bst.countNodes();
  if (height <= 0 || steps <= 0 || nodeCount <= 0) return "-";
  const balancedThreshold = Math.ceil(Math.log2(nodeCount + 1));
  if (height <= balancedThreshold + 1) {
    return `Likely near balanced: search ≈ O(log n), actual steps: ${steps}`;
  }
  return `Tree is getting skewed: search can drift toward O(n), actual steps: ${steps}`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function setBusy(next) {
  isBusy = next;
  [insertBtn, searchBtn, resetBtn, clearTraceBtn, zoomInBtn, zoomOutBtn, zoomResetBtn, insertModeToggle].forEach((el) => {
    if (el) el.disabled = next;
  });
}

async function runSearch() {
  if (isBusy) return;
  const target = Number(searchInput.value);
  if (Number.isNaN(target)) return;
  clearTrace();

  const result = bst.searchPath(target);
  if (!bst.root) {
    appendTrace("Tree is empty. Insert values first.");
    return;
  }

  setBusy(true);

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
  setBusy(false);
}

async function runInsertAnimated(values) {
  setBusy(true);
  let inserted = 0;

  for (const v of values) {
    clearHighlight();
    const result = bst.insertWithPath(v);

    if (!result.inserted) {
      appendTrace(`${v}: duplicate value, ignored.`);
      await sleep(250);
      continue;
    }

    inserted += 1;

    for (const step of result.path) {
      markNode(step.node.id, "visited");
      if (step.decision === "left") {
        appendTrace(`${step.node.value}: ${v} < ${step.node.value} → go LEFT`);
      } else {
        appendTrace(`${step.node.value}: ${v} > ${step.node.value} → go RIGHT`);
      }
      await sleep(420);
    }

    renderTree({ autoFit: true, shouldCenter: true });
    if (result.newNode) {
      markNode(result.newNode.id, "found");
    }

    if (result.path.length === 0) {
      appendTrace(`${v}: tree was empty, inserted as root.`);
    } else {
      appendTrace(`${v}: inserted successfully.`);
    }

    await sleep(380);
  }

  appendTrace(`Animated insertion completed: ${inserted}/${values.length} inserted.`);
  if (bst.countNodes() > SOFT_NODE_LIMIT) {
    appendTrace(`Tip: node count is ${bst.countNodes()}. For readability, keep it around ${SOFT_NODE_LIMIT} or less.`);
  }
  renderTree({ autoFit: true, shouldCenter: true });
  setBusy(false);
}

function runInsertInstant(values) {
  let inserted = 0;
  values.forEach((v) => {
    if (bst.insert(v)) inserted += 1;
  });
  appendTrace(`Inserted ${inserted}/${values.length} value(s). Duplicates are ignored.`);
  if (bst.countNodes() > SOFT_NODE_LIMIT) {
    appendTrace(`Tip: node count is ${bst.countNodes()}. For readability, keep it around ${SOFT_NODE_LIMIT} or less.`);
  }
  renderTree({ autoFit: true, shouldCenter: true });
}

insertBtn.addEventListener("click", async () => {
  if (isBusy) return;
  const values = parseNumbers(insertInput.value);
  if (!values.length) return;

  insertInput.value = "";
  if (insertModeToggle.checked) {
    await runInsertAnimated(values);
  } else {
    runInsertInstant(values);
  }
});

searchBtn.addEventListener("click", runSearch);

resetBtn.addEventListener("click", () => {
  if (isBusy) return;
  resetTree();
});

clearTraceBtn.addEventListener("click", () => {
  if (isBusy) return;
  clearTrace();
});

zoomInBtn.addEventListener("click", () => {
  zoomLevel = Math.min(MAX_ZOOM, +(zoomLevel + 0.1).toFixed(2));
  applyZoom(true);
});

zoomOutBtn.addEventListener("click", () => {
  zoomLevel = Math.max(MIN_ZOOM, +(zoomLevel - 0.1).toFixed(2));
  applyZoom(true);
});

zoomResetBtn.addEventListener("click", () => {
  zoomLevel = 1;
  applyZoom(true);
});

resetTree();
