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

const canvas = document.getElementById("badge");
const ctx = canvas.getContext("2d");
ctx.clearRect(0, 0, canvas.width, canvas.height);
ctx.fillStyle = "#ffffff";
ctx.fillRect(0, 0, canvas.width, canvas.height);

const gapBetweenSlices = 4; // degrees between slices
const cx = canvas.width / 2;
const cy = canvas.height / 2;
const r = canvas.height / 2 - 10; // radius of badge
const numRings = 5; // number of rings per slice
const maxNumSubSlices = 5; // max number of subslices per ring
const centerHoleRadius = 20;


const totalSlices = sectionsData.reduce((sum, section) => sum + section.items.length, 0);
const sliceAngle = 360 / totalSlices;
let rotationAngle = 0;
let rotationTarget = 0;
let colorOffset = 0;
let colorOffsetDir = 1;


/* ------------------------ COLOR HELPERS ------------------------ */
const calculateTintAndShade = (hexColor, percentage = 0.1) => {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  const tintR = Math.round(Math.min(255, r + (255 - r) * percentage));
  const tintG = Math.round(Math.min(255, g + (255 - g) * percentage));
  const tintB = Math.round(Math.min(255, b + (255 - b) * percentage));

  const shadeR = Math.round(Math.max(0, r - r * percentage));
  const shadeG = Math.round(Math.max(0, g - g * percentage));
  const shadeB = Math.round(Math.max(0, b - b * percentage));

  return {
    tint: {
      r: tintR,
      g: tintG,
      b: tintB,
      hex:
        '#' +
        [tintR, tintG, tintB]
          .map(x => x.toString(16).padStart(2, '0'))
          .join(''), // #7547a3
    },
    shade: {
      r: shadeR,
      g: shadeG,
      b: shadeB,
      hex:
        '#' +
        [shadeR, shadeG, shadeB]
          .map(x => x.toString(16).padStart(2, '0'))
          .join(''), // #5c2e8a
    },
  };
};

let colorIdx = 0;
let colorOffsets = [];
for (let i = 0; i < totalSlices * maxNumSubSlices; i++) {
  colorOffsets.push(Math.random() * 0.2);
}
/* ------------------------ GEOMETRY HELPERS ------------------------ */

