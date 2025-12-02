/* ------------------------ CHECKLIST DATA ------------------------ */

const DATA = [
  ["Minimaliseer niet-essentiële content", "Heldere navigatie & formulieren", "Minder tijd nodig = duurzamer"],
  ["Gebruik alleen efficiënte scripts", "Verminder JavaScript / rommel", "Gebruik open source waar mogelijk"],
  ["Optimaliseer afbeeldingen", "Gebruik lazy loading", "Verminder video-gebruik"],
  ["Groene hosting", "Overweeg statische sites / CDN", "Plan een cleaning dag"],
  ["Gebruik systeemfonts", "Vermijd zware contrasten", "Gebruik energiezuinige kleuren"]
];

/* ------------------------ CONFIG ------------------------ */

const slices = 15;
const GAP = 1.6; // degrees between slices (adjustable)
const cx = 300, cy = 300, r = 280;

const colors = [
  "#e9e842", "#e5c143", "#ad8430", //yellow
  "#005234", "#04744d", "#1ea16c", //green
  "#510d33", "#6d2148", "#8d306b", //purple
  "#fba327", "#fdba21", "#fdca9e", //orange
  "#1d1d1e", "#58585a", "#9b9da0", //black
];

const badge = document.getElementById("badge");

/* ------------------------ GEOMETRY HELPERS ------------------------ */

// Convert polar → cartesian
function polarToCartesian(cx, cy, r, angle) {
  const rad = angle * Math.PI / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

// Slice shape with angular gap built in
function createSlicePath(cx, cy, r, startAngle, endAngle) {
  const start = startAngle + GAP / 2;
  const end = endAngle - GAP / 2;

  const [x1, y1] = polarToCartesian(cx, cy, r, start);
  const [x2, y2] = polarToCartesian(cx, cy, r, end);
  const largeArc = end - start <= 180 ? 0 : 1;

  return `M ${cx} ${cy}
          L ${x1} ${y1}
          A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}
          Z`;
}

/* ------------------------ PATTERN GENERATION ------------------------ */

function updateSlicePattern(sliceIndex) {

  /* --- Determine which category this slice belongs to --- */
  // 5 categories × each category = 3 slices
  const category = Math.floor(sliceIndex / 3);

  /* Count how many of the 3 checklist items in this category are checked */
  let checks = 0;
  for (let i = 0; i < 3; i++) {
    const key = `${i}-${category}`;
    if (localStorage.getItem(key) === "1") checks++;
  }
  console.log('checks for slice', sliceIndex, ':', checks);

  /* --- Map checked items to visual parameters --- */
  // You can tune these values to taste
  const dynamicGap = [3.0, 2.0, 1.1, 0.4][checks];          // degrees
  const ringCount = [2, 3, 4, 5][checks];              // more rings = smaller cells
  const angularSteps = [2, 3, 4, 5][checks];             // more angular divisions
  const density = [0.25, 0.38, 0.50, 0.68][checks];         // chance a cell gets filled

  for (let ri = 0; ri < ringCount; ri++) {
    const innerR = (ri / ringCount) * r;
    const outerR = ((ri + 1) / ringCount) * r;

    for (let ai = 0; ai < angularSteps; ai++) {
      let opacity = 1.0;
      if (Math.random() >= density || checks === 0) {
        opacity = 0.0;
      }

      const cellId = `slice-${sliceIndex}-cell-${ri}-${ai}`;
      const cell = document.getElementById(cellId);
      if (cell) {
        cell.setAttribute("opacity", opacity);
      } else {
        console.log('no cell!');
      }
    }
  }
}


/* ------------------------ PATTERN FOR UNCHECKED SLICES ------------------------ */

function generateSlicePattern(sliceIndex, color) {

  // const color = "gray"; // base neutral color

  // Extremely low density + huge cells to feel “empty”
  const ringCount = 2;
  const angularSteps = 2;
  const density = 0.12;       // only 12% of cells filled → very holey look
  const dynamicGap = 3.5;     // bigger gaps between slices

  const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
  group.setAttribute("id", `slice-${sliceIndex}`);

  const rawStart = -90 + sliceIndex * (360 / slices);
  const rawEnd = rawStart + 360 / slices;

  /* --- CLIP PATH --- */
  const clip = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
  clip.setAttribute("id", `clip-empty-${sliceIndex}`);

  const clipPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  clipPath.setAttribute("d", createSlicePath(cx, cy, r, rawStart, rawEnd));
  clip.appendChild(clipPath);
  badge.appendChild(clip);

  const container = document.createElementNS("http://www.w3.org/2000/svg", "g");
  container.setAttribute("clip-path", `url(#clip-empty-${sliceIndex})`);

  /* --- POLAR GRID WITH VERY LARGE CELLS --- */
  const angleSpan = (rawEnd - rawStart) - dynamicGap;
  const angleStart = rawStart + dynamicGap / 2;

  for (let ri = 0; ri < ringCount; ri++) {
    const innerR = (ri / ringCount) * r;
    const outerR = ((ri + 1) / ringCount) * r;

    for (let ai = 0; ai < angularSteps; ai++) {

      const a1 = angleStart + (ai / angularSteps) * angleSpan;
      const a2 = angleStart + ((ai + 1) / angularSteps) * angleSpan;

      const [x1, y1] = polarToCartesian(cx, cy, innerR, a1);
      const [x2, y2] = polarToCartesian(cx, cy, outerR, a1);
      const [x3, y3] = polarToCartesian(cx, cy, outerR, a2);
      const [x4, y4] = polarToCartesian(cx, cy, innerR, a2);

      const largeArc = (a2 - a1) <= 180 ? 0 : 1;

      const cellPath = `
          M ${x1} ${y1}
          L ${x2} ${y2}
          A ${outerR} ${outerR} 0 ${largeArc} 1 ${x3} ${y3}
          L ${x4} ${y4}
          A ${innerR} ${innerR} 0 ${largeArc} 0 ${x1} ${y1}
          Z
        `;

      const cell = document.createElementNS("http://www.w3.org/2000/svg", "path");
      cell.id = `slice-${sliceIndex}-cell-${ri}-${ai}`;
      cell.classList.add("sliceSection");
      cell.setAttribute("d", cellPath.trim());
      cell.setAttribute("fill", color); // lighter gray for incomplete
      cell.setAttribute("opacity", 0.0);
      container.appendChild(cell);
    }
  }

  /* OUTLINE */
  const outline = document.createElementNS("http://www.w3.org/2000/svg", "path");
  outline.setAttribute("d", createSlicePath(cx, cy, r, rawStart, rawEnd));
  outline.setAttribute("fill", "none");
  outline.setAttribute("stroke", "black");
  outline.setAttribute("stroke-width", "1.3");

  group.appendChild(container);
  group.appendChild(outline);

  return group;
}


/* ------------------------ BADGE DRAWING ------------------------ */

function drawBadge() {
  badge.innerHTML = "";
  for (let i = 0; i < slices; i++) {
    const start = i * (360 / slices) - 90;
    const end = (i + 1) * (360 / slices) - 90;

    const pathData = createSlicePath(cx, cy, r, start, end);

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathData);
    path.setAttribute("fill", "gray");
    path.setAttribute("stroke", "black");
    path.setAttribute("stroke-width", "1.3");
    path.setAttribute("id", `slice-${i}`);

    badge.appendChild(path);
  }
}

