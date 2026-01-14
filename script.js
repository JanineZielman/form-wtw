/* ------------------------ CHECKLIST DATA ------------------------ */

const sectionsData = [
  {
    name: "Content + UX",
    items: [
      { title: "Minimaliseer niet-essentiële content", color: "#e9e842", state: "off" },
      { title: "Heldere navigatie & formulieren", color: "#e9e842", state: "off" },
      { title: "Minder tijd nodig = duurzamer", color: "#e9e842", state: "off" }
    ]
  },
  {
    name: "Code + Techniek",
    items: [
      { title: "Gebruik alleen efficiënte scripts", color: "#1ea16c", state: "off" },
      { title: "Verminder JavaScript / rommel", color: "#1ea16c", state: "off" },
      { title: "Gebruik open source waar mogelijk", color: "#1ea16c", state: "off" }
    ]
  },
  {
    name: "Beeld + Media",
    items: [
      { title: "Optimaliseer afbeeldingen", color: "#8d306b", state: "off" },
      { title: "Gebruik lazy loading", color: "#8d306b", state: "off" },
      { title: "Verminder video-gebruik", color: "#8d306b", state: "off" }
    ]
  },
  {
    name: "Hosting + Infra",
    items: [
      { title: "Groene hosting", color: "#fba327", state: "off" },
      { title: "Overweeg statische sites / CDN", color: "#fba327", state: "off" },
      { title: "Plan een cleaning dag", color: "#fba327", state: "off" }
    ]
  },
  {
    name: "Typografie + Kleur",
    items: [
      { title: "Gebruik systeemfonts", color: "#9b9da0", state: "off" },
      { title: "Vermijd zware contrasten", color: "#9b9da0", state: "off" },
      { title: "Gebruik energiezuinige kleuren", color: "#9b9da0", state: "off" }
    ]
  }
];

/* ------------------------ CONFIG ------------------------ */

const totalSlices = sectionsData.reduce((sum, section) => sum + section.items.length, 0);
const sliceAngle = 360 / totalSlices;

let allSelected = checkAllSelected();
const gapBetweenSlices = 6; // degrees between slices
const cx = 300, cy = 300, r = 280; // badge center and radius
const badge = document.getElementById("badge");

// Slice pattern settings
const ringCount = 6;      // number of concentric rings
const angularSteps = 3;   // number of angular divisions per slice
const density = 0.12;     // only 12% of cells filled → very holey look
const dynamicGap = 3.5;   // bigger gaps between slices
const ringGap = 4;        // gap inbetween rings on the same slice


/* ------------------------ GEOMETRY HELPERS ------------------------ */

function checkAllSelected() {
  return sectionsData.filter((section) => section.items.every((item) => item.state === "on")).length === sectionsData.length;
}
// Convert polar → cartesian
function polarToCartesian(cx, cy, r, angle) {
  const rad = angle * Math.PI / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

// Slice shape with angular gap built in
function createSlicePath(cx, cy, r, startAngle, endAngle) {
  const start = startAngle + gapBetweenSlices / 2;
  const end = endAngle - gapBetweenSlices / 2;

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
      // let opacity = 1.0;
      // if (checks === 0) {
      //   opacity = 0.0;
      // } else {
      //   //   opacity = Math.min(1.0, 0.2 + Math.random());
      // }

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

  const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
  group.setAttribute("id", `slice-${sliceIndex}`);

  const rawStart = -90 + sliceIndex * sliceAngle;
  const rawEnd = rawStart + sliceAngle;

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
    const outerR = ((ri + 1) / ringCount) * r - ringGap;

    let angularSteps = ri;

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
      cell.setAttribute("stroke", color); // lighter gray for incomplete
      cell.setAttribute("fill", color); // lighter gray for incomplete
      // cell.setAttribute("opacity", 0.0);
      cell.setAttribute("opacity", Math.random());
      container.appendChild(cell);
    }
  }

  /* OUTLINE */
  // const outline = document.createElementNS("http://www.w3.org/2000/svg", "path");
  // outline.setAttribute("d", createSlicePath(cx, cy, r, rawStart, rawEnd));
  // outline.setAttribute("fill", "none");
  // outline.setAttribute("stroke", "black");
  // outline.setAttribute("stroke-width", "1.3");

  group.appendChild(container);
  // group.appendChild(outline);

  return group;
}


