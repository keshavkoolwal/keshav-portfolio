const speedValue = document.querySelector("#speedValue");
const boostButton = document.querySelector("#boostButton");
const skillDetail = document.querySelector("#skillDetail");
const skillChips = document.querySelectorAll(".skill-chip");
const carousels = document.querySelectorAll("[data-carousel]");
const zoomElements = document.querySelectorAll(
  ".section-heading, .stat, .profile-photo, .profile-copy, .project-card, .course-card, .skill-board, .timeline li, .contact-section > div"
);
const reduceBackgroundMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let backgroundFrame;

if (!reduceBackgroundMotion) {
  window.addEventListener("pointermove", (event) => {
    cancelAnimationFrame(backgroundFrame);
    backgroundFrame = requestAnimationFrame(() => {
      document.body.style.setProperty("--pointer-x", `${(event.clientX / window.innerWidth) * 100}%`);
      document.body.style.setProperty("--pointer-y", `${(event.clientY / window.innerHeight) * 100}%`);
    });
  }, { passive: true });

  window.addEventListener("scroll", () => {
    const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = window.scrollY / scrollable;
    document.body.style.setProperty("--background-shift", `${(progress - 0.5) * 46}px`);
  }, { passive: true });
}

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

let boostAnimation;

boostButton.addEventListener("click", () => {
  cancelAnimationFrame(boostAnimation);
  const started = performance.now();
  const duration = 1350;

  function animateBoost(now) {
    const progress = Math.min(1, (now - started) / duration);
    const surge = Math.sin(progress * Math.PI);
    speedValue.textContent = Math.round(72 + surge * 84);
    boostButton.classList.toggle("is-boosting", progress < 0.82);

    if (progress < 1) {
      boostAnimation = requestAnimationFrame(animateBoost);
    } else {
      speedValue.textContent = "72";
      boostButton.classList.remove("is-boosting");
    }
  }

  boostAnimation = requestAnimationFrame(animateBoost);
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