/* ------------------------ CHECKLIST ------------------------ */

const checklist = document.getElementById("checklist");

const categoriesList = ["Content + UX", "Code + Techniek", "Beeld + Media", "Hosting + Int", "Typografie + Kleur"]
const sectionAngle = 360 / categoriesList.length
function renderChecklist() {
  checklist.innerHTML = "";
  DATA.forEach((col, c) => {
    const div = document.createElement("div");
    div.className = "category";
    div.innerHTML = `<div class="title">${categoriesList[c]}</div>`;
    col.forEach((text, r) => {
      const key = `${r}-${c}`;
      const checked = localStorage.getItem(key) === "1";
      div.innerHTML += `<label class="item">
        <input type="checkbox" data-group-index="${c}" data-key="${key}" ${checked ? "checked" : ""}/>
        ${text}
      </label>`;
    });
    checklist.appendChild(div);
  });

  document.querySelectorAll("input[data-key]").forEach(cb => {
    cb.addEventListener("change", () => {
      localStorage.setItem(cb.dataset.key, cb.checked ? "1" : "0");
      const currentRotation = parseFloat(badge.style.rotate) || 0;
      const targetRotation = cb.dataset.groupIndex * (360 / slices);
      const delta = ((targetRotation - currentRotation + 540) % 360) - 180;
      if (delta > 0) { // TODO: fix rotation direction properly; should take the fastest direction
        badge.style.rotate = `${((cb.dataset.groupIndex * -sectionAngle) - (sectionAngle / 2))}deg`;
      } else {
        badge.style.rotate = `${((cb.dataset.groupIndex * -sectionAngle) - (sectionAngle / 2))}deg`;
      }
      updateSlicePattern(cb.dataset.groupIndex * 3);
      updateSlicePattern(cb.dataset.groupIndex* 3 + 1);
      updateSlicePattern(cb.dataset.groupIndex * 3 + 2);
      // updateBadge();
    });
  });
}

/* ------------------------ CREATE BADGE ------------------------ */

function createBadge() {
  let everythingChecked = true; // assume true

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 5; c++) {
      const index = r + c * 3;
      const key = `${r}-${c}`;
      const on = localStorage.getItem(key) === "1";


      // if (on) {
      //   badge.appendChild(generateSlicePattern(index, colors[index]));
      // } else {
      badge.appendChild(generateSlicePattern(index, colors[index]));
      // }
    }
  }

  /* ---- SPINNING LOGIC ---- */
  // if (everythingChecked) {
  //   badge.classList.add("spinning");
  // } else {
  //   badge.classList.remove("spinning");
  // }
}

/* ------------------------ UPDATE BADGE ------------------------ */

function updateBadge() {

  let everythingChecked = true; // assume true

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 5; c++) {
      const index = r + c * 3;
      const key = `${r}-${c}`;
      const on = localStorage.getItem(key) === "1";
      const slice = document.getElementById(`slice-${index}`);
      updateSlicePattern(index);
      /*
      if (on) {
        badge.appendChild(generateSlicePattern(index, colors[index]));
      } else {
        badge.appendChild(generateEmptySlicePattern(index));
      }
      */
    }
  }

  /* ---- SPINNING LOGIC ---- */
  // if (everythingChecked) {
  //   badge.classList.add("spinning");
  // } else {
  //   badge.classList.remove("spinning");
  // }
}


/* ------------------------ RESET ------------------------ */

document.getElementById("resetBtn").onclick = () => {
  if (confirm("Reset badge?")) {
    localStorage.clear();
    drawBadge();
    renderChecklist();
    updateBadge();
  }
};

/* ------------------------ INIT ------------------------ */

// drawBadge();
renderChecklist();
createBadge();
updateBadge();
