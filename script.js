const canvas = document.querySelector("#speedCanvas");
const ctx = canvas.getContext("2d");
const speedValue = document.querySelector("#speedValue");
const boostButton = document.querySelector("#boostButton");
const skillDetail = document.querySelector("#skillDetail");
const skillChips = document.querySelectorAll(".skill-chip");
const carousels = document.querySelectorAll("[data-carousel]");
const zoomElements = document.querySelectorAll(
  ".section-heading, .stat, .profile-photo, .profile-copy, .experience-card, .project-card, .course-card, .skill-board, .timeline li, .contact-section > div"
);

const skillCopy = {
  "Mechanical Design": "SolidWorks, Fusion 360, CATIA, AutoCAD, 3D CAD, 2D drawings, GD&T, ASME Y14.5, packaging, chassis parts, suspension hardware, and prototype design.",
  "Crash Safety CAE": "LS-DYNA crash setups, HyperMesh preprocessing, ANSYS Workbench, FEA, CFD exposure, modal analysis, crashworthiness, occupant safety, HIC 15, chest deflection, and structural validation.",
  "Vehicle Dynamics": "Adams, CarSim, suspension dynamics, brake design, comfort and handling analysis, tire/chassis behavior, FSAE tradeoffs, and active suspension concepts.",
  "Controls & ADAS": "MATLAB, Simulink, LQR suspension controls, LabVIEW-Python integration, sensor workflows, mmWave radar calibration, ADAS dynamics, and point-cloud validation.",
  "Manufacturing": "DFM/DFA, CNC, 3D printing, stamping, assembly planning, BOM work, quality control, Cpk, ISO standards, Six Sigma tools, and lean manufacturing.",
  "Testing & Validation": "FEA validation, crash and occupant metrics, modal checks, radar testing, DAQ processing, root-cause analysis, test reports, and design iteration from physical feedback.",
  "Coding & Data": "Python, MATLAB scripts, Simulink models, LabVIEW integration, simulation data processing, automation workflows, engineering calculations, and analysis support.",
  "PLM & Documentation": "Siemens Teamcenter, product lifecycle management, technical documentation, cross-functional collaboration, design reviews, manufacturing drawings, and prototype release support."
};

