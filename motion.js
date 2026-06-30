(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const tiltTargets = document.querySelectorAll(".cockpit, .card-media, .course-visual");
  let scrollFrame;

  function updateScrollDepth() {
    const y = window.scrollY;
    const heroDistance = Math.min(window.innerHeight, y);
    const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.min(1, y / scrollable);

    document.documentElement.style.setProperty("--hero-copy-y", `${heroDistance * -0.075}px`);
    document.documentElement.style.setProperty("--cockpit-y", `${heroDistance * 0.045}px`);
    document.documentElement.style.setProperty("--hero-fade", String(Math.max(0.42, 1 - heroDistance / window.innerHeight * 0.5)));
    document.documentElement.style.setProperty("--page-progress", String(progress));
  }

  if (!reduceMotion) {
    window.addEventListener("scroll", () => {
      cancelAnimationFrame(scrollFrame);
      scrollFrame = requestAnimationFrame(updateScrollDepth);
    }, { passive: true });

    if (finePointer) {
      tiltTargets.forEach((target) => {
        target.classList.add("motion-surface");

        target.addEventListener("pointermove", (event) => {
          const bounds = target.getBoundingClientRect();
          const x = (event.clientX - bounds.left) / bounds.width;
          const y = (event.clientY - bounds.top) / bounds.height;
          target.style.setProperty("--tilt-x", `${(0.5 - y) * 7}deg`);
          target.style.setProperty("--tilt-y", `${(x - 0.5) * 8}deg`);
          target.style.setProperty("--shine-x", `${x * 100}%`);
          target.style.setProperty("--shine-y", `${y * 100}%`);
        }, { passive: true });

        target.addEventListener("pointerleave", () => {
          target.style.setProperty("--tilt-x", "0deg");
          target.style.setProperty("--tilt-y", "0deg");
          target.style.setProperty("--shine-x", "50%");
          target.style.setProperty("--shine-y", "50%");
        });
      });
    }

    updateScrollDepth();
  }
})();
