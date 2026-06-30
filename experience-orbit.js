(() => {
  const section = document.querySelector("#experience");
  const shell = section?.querySelector(".experience-orbit-shell");
  const cards = Array.from(section?.querySelectorAll(".experience-card") || []);
  const previousButton = document.querySelector("#experiencePrev");
  const nextButton = document.querySelector("#experienceNext");
  const status = document.querySelector("#experienceOrbitStatus");
  const progress = document.querySelector("#experienceOrbitProgress");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!section || !shell || !cards.length) {
    return;
  }

  let activeFloat = 0;
  let targetFloat = 0;
  let activeIndex = 0;
  let animationFrame;
  const angleStep = 360 / cards.length;

  const indicators = cards.map((card, index) => {
    const indicator = document.createElement("span");
    indicator.style.setProperty("--indicator-index", index);
    progress.appendChild(indicator);
    card.dataset.orbitIndex = index;
    card.classList.toggle("has-company-logo", Boolean(card.querySelector(".card-media.logo-media")));
    return indicator;
  });

  function normalizeAngle(angle) {
    return ((angle + 180) % 360 + 360) % 360 - 180;
  }

  function experienceName(card) {
    return card.querySelector(".experience-meta strong")?.textContent.trim() || "Experience";
  }

  function updateCards() {
    const horizontalRadius = window.innerWidth < 680
      ? Math.max(300, window.innerWidth * 0.92)
      : Math.max(540, Math.min(900, window.innerWidth * 0.72));

    cards.forEach((card, index) => {
      const angle = normalizeAngle((index - activeFloat) * angleStep);
      const angleRadians = angle * Math.PI / 180;
      const cosine = Math.cos(angleRadians);
      const focus = Math.pow(Math.max(0, cosine), 3);
      const orbitX = Math.sin(angleRadians) * horizontalRadius;
      const orbitZ = (cosine - 1) * 360;
      const orbitRotation = Math.sin(angleRadians) * -42;
      const isInteractive = index === activeIndex;

      card.style.setProperty("--orbit-x", `${orbitX}px`);
      card.style.setProperty("--orbit-z", `${orbitZ}px`);
      card.style.setProperty("--orbit-rotate", `${orbitRotation}deg`);
      card.style.setProperty("--orbit-scale", String(0.58 + focus * 0.42));
      card.style.setProperty("--orbit-opacity", String(focus < 0.012 ? 0 : 0.07 + focus * 0.93));
      card.style.setProperty("--orbit-blur", `${(1 - focus) * 12}px`);
      card.style.setProperty("--orbit-saturation", String(0.48 + focus * 0.52));
      card.style.zIndex = String(Math.round(focus * 100));
      card.classList.toggle("is-orbit-active", index === activeIndex);
      card.toggleAttribute("inert", !isInteractive);
      card.setAttribute("aria-hidden", String(!isInteractive));
      card.tabIndex = isInteractive ? 0 : -1;
      card.setAttribute("aria-label", `${experienceName(card)} details. Use up and down arrow keys to scroll.`);

      card.querySelectorAll("video").forEach((video) => {
        if (index !== activeIndex) {
          video.pause();
        } else if (video.muted) {
          video.play().catch(() => {});
        }
      });
    });

    indicators.forEach((indicator, index) => {
      indicator.classList.toggle("active", index === activeIndex);
    });

    status.textContent = experienceName(cards[activeIndex]);
    previousButton.disabled = activeIndex === 0;
    nextButton.disabled = activeIndex === cards.length - 1;
  }

  function sectionMetrics() {
    const top = section.getBoundingClientRect().top + window.scrollY;
    const range = Math.max(1, section.offsetHeight - window.innerHeight);
    return { top, range };
  }

  function indexFromScroll() {
    const { top, range } = sectionMetrics();
    const leadIn = Math.min(window.innerHeight * 0.16, 140);
    const progressValue = Math.min(1, Math.max(0, (window.scrollY - top + leadIn) / range));
    return progressValue * (cards.length - 1);
  }

  function animate() {
    targetFloat = indexFromScroll();
    activeFloat = reduceMotion ? targetFloat : activeFloat + (targetFloat - activeFloat) * 0.13;
    const nextActive = Math.min(cards.length - 1, Math.max(0, Math.round(activeFloat)));

    if (nextActive !== activeIndex) {
      activeIndex = nextActive;
      cards[activeIndex].scrollTop = 0;
    }

    updateCards();

    if (Math.abs(targetFloat - activeFloat) > 0.001) {
      animationFrame = requestAnimationFrame(animate);
    } else {
      animationFrame = undefined;
    }
  }

  function requestUpdate() {
    if (!animationFrame) {
      animationFrame = requestAnimationFrame(animate);
    }
  }

  function scrollToIndex(index) {
    const safeIndex = Math.min(cards.length - 1, Math.max(0, index));
    const { top, range } = sectionMetrics();
    const leadIn = Math.min(window.innerHeight * 0.16, 140);
    const destination = top - leadIn + safeIndex / (cards.length - 1) * range;
    window.scrollTo({ top: destination, behavior: reduceMotion ? "auto" : "smooth" });
  }

  function scrollActiveDetails(amount) {
    const card = cards[activeIndex];
    const maximum = Math.max(0, card.scrollHeight - card.clientHeight);
    const nextPosition = Math.min(maximum, Math.max(0, card.scrollTop + amount));
    if (Math.abs(nextPosition - card.scrollTop) < 1) {
      return false;
    }
    card.scrollTo({
      top: nextPosition,
      behavior: reduceMotion ? "auto" : "smooth"
    });
    return true;
  }

  function advanceFromBoundary(direction) {
    const nextIndex = activeIndex + direction;
    if (nextIndex >= 0 && nextIndex < cards.length) {
      scrollToIndex(nextIndex);
      return;
    }
    window.scrollBy({ top: direction * window.innerHeight * 0.72, behavior: reduceMotion ? "auto" : "smooth" });
  }

  previousButton.addEventListener("click", () => scrollToIndex(activeIndex - 1));
  nextButton.addEventListener("click", () => scrollToIndex(activeIndex + 1));

  shell.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollToIndex(activeIndex - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollToIndex(activeIndex + 1);
    }

    const isCardScrollTarget = event.target === shell || event.target === cards[activeIndex];
    if (!isCardScrollTarget) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!scrollActiveDetails(88)) {
        advanceFromBoundary(1);
      }
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!scrollActiveDetails(-88)) {
        advanceFromBoundary(-1);
      }
    }
    if (event.key === "PageDown" || (event.key === " " && !event.shiftKey)) {
      event.preventDefault();
      if (!scrollActiveDetails(cards[activeIndex].clientHeight * 0.72)) {
        advanceFromBoundary(1);
      }
    }
    if (event.key === "PageUp" || (event.key === " " && event.shiftKey)) {
      event.preventDefault();
      if (!scrollActiveDetails(cards[activeIndex].clientHeight * -0.72)) {
        advanceFromBoundary(-1);
      }
    }
    if (event.key === "Home") {
      event.preventDefault();
      cards[activeIndex].scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    }
    if (event.key === "End") {
      event.preventDefault();
      cards[activeIndex].scrollTo({ top: cards[activeIndex].scrollHeight, behavior: reduceMotion ? "auto" : "smooth" });
    }
  });

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  updateCards();
  requestUpdate();
})();