let speed = 72;
let targetSpeed = 72;
let boost = 0;
let pointerX = 0.5;
let pointerY = 0.5;

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.floor(window.innerWidth * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function drawAutomotiveField(time) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const mouseX = pointerX * width;
  const mouseY = pointerY * height;
  const driftX = (pointerX - 0.5) * width * 0.045;
  const driftY = (pointerY - 0.5) * height * 0.035;
  const pulse = 0.55 + Math.sin(time * 0.002) * 0.22;
  const blueprint = "84,214,255";
  const bright = `rgba(${blueprint},${0.55 + pulse * 0.18})`;
  const dim = `rgba(${blueprint},0.18)`;

  ctx.clearRect(0, 0, width, height);

  const field = ctx.createRadialGradient(mouseX, mouseY, 40, mouseX, mouseY, Math.max(width, height) * 0.46);
  field.addColorStop(0, `rgba(${blueprint},${0.12 + boost * 0.05})`);
  field.addColorStop(0.5, "rgba(0,132,255,0.06)");
  field.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = field;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowColor = `rgba(${blueprint},0.25)`;
  ctx.shadowBlur = 8 + boost * 8;

  for (let y = 38 + (time * 0.006) % 24; y < height; y += 96) {
    ctx.strokeStyle = "rgba(84,214,255,0.14)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y + Math.sin(y * 0.02 + time * 0.001) * 3);
    ctx.stroke();
  }

  const drawWheel = (x, y, r, alpha = 0.5) => {
    ctx.strokeStyle = `rgba(${blueprint},${alpha})`;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.arc(x, y, r * 0.58, 0, Math.PI * 2);
    ctx.stroke();
    for (let spoke = 0; spoke < 8; spoke += 1) {
      const angle = time * 0.0018 + spoke * Math.PI / 4;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(angle) * r * 0.86, y + Math.sin(angle) * r * 0.86);
      ctx.stroke();
    }
  };

  const drawF1Side = (x, y, w, alpha = 0.62) => {
    const h = w * 0.22;
    const rearWheel = { x: x + w * 0.2, y: y + h * 0.74, r: w * 0.075 };
    const frontWheel = { x: x + w * 0.82, y: y + h * 0.74, r: w * 0.075 };

    ctx.strokeStyle = `rgba(${blueprint},${alpha})`;
    ctx.lineWidth = Math.max(1.1, w * 0.002);
    ctx.beginPath();
    ctx.moveTo(x + w * 0.05, y + h * 0.65);
    ctx.lineTo(x + w * 0.18, y + h * 0.58);
    ctx.bezierCurveTo(x + w * 0.3, y + h * 0.26, x + w * 0.42, y + h * 0.17, x + w * 0.53, y + h * 0.32);
    ctx.bezierCurveTo(x + w * 0.62, y + h * 0.45, x + w * 0.74, y + h * 0.46, x + w * 0.94, y + h * 0.53);
    ctx.lineTo(x + w * 0.99, y + h * 0.61);
    ctx.lineTo(x + w * 0.86, y + h * 0.68);
    ctx.lineTo(x + w * 0.66, y + h * 0.7);
    ctx.lineTo(x + w * 0.36, y + h * 0.7);
    ctx.lineTo(x + w * 0.07, y + h * 0.72);
    ctx.closePath();
    ctx.stroke();

    ctx.strokeStyle = `rgba(${blueprint},${alpha * 0.55})`;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.36, y + h * 0.7);
    ctx.lineTo(x + w * 0.47, y + h * 0.32);
    ctx.lineTo(x + w * 0.58, y + h * 0.68);
    ctx.moveTo(x + w * 0.63, y + h * 0.52);
    ctx.lineTo(x + w * 0.77, y + h * 0.26);
    ctx.lineTo(x + w * 0.88, y + h * 0.52);
    ctx.moveTo(x + w * 0.04, y + h * 0.52);
    ctx.lineTo(x + w * 0.16, y + h * 0.35);
    ctx.lineTo(x + w * 0.24, y + h * 0.58);
    ctx.stroke();

    drawWheel(rearWheel.x, rearWheel.y, rearWheel.r, alpha);
    drawWheel(frontWheel.x, frontWheel.y, frontWheel.r, alpha);
  };

  const drawTopView = (x, y, w, alpha = 0.28) => {
    const h = w * 0.45;
    ctx.strokeStyle = `rgba(${blueprint},${alpha})`;
    ctx.lineWidth = 1.1;
    ctx.strokeRect(x, y + h * 0.24, w * 0.12, h * 0.52);
    ctx.strokeRect(x + w * 0.88, y + h * 0.24, w * 0.12, h * 0.52);
    ctx.beginPath();
    ctx.moveTo(x + w * 0.12, y + h * 0.5);
    ctx.bezierCurveTo(x + w * 0.28, y + h * 0.08, x + w * 0.7, y + h * 0.08, x + w * 0.88, y + h * 0.5);
    ctx.bezierCurveTo(x + w * 0.7, y + h * 0.92, x + w * 0.28, y + h * 0.92, x + w * 0.12, y + h * 0.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + w * 0.5, y + h * 0.12);
    ctx.lineTo(x + w * 0.5, y + h * 0.88);
    ctx.moveTo(x + w * 0.2, y + h * 0.5);
    ctx.lineTo(x + w * 0.8, y + h * 0.5);
    ctx.stroke();
  };

  const drawSuspension = (x, y, w, alpha = 0.3) => {
    const h = w * 0.38;
    ctx.strokeStyle = `rgba(${blueprint},${alpha})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x, y + h * 0.2);
    ctx.lineTo(x + w * 0.8, y + h * 0.48);
    ctx.lineTo(x, y + h * 0.8);
    ctx.moveTo(x + w * 0.1, y + h * 0.18);
    ctx.lineTo(x + w, y + h * 0.08);
    ctx.moveTo(x + w * 0.1, y + h * 0.82);
    ctx.lineTo(x + w, y + h * 0.92);
    ctx.stroke();
    ctx.strokeRect(x + w * 0.78, y + h * 0.32, w * 0.12, h * 0.32);
  };

  drawF1Side(width * 0.37 + driftX, height * 0.13 + driftY, Math.min(width * 0.58, 780), 0.54);
  drawF1Side(width * 0.18 - driftX * 0.35, height * 0.64 - driftY * 0.25, Math.min(width * 0.48, 620), 0.22);
  drawTopView(18 - driftX * 0.25, height * 0.12 + driftY * 0.25, Math.min(width * 0.18, 210), 0.28);
  drawTopView(10 - driftX * 0.15, height * 0.38 - driftY * 0.2, Math.min(width * 0.17, 190), 0.22);
  drawSuspension(width * 0.82 + driftX * 0.2, height * 0.42 - driftY * 0.25, Math.min(width * 0.17, 210), 0.32);
  drawSuspension(width * 0.83 - driftX * 0.1, height * 0.66 + driftY * 0.2, Math.min(width * 0.16, 190), 0.24);

  ctx.strokeStyle = dim;
  ctx.lineWidth = 1;
  for (let i = 0; i < 18; i += 1) {
    const x = ((time * 0.018 + i * 130) % (width + 160)) - 80;
    const y = height * (0.16 + (i % 7) * 0.11) + driftY * 0.18;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 48, y);
    ctx.moveTo(x + 24, y - 9);
    ctx.lineTo(x + 24, y + 9);
    ctx.stroke();
  }

  ctx.strokeStyle = bright;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(mouseX, mouseY, 18 + boost * 18, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = `rgba(${blueprint},0.18)`;
  ctx.beginPath();
  ctx.moveTo(mouseX - 48, mouseY);
  ctx.lineTo(mouseX + 48, mouseY);
  ctx.moveTo(mouseX, mouseY - 48);
  ctx.lineTo(mouseX, mouseY + 48);
  ctx.stroke();
  ctx.restore();
}

function animate(time) {
  boost *= 0.965;
  targetSpeed = 72 + Math.round(boost * 84);
  speed += (targetSpeed - speed) * 0.08;
  speedValue.textContent = Math.round(speed);
  drawAutomotiveField(time);
  requestAnimationFrame(animate);
}

boostButton.addEventListener("click", () => {
  boost = Math.min(boost + 0.65, 1.5);
});

window.addEventListener("pointermove", (event) => {
  pointerX += (event.clientX / window.innerWidth - pointerX) * 0.24;
  pointerY += (event.clientY / window.innerHeight - pointerY) * 0.24;
});

skillChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    skillChips.forEach((item) => item.classList.remove("active"));
    chip.classList.add("active");
    const name = chip.dataset.skill;
    skillDetail.innerHTML = `<h3>${name}</h3><p>${skillCopy[name]}</p>`;
  });
});

carousels.forEach((carousel) => {
  const slides = Array.from(carousel.querySelectorAll(".carousel-slide, .card-carousel-image"));
  const previousButton = carousel.querySelector("[data-carousel-prev]");
  const nextButton = carousel.querySelector("[data-carousel-next]");
  const dotsContainer = carousel.querySelector(".carousel-dots");
  let activeIndex = 0;

  if (!slides.length || !previousButton || !nextButton || !dotsContainer) {
    return;
  }

  const dots = slides.map((_, index) => {
    const dot = document.createElement("button");
    dot.className = "carousel-dot";
    dot.type = "button";
    dot.setAttribute("aria-label", `Show slide ${index + 1}`);
    dot.addEventListener("click", () => showSlide(index));
    dotsContainer.appendChild(dot);
    return dot;
  });

  function showSlide(index) {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeIndex;
      slide.classList.toggle("active", isActive);
      if (!isActive && slide.tagName === "VIDEO") {
        slide.pause();
      }
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === activeIndex);
    });
  }

  previousButton.addEventListener("click", () => showSlide(activeIndex - 1));
  nextButton.addEventListener("click", () => showSlide(activeIndex + 1));
  showSlide(0);
});

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-visible", entry.isIntersecting);
        entry.target.classList.toggle("is-leaving", !entry.isIntersecting && entry.boundingClientRect.top < 0);
      });
    },
    {
      root: null,
      threshold: 0.18,
      rootMargin: "0px 0px -8% 0px"
    }
  );

  zoomElements.forEach((element, index) => {
    element.classList.add("scroll-zoom");
    element.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 55}ms`);
    revealObserver.observe(element);
  });
} else {
  zoomElements.forEach((element) => {
    element.classList.add("scroll-zoom", "is-visible");
  });
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
requestAnimationFrame(animate);