function polarToCartesian(cx, cy, r, angle) {
  const rad = angle * Math.PI / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

function drawSlice(cx, cy, r, color, rotationDegrees, groupIndex, sliceIndex) {

  if (checkedList[groupIndex][sliceIndex] === false) {
    ctx.rotate(rotationDegrees * Math.PI / 180); // still rotate for next slice even if not drawn
    return; // skip drawing if not checked
  }

  const ringThickness = (r - centerHoleRadius) / numRings;
  for (let n = 0; n < numRings; n++) { // don't draw the innermost ring so we get a round hole
    const numSubSlices = maxNumSubSlices - n; // fewer subslices in inner rings
    const sliceAngleWithoutGaps = sliceAngle - gapBetweenSlices;
    const subSliceAngle = sliceAngleWithoutGaps / numSubSlices;
    for (let i = 0; i < numSubSlices; i++) {
      colorIdx++;
      if (colorIdx >= colorOffsets.length) {
        colorIdx = 0;
      }
      const start = -90 - sliceAngleWithoutGaps / 2 + i * subSliceAngle;
      const end = start + subSliceAngle;

      const [x1, y1] = polarToCartesian(0, 0, r, start);
      const [x2, y2] = polarToCartesian(0, 0, r, end);

      ctx.beginPath();
      ctx.arc(0, 0, r - n * ringThickness, (start * Math.PI) / 180, (end * Math.PI) / 180);
      ctx.arc(0, 0, r - (n + 1) * ringThickness, (end * Math.PI) / 180, (start * Math.PI) / 180, true);

      ctx.closePath();
      const tintedColor = calculateTintAndShade(color, colorOffsets[colorIdx] + colorOffset).shade.hex;
      ctx.fillStyle = tintedColor;
      ctx.fill();
      ctx.strokeStyle = tintedColor;
      ctx.stroke();
    }
  }
  // Rotate for then next slice
  ctx.rotate(rotationDegrees * Math.PI / 180);
}

/* ------------------------ BADGE DRAWING ------------------------ */

function drawBadge() {
  // ctx.clearRect(0, 0, canvas.width, canvas.height);
  // ctx.fillStyle = "#ffffff";
  // ctx.fillRect(0, 0, canvas.width, canvas.height);

  // let sliceIndex = 0;
  // sectionsData.forEach((section) => {
  //   section.items.forEach((item) => {
  //     const start = sliceIndex * sliceAngle - 90;
  //     const end = (sliceIndex + 1) * sliceAngle - 90;
  //     drawSlice(cx, cy, r, start, end, item.color);
  //     sliceIndex++;
  //   });
  // });
}

/* ------------------------ CHECKLIST ------------------------ */
let checkedList = [];
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
            <input type="checkbox" data-group-index="${sectionIndex}" data-slice-index="${r}" data-key="${key}" ${checked ? "checked" : ""}/>
          </span>
        ${item.title}
      </label>`;
    });
    checklist.appendChild(div);
  });

  for (let sectionIndex = 0; sectionIndex < sectionsData.length; sectionIndex++) {
    const section = sectionsData[sectionIndex];
    checkedList[sectionIndex] = [false, false, false];
    for (let itemIndex = 0; itemIndex < section.items.length; itemIndex++) {
      const key = `${itemIndex}-${sectionIndex}`;
      const checked = localStorage.getItem(key) === "1";
      if (checked) {
        checkedList[sectionIndex][itemIndex] = true;
      }
    }
  }

  document.querySelectorAll("input[data-key]").forEach(cb => {
    cb.addEventListener("change", () => {
      localStorage.setItem(cb.dataset.key, cb.checked ? "1" : "0");
      checkedList[cb.dataset.groupIndex][cb.dataset.sliceIndex] = cb.checked;
      const rotationIndex = parseInt(cb.dataset.groupIndex) * 3 + parseInt(cb.dataset.sliceIndex);
      rotationTarget = rotationIndex * -sliceAngle;
      console.log('rotationTarget: ', rotationTarget)
      updateBadge();
    });
  });
}


/* ------------------------ UPDATE BADGE ------------------------ */

function updateBadge() {
  drawBadge();
  let sliceIndex = 0;
  sectionsData.forEach((section, sectionIndex) => {
    section.items.forEach((item, itemIndex) => {
      const key = `${itemIndex}-${sectionIndex}`;
      const checked = localStorage.getItem(key) === "1";
      const start = sliceIndex * sliceAngle - 90;
      const end = (sliceIndex + 1) * sliceAngle - 90;
      // drawSlice(cx, cy, r, start, end, checked ? item.color : "gray");
      sliceIndex++;
    });
  });
}

/* ------------------------ INIT ------------------------ */

// Track mouse position globally
window.mouseX = 0;
window.addEventListener("mousemove", (event) => {
  window.mouseX = event.clientX;
});

renderChecklist();
drawBadge();
updateBadge();


function rotateBadge() {
  colorIdx = 0;
  if (rotationAngle !== rotationTarget) {
    const diff = rotationTarget - rotationAngle;
    if (Math.abs(diff) < 0.1) {
      rotationAngle = rotationTarget; // Snap to target if close enough
    } else {
      // Determine the shortest rotation direction
      const normalizedDiff = ((rotationTarget - rotationAngle) + 360) % 360;
      const shortestRotation = normalizedDiff > 180 ? normalizedDiff - 360 : normalizedDiff;
      rotationAngle += shortestRotation * 0.05; // Ease towards the target
    }
  }

  colorOffset += 0.001 * colorOffsetDir;
  if (colorOffset >= 0.2 || colorOffset <= 0) {
    colorOffsetDir *= -1;
  }


  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((rotationAngle * Math.PI) / 180);

  let sliceIndex = 0;
  const totalSlices = sectionsData.reduce((sum, section) => sum + section.items.length, 0);
  const sliceAngleDegrees = 360 / totalSlices;

  sectionsData.forEach((section, i) => {
    section.items.forEach((item, n) => {
      drawSlice(cx, cy, r, item.color, sliceAngleDegrees, i, n);
      sliceIndex++;
    });
  });
  ctx.restore();

  requestAnimationFrame(rotateBadge);
}

rotateBadge();
