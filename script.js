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

const gapBetweenSlices = 2; // degrees between slices
const cx = canvas.width / 2;
const cy = canvas.height / 2;
const r = canvas.height / 2 - 10; // radius of badge
const numRings = 8; // number of rings per slice
const numSubSlices = 3; // number of subslices per ring
const centerHoleRadius = 10;


const totalSlices = sectionsData.reduce((sum, section) => sum + section.items.length, 0);
const sliceAngle = 360 / totalSlices;
let rotationAngle = 0;
let rotationTarget = 0;



/* ------------------------ COLOR HELPERS ------------------------ */
const calculateTintAndShade = (
  hexColor, // using #663399 as an example
  percentage = 0.1 // using 10% as an example
) => {
  const r = parseInt(hexColor.slice(1, 3), 16); // r = 102
  const g = parseInt(hexColor.slice(3, 5), 16); // g = 51
  const b = parseInt(hexColor.slice(5, 7), 16); // b = 153

  /*
     From this part, we are using our two formulas
     in this case, here is the formula for tint,
     please be aware that we are performing two validations
     we are using Math.min to set the max level of tint to 255,
     so we don't get values like 280 ;)
     also, we have the Math.round so we don't have values like 243.2
     both validations apply for both tint and shade as you can see */
  const tintR = Math.round(Math.min(255, r + (255 - r) * percentage)); // 117
  const tintG = Math.round(Math.min(255, g + (255 - g) * percentage)); // 71
  const tintB = Math.round(Math.min(255, b + (255 - b) * percentage)); // 163


  const shadeR = Math.round(Math.max(0, r - r * percentage)); // 92
  const shadeG = Math.round(Math.max(0, g - g * percentage)); // 46
  const shadeB = Math.round(Math.max(0, b - b * percentage)); // 138


  /*
     Now with all the values calculated, the only missing stuff is
     getting our color back to hexadecimal, to achieve that, we are going
     to perform a toString(16) on each value, so we get the hex value
     for each color, and then we just append each value together and voilà!*/
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

/* ------------------------ GEOMETRY HELPERS ------------------------ */

function polarToCartesian(cx, cy, r, angle) {
  const rad = angle * Math.PI / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

function drawSlice(cx, cy, r, color, rotation, groupIndex, sliceIndex) {
  // console.log('color: ', color)
  // const start = startAngle + gapBetweenSlices / 2;
  // const end = endAngle - gapBetweenSlices / 2;

  const sliceAngleWithoutGaps = sliceAngle - gapBetweenSlices;
  const subSliceAngle = sliceAngleWithoutGaps / numSubSlices;
  const ringThickness = r / numRings;
  for (let n = 0; n < numRings - 1; n++) { // don't draw the innermost ring so we get a round hole
    for (let i = 0; i < numSubSlices; i++) {

      if (checkedList[groupIndex][sliceIndex] === false) {
        continue; // skip drawing if not checked
      }

      // const start = -90 + sliceAngleWithoutGaps + i * subSliceAngle;
      // const end = start + subSliceAngle;
      const start = -90 + gapBetweenSlices * 2 - i * subSliceAngle;
      const end = start + subSliceAngle;

      const [x1, y1] = polarToCartesian(0, 0, r, start);
      const [x2, y2] = polarToCartesian(0, 0, r, end);

      ctx.beginPath();
      // const offset = 2;
      // const offsetScale = 1;
      // if (i == 0) { // first
      //   ctx.arc(0, 0, r - n * ringThickness, ((start + offset * (n * offsetScale)) * Math.PI) / 180, (end * Math.PI) / 180);
      //   ctx.arc(0, 0, r - (n + 1) * ringThickness, (end * Math.PI) / 180, ((start + offset * ((n + 1) * offsetScale)) * Math.PI) / 180, true);
      // } else if (i == numSubSlices - 1) { // last
      //   ctx.arc(0, 0, r - n * ringThickness, (start * Math.PI) / 180, ((end - offset * (n * offsetScale)) * Math.PI) / 180);
      //   ctx.arc(0, 0, r - (n + 1) * ringThickness, ((end - offset * ((n + 1) * offsetScale)) * Math.PI) / 180, (start * Math.PI) / 180, true);
      // } else { // center
      //   ctx.arc(0, 0, r - n * ringThickness, (start * Math.PI) / 180, (end * Math.PI) / 180);
      //   ctx.arc(0, 0, r - (n + 1) * ringThickness, (end * Math.PI) / 180, (start * Math.PI) / 180, true);
      // }
      ctx.arc(0, 0, r - n * ringThickness, (start * Math.PI) / 180, (end * Math.PI) / 180);
      ctx.arc(0, 0, r - (n + 1) * ringThickness, (end * Math.PI) / 180, (start * Math.PI) / 180, true);

      ctx.closePath();
      const tintedColor = calculateTintAndShade(color, Math.random() * 0.4).tint.hex;

      // if (i == 0) {
      //   ctx.fillStyle = "blue";
      // } else if (i == numSubSlices - 1) {
      //   ctx.fillStyle = "red";
      // } else {
      //   ctx.fillStyle = "green"
      // }

      ctx.fillStyle = tintedColor;
      ctx.fill();
      ctx.strokeStyle = tintedColor;
      ctx.stroke();
    }
  }
  // Rotate for then next slice
  ctx.rotate(rotation * Math.PI / 180);
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

      // console.log('selected', cb.dataset.groupIndex);
      console.log('group index', cb.dataset.groupIndex);
      console.log('slice index', cb.dataset.sliceIndex);
      const rotationIndex = parseInt(cb.dataset.groupIndex) * 3 + parseInt(cb.dataset.sliceIndex);
      console.log("rotation index: ", rotationIndex);
      rotationTarget = rotationIndex * -sliceAngle;
      console.log("new rotation target: ", rotationTarget);
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
  if (rotationAngle !== rotationTarget) {
    const diff = rotationTarget - rotationAngle;
    if (Math.abs(diff) < 0.1) {
      rotationAngle = rotationTarget; // Snap to target if close enough
    } else {
      rotationAngle += diff * 0.01; // Ease towards the target
      // Determine the shortest rotation direction
      const normalizedDiff = ((rotationTarget - rotationAngle) + 360) % 360;
      const shortestRotation = normalizedDiff > 180 ? normalizedDiff - 360 : normalizedDiff;

      rotationAngle += shortestRotation * 0.1; // Ease towards the target
    }
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // ctx.fillStyle = "#1d1c1c";
  // ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((rotationAngle * Math.PI) / 180);
  // ctx.rotate((rotationAngle * Math.PI) / 180);
  // ctx.translate(-cx, -cy);

  // ctx.beginPath();
  // ctx.arc(0, 0, 40, 0, 2 * Math.PI);
  // ctx.closePath();
  // ctx.strokeStyle = "red";
  // ctx.stroke();

  let sliceIndex = 0;
  const totalSlices = sectionsData.reduce((sum, section) => sum + section.items.length, 0);
  const sliceAngle = 360 / totalSlices;
  // const sliceAngleRad = sliceAngle * (Math.PI / 180);
  // const sliceAngleRad = 0;
  sectionsData.forEach((section, i) => {
    section.items.forEach((item, n) => {
      // if (i !== 0 || n !== 0) {
      //   return
      // }
      drawSlice(cx, cy, r, item.color, sliceAngle, i, n);
      sliceIndex++;
    });
    // Clear a circle in the middle of the canvas
  });
  ctx.restore();
  // rotationAngle = (rotationAngle + 1) % 360;

  // ctx.globalCompositeOperation = "destination-out";
  // ctx.beginPath();
  // ctx.arc(cx, cy, centerHoleRadius, 0, 2 * Math.PI);
  // ctx.fillStyle = "white";
  // ctx.fill();
  // ctx.globalCompositeOperation = "source-over";

  requestAnimationFrame(rotateBadge);
}

rotateBadge();