/* ------------------------ BADGE DRAWING ------------------------ */

function drawBadge() {
  badge.innerHTML = "";
  for (let i = 0; i < totalSlices; i++) {
    const start = i * (360 / totalSlices) - 90;
    const end = (i + 1) * (360 / totalSlices) - 90;

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
function renderChecklist() {
  checklist.innerHTML = "";
  sectionsData.forEach((section, sectionIndex) => {
    const div = document.createElement("div");
    div.className = "category";
    div.innerHTML = `<div class="title">${section.name}</div>`;
    section.items.forEach((item, r) => {
      const key = `${r}-${sectionIndex}`;
      const checked = localStorage.getItem(key) === "1";
      div.innerHTML += `<label class="item">
          <span class="checkbox-container">
            <input type="checkbox" data-group-index="${sectionIndex}" data-key="${key}" ${checked ? "checked" : ""}/>
          </span>
        ${item.title}
      </label>`;
    });
    checklist.appendChild(div);
  });

  document.querySelectorAll("input[data-key]").forEach(cb => {
    cb.addEventListener("change", () => {
      localStorage.setItem(cb.dataset.key, cb.checked ? "1" : "0");
      const currentRotation = parseFloat(badge.style.rotate) || 0;
      const targetRotation = cb.dataset.groupIndex * (360 / totalSlices);
      const delta = ((targetRotation - currentRotation + 540) % 360) - 180;
      if (delta > 0) { // TODO: fix rotation direction properly; should take the fastest direction
        badge.style.rotate = `${((cb.dataset.groupIndex * -sliceAngle) - (sliceAngle / 2))}deg`;
      } else {
        badge.style.rotate = `${((cb.dataset.groupIndex * -sliceAngle) - (sliceAngle / 2))}deg`;
      }
      // updateSlicePattern(cb.dataset.groupIndex * 3);
      // updateSlicePattern(cb.dataset.groupIndex * 3 + 1);
      // updateSlicePattern(cb.dataset.groupIndex * 3 + 2);
      updateBadge();
    });
  });
}

/* ------------------------ CREATE BADGE ------------------------ */
function createBadge() {
  sectionsData.forEach((section, sectionIndex) => {
    section.items.forEach((item, itemIndex) => {
      const key = `${itemIndex}-${sectionIndex}`;
      // Todo: length of 3 is hardcoded. Might be fine if we don't update the checklist anymore,
      // otherwise we should make this dynamic.
      badge.appendChild(generateSlicePattern((sectionIndex * 3) + itemIndex, item.color));
    });
  });

  // const centerCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  // centerCircle.setAttribute("cx", cx);
  // centerCircle.setAttribute("cy", cy);
  // centerCircle.setAttribute("r", 20); // Adjust radius as needed
  // centerCircle.setAttribute("fill", "#313030"); // White fill
  // badge.appendChild(centerCircle);
}

/* ------------------------ UPDATE BADGE ------------------------ */

function updateBadge() {
  let everythingChecked = true; // assume true
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 5; c++) {
      const index = r + c * 3;
      const key = `${r}-${c}`;
      const on = localStorage.getItem(key) === "1";
      console.log('on: ', on)
      console.log('is on? ', on);
      if (!on) {
        everythingChecked = false;
      }
      const slice = document.getElementById(`slice-${index}`);
      updateSlicePattern(index);
    }
  }

  /* ---- SPINNING LOGIC ---- */
  if (everythingChecked) {
    console.log('everything checked! spinning badge.');
    badge.classList.add("spinning");
  } else {
    console.log('not everything checked. stop spinning.');
    badge.classList.remove("spinning");
  }
}


/* ------------------------ RESET ------------------------ */

// document.getElementById("resetBtn").onclick = () => {
//   if (confirm("Reset badge?")) {
//     localStorage.clear();
//     drawBadge();
//     renderChecklist();
//     updateBadge();
//   }
// };

/* ------------------------ INIT ------------------------ */

// drawBadge();
renderChecklist();
createBadge();
updateBadge();
