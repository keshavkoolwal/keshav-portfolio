(() => {
  const canvas = document.querySelector("#automotiveScene");
  const ctx = canvas.getContext("2d", { alpha: true });
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const palette = ["#58d6ca", "#a991ff", "#ff6f9f", "#f2c66d", "#8de0b3"];
  const experiences = [
    { label: "UMTRI / U-M", role: "Occupant Safety Research", color: "#58d6ca" },
    { label: "LIVAQ", role: "EV Chassis & Assembly", color: "#a991ff" },
    { label: "GEKOT ROBOTICS", role: "ADAS & Dynamics", color: "#ff6f9f" },
    { label: "DRDO RCI", role: "Robotics Dynamics", color: "#f2c66d" },
    { label: "VOLVO R&D", role: "Chassis Safety", color: "#8de0b3" },
    { label: "TEAM UTTEJIT FSAE", role: "Formula Student", color: "#a991ff" }
  ];

  let width = 0;
  let height = 0;
  let ratio = 1;
  let scrollProgress = 0;
  let targetScrollProgress = 0;
  let scrollVelocity = 0;
  let pointerX = 0;
  let pointerY = 0;
  let targetPointerX = 0;
  let targetPointerY = 0;
  let lastScrollY = window.scrollY;
  let lastTime = 0;
  let experienceStart = 0.2;
  let experienceEnd = 0.65;

  const particles = Array.from({ length: 150 }, (_, index) => ({
    x: Math.sin(index * 91.73) * (2.8 + (index % 9) * 0.62),
    y: Math.cos(index * 47.11) * (1.6 + (index % 7) * 0.48),
    z: 0.8 + ((index * 3.71) % 27),
    size: 0.45 + (index % 5) * 0.28,
    color: palette[index % palette.length],
    phase: index * 0.61
  }));

  const nebula = Array.from({ length: 84 }, (_, index) => ({
    angle: index * 2.399,
    radius: 1.25 + (index % 13) * 0.19,
    z: -2.4 + (index % 29) * 0.18,
    size: 24 + (index % 8) * 7,
    colorIndex: index % palette.length,
    phase: index * 0.37
  }));

  function createGlowSprite(color) {
    const sprite = document.createElement("canvas");
    sprite.width = 96;
    sprite.height = 96;
    const spriteContext = sprite.getContext("2d");
    const glow = spriteContext.createRadialGradient(48, 48, 0, 48, 48, 48);
    glow.addColorStop(0, `${color}cc`);
    glow.addColorStop(0.18, `${color}70`);
    glow.addColorStop(0.48, `${color}22`);
    glow.addColorStop(1, `${color}00`);
    spriteContext.fillStyle = glow;
    spriteContext.fillRect(0, 0, 96, 96);
    return sprite;
  }

  const glowSprites = palette.map(createGlowSprite);
  const conceptCarImage = new Image();
  const crashedCarImage = new Image();
  let conceptCarReady = false;
  let crashedCarReady = false;
  conceptCarImage.decoding = "async";
  conceptCarImage.onload = () => {
    conceptCarReady = true;
    if (reduceMotion) {
      draw(0);
    }
  };
  conceptCarImage.src = "assets/concept-car-top.png";
  crashedCarImage.decoding = "async";
  crashedCarImage.onload = () => {
    crashedCarReady = true;
    if (reduceMotion) {
      draw(0);
    }
  };
  crashedCarImage.src = "assets/concept-car-crashed.png";

  function conceptCarDimensions() {
    const imageRatio = conceptCarReady
      ? conceptCarImage.naturalWidth / conceptCarImage.naturalHeight
      : 0.52;
    const carHeight = Math.min(height * 0.56, width * 0.72);
    return { width: carHeight * imageRatio, height: carHeight };
  }

  // Low, faceted metallic coupe inspired by modern concept supercars.
  const carVertices = [
    [-0.74, -0.42, -2.34], [0.74, -0.42, -2.34],
    [-1.08, -0.43, -1.72], [1.08, -0.43, -1.72],
    [-1.13, -0.43, 0.96], [1.13, -0.43, 0.96],
    [-0.84, -0.38, 2.34], [0.84, -0.38, 2.34],
    [-0.7, 0.08, -2.2], [0.7, 0.08, -2.2],
    [-1.0, 0.16, -1.48], [1.0, 0.16, -1.48],
    [-1.03, 0.12, 1.12], [1.03, 0.12, 1.12],
    [-0.7, -0.02, 2.22], [0.7, -0.02, 2.22],
    [-0.64, 0.72, -1.0], [0.64, 0.72, -1.0],
    [-0.55, 0.68, 0.58], [0.55, 0.68, 0.58]
  ];

  const carEdges = [
    [0, 1], [0, 2], [1, 3], [2, 4], [3, 5], [4, 6], [5, 7], [6, 7],
    [8, 9], [8, 10], [9, 11], [10, 12], [11, 13], [12, 14], [13, 15], [14, 15],
    [0, 8], [1, 9], [2, 10], [3, 11], [4, 12], [5, 13], [6, 14], [7, 15],
    [16, 17], [17, 19], [19, 18], [18, 16],
    [10, 16], [11, 17], [12, 18], [13, 19],
    [10, 11], [12, 13]
  ];

  const carFaces = [
    { points: [0, 1, 3, 2], color: "#29446f", alpha: 0.16 },
    { points: [2, 3, 5, 4], color: "#1b3158", alpha: 0.16 },
    { points: [4, 5, 7, 6], color: "#3e65a0", alpha: 0.2 },
    { points: [0, 2, 10, 8], color: "#314f83", alpha: 0.19 },
    { points: [2, 4, 10], color: "#6987bd", alpha: 0.18 },
    { points: [4, 12, 10], color: "#263e6b", alpha: 0.24 },
    { points: [4, 6, 14, 12], color: "#5076ad", alpha: 0.2 },
    { points: [1, 9, 11, 3], color: "#42669d", alpha: 0.18 },
    { points: [3, 11, 5], color: "#7693c3", alpha: 0.17 },
    { points: [5, 11, 13], color: "#2c4778", alpha: 0.22 },
    { points: [5, 13, 15, 7], color: "#5d7fb4", alpha: 0.2 },
    { points: [8, 9, 11], color: "#46699e", alpha: 0.22 },
    { points: [8, 11, 10], color: "#7897c8", alpha: 0.17 },
    { points: [10, 11, 13, 12], color: "#385a91", alpha: 0.18 },
    { points: [12, 13, 14], color: "#7698cf", alpha: 0.24 },
    { points: [13, 15, 14], color: "#35588e", alpha: 0.27 },
    { points: [16, 17, 19, 18], color: "#6d8ebd", alpha: 0.2 },
    { points: [10, 11, 17, 16], color: "#162947", alpha: 0.27 },
    { points: [12, 18, 19, 13], color: "#203b62", alpha: 0.31 },
    { points: [10, 16, 18, 12], color: "#294a78", alpha: 0.26 },
    { points: [11, 13, 19, 17], color: "#1b365d", alpha: 0.27 }
  ];

  function resize() {
    ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    updateStoryAnchors();
    if (reduceMotion) {
      draw(0);
    }
  }

  function measureScroll() {
    const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    return Math.min(1, Math.max(0, window.scrollY / scrollable));
  }

  function smoothstep(start, end, value) {
    const progress = Math.min(1, Math.max(0, (value - start) / Math.max(0.0001, end - start)));
    return progress * progress * (3 - 2 * progress);
  }

  function updateStoryAnchors() {
    const experienceSection = document.querySelector("#experience");
    if (!experienceSection) {
      return;
    }
    const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const top = experienceSection.getBoundingClientRect().top + window.scrollY;
    const bottom = top + experienceSection.offsetHeight;
    experienceStart = Math.min(0.82, Math.max(0.08, (top - window.innerHeight * 0.28) / scrollable));
    experienceEnd = Math.min(0.88, Math.max(experienceStart + 0.08, (bottom - window.innerHeight * 0.72) / scrollable));
  }

  function carViewportPosition() {
    if (scrollProgress <= experienceStart) {
      return 0.14 + smoothstep(0, experienceStart, scrollProgress) * 0.36;
    }
    if (scrollProgress <= experienceEnd) {
      return 0.5;
    }
    return 0.5 + smoothstep(experienceEnd, 0.9, scrollProgress) * 0.1;
  }

  function sceneState(time) {
    const chapter = scrollProgress * Math.PI * 4;
    const crash = smoothstep(0.88, 1, scrollProgress);
    const impact = smoothstep(0.66, 1, crash);
    const shakeX = reduceMotion ? 0 : Math.sin(time * 0.055) * impact * 8;
    const shakeY = reduceMotion ? 0 : Math.cos(time * 0.071) * impact * 5;
    return {
      yaw: -0.48 + pointerX * 0.075,
      pitch: -0.14 + Math.sin(chapter * 0.45) * 0.1 + pointerY * 0.055,
      roll: Math.sin(chapter * 0.22) * 0.018,
      distance: 8.45 - (0.5 + Math.sin(chapter * 0.62) * 0.5) * 1.15,
      focal: Math.min(width, height) * (0.93 + Math.sin(chapter * 0.5) * 0.055),
      centerX: width * (0.5 + pointerX * 0.008) + shakeX,
      centerY: height * carViewportPosition() + shakeY,
      explode: 0.06 + (0.5 - Math.cos(chapter * 0.74) * 0.5) * 0.18,
      crash,
      impact
    };
  }

  function rotate(point, state) {
    const [x, y, z] = point;
    const cy = Math.cos(state.yaw);
    const sy = Math.sin(state.yaw);
    const cp = Math.cos(state.pitch);
    const sp = Math.sin(state.pitch);
    const cr = Math.cos(state.roll);
    const sr = Math.sin(state.roll);
    const x1 = x * cy - z * sy;
    const z1 = x * sy + z * cy;
    const y2 = y * cp - z1 * sp;
    const z2 = y * sp + z1 * cp;
    return [x1 * cr - y2 * sr, x1 * sr + y2 * cr, z2 + state.distance];
  }

  function project(point, state) {
    const [x, y, z] = rotate(point, state);
    if (z < 0.45) {
      return null;
    }
    const scale = state.focal / z;
    return {
      x: state.centerX + x * scale,
      y: state.centerY - y * scale,
      z,
      scale
    };
  }

  function line3d(a, b, state, color, alpha = 0.25, lineWidth = 1) {
    const start = project(a, state);
    const end = project(b, state);
    if (!start || !end) {
      return;
    }
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  }

  function face3d(indices, state, color, alpha, vertices = carVertices) {
    const points = indices.map((index) => project(vertices[index], state));
    if (points.some((point) => !point)) {
      return;
    }
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach((point) => ctx.lineTo(point.x, point.y));
    ctx.closePath();
    ctx.fill();
  }

  function drawBloom(state) {
    const radius = Math.min(width, height) * 0.42;
    const transitionBurst = Math.pow(Math.abs(Math.sin(scrollProgress * Math.PI * 5)), 9);
    const glow = ctx.createRadialGradient(state.centerX, state.centerY, 4, state.centerX, state.centerY, radius);
    glow.addColorStop(0, `rgba(242,198,109,${0.09 + transitionBurst * 0.18})`);
    glow.addColorStop(0.08, `rgba(169,145,255,${0.13 + transitionBurst * 0.12})`);
    glow.addColorStop(0.34, "rgba(88,214,202,0.07)");
    glow.addColorStop(0.68, "rgba(255,111,159,0.025)");
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = 1;
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
  }

  function drawTunnel(state, time) {
    const travel = reduceMotion ? scrollProgress * 3.2 : time * 0.00018 + scrollProgress * 5;
    for (let ring = 0; ring < 10; ring += 1) {
      const z = -2 + ((ring * 3.15 - travel * 2.1 + 32) % 32);
      const halfWidth = 4.7;
      const floor = -1.45;
      const roof = 3.1;
      const alpha = 0.035 + ring * 0.006;
      const color = palette[ring % palette.length];
      line3d([-halfWidth, floor, z], [halfWidth, floor, z], state, color, alpha);
      line3d([halfWidth, floor, z], [halfWidth, roof, z], state, color, alpha);
      line3d([halfWidth, roof, z], [-halfWidth, roof, z], state, color, alpha);
      line3d([-halfWidth, roof, z], [-halfWidth, floor, z], state, color, alpha);
    }

    [-3.6, -1.2, 1.2, 3.6].forEach((x, index) => {
      line3d([x, -1.43, -3], [x, -1.43, 29], state, palette[index], 0.08, index === 1 || index === 2 ? 1.2 : 0.8);
    });

    for (let z = -2; z < 28; z += 2.4) {
      line3d([-4.4, -1.44, z], [4.4, -1.44, z], state, "#58d6ca", 0.045);
    }
  }

  function drawParticles(state, time) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    particles.forEach((particle, index) => {
      const motion = reduceMotion ? 0 : time * (0.00016 + (index % 4) * 0.000018);
      const z = 0.5 + ((particle.z - motion * 18 + scrollProgress * 10 + 30) % 30);
      const orbit = reduceMotion ? 0 : time * 0.00008 + particle.phase;
      const point = [
        particle.x + Math.sin(orbit) * 0.42,
        particle.y + Math.cos(orbit * 1.3) * 0.28,
        z
      ];
      const screen = project(point, state);
      if (!screen || screen.x < -20 || screen.x > width + 20 || screen.y < -20 || screen.y > height + 20) {
        return;
      }
      const depth = Math.max(0.12, 1 - screen.z / 38);
      ctx.globalAlpha = depth * 0.48;
      ctx.fillStyle = particle.color;
      ctx.shadowColor = particle.color;
      ctx.shadowBlur = 5 + depth * 8;
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, Math.max(0.45, particle.size * screen.scale * 0.016), 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  function drawNebula(state, time) {
    const travel = reduceMotion ? scrollProgress * 3 : time * 0.00013 + scrollProgress * 4.6;
    const densityPulse = 0.7 + Math.sin(scrollProgress * Math.PI * 6) * 0.18;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    nebula.forEach((cloud, index) => {
      const angle = cloud.angle + travel * (index % 2 ? 0.34 : -0.22);
      const radius = cloud.radius * (0.92 + Math.sin(travel + cloud.phase) * 0.12);
      const point = [
        Math.sin(angle) * radius,
        Math.cos(angle * 1.14) * radius * 0.72,
        cloud.z + Math.sin(angle * 0.7) * 0.48
      ];
      const screen = project(point, state);
      if (!screen) {
        return;
      }
      const depth = Math.max(0.22, 1 - screen.z / 18);
      const size = cloud.size * (0.62 + screen.scale * 0.018) * densityPulse;
      ctx.globalAlpha = (0.1 + depth * 0.16) * (index % 5 === 0 ? 1.35 : 1);
      ctx.drawImage(glowSprites[cloud.colorIndex], screen.x - size / 2, screen.y - size / 2, size, size);
    });

    ctx.restore();
  }

  function drawHalo(state) {
    const pulse = 0.5 + Math.sin(scrollProgress * Math.PI * 8) * 0.5;
    for (let halo = 0; halo < 3; halo += 1) {
      const radius = 1.7 + halo * 0.48 + pulse * 0.18;
      const points = 56;
      for (let step = 0; step < points; step += 1) {
        const a = (step / points) * Math.PI * 2;
        const b = ((step + 1) / points) * Math.PI * 2;
        line3d(
          [Math.cos(a) * radius, Math.sin(a) * radius, -0.35 - halo * 0.16],
          [Math.cos(b) * radius, Math.sin(b) * radius, -0.35 - halo * 0.16],
          state,
          palette[(halo + 1) % palette.length],
          0.06 + pulse * 0.025
        );
      }
    }
  }

  function drawWheel(state, x, z, color) {
    const radius = 0.4;
    const rimRadius = radius * 0.66;
    const segments = 28;
    const tirePoints = Array.from({ length: segments }, (_, step) => {
      const angle = step / segments * Math.PI * 2;
      return project([x, -0.4 + Math.cos(angle) * radius, z + Math.sin(angle) * radius], state);
    });
    const rimPoints = Array.from({ length: segments }, (_, step) => {
      const angle = step / segments * Math.PI * 2;
      return project([x, -0.4 + Math.cos(angle) * rimRadius, z + Math.sin(angle) * rimRadius], state);
    });

    if (tirePoints.every(Boolean) && rimPoints.every(Boolean)) {
      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 0.86;
      ctx.fillStyle = "#060a13";
      ctx.beginPath();
      ctx.moveTo(tirePoints[0].x, tirePoints[0].y);
      tirePoints.slice(1).forEach((point) => ctx.lineTo(point.x, point.y));
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 0.72;
      ctx.fillStyle = "#17243a";
      ctx.beginPath();
      ctx.moveTo(rimPoints[0].x, rimPoints[0].y);
      rimPoints.slice(1).forEach((point) => ctx.lineTo(point.x, point.y));
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    for (let step = 0; step < segments; step += 1) {
      const a = (step / segments) * Math.PI * 2;
      const b = ((step + 1) / segments) * Math.PI * 2;
      line3d(
        [x, -0.4 + Math.cos(a) * radius, z + Math.sin(a) * radius],
        [x, -0.4 + Math.cos(b) * radius, z + Math.sin(b) * radius],
        state,
        color,
        0.58,
        1.35
      );
      line3d(
        [x, -0.4 + Math.cos(a) * rimRadius, z + Math.sin(a) * rimRadius],
        [x, -0.4 + Math.cos(b) * rimRadius, z + Math.sin(b) * rimRadius],
        state,
        "#8fa9d6",
        0.42,
        0.8
      );
    }
    for (let spoke = 0; spoke < 6; spoke += 1) {
      const angle = (spoke / 6) * Math.PI * 2 + scrollProgress * Math.PI * 5;
      line3d(
        [x, -0.4, z],
        [x, -0.4 + Math.cos(angle) * rimRadius, z + Math.sin(angle) * rimRadius],
        state,
        "#f2c66d",
        0.22,
        0.75
      );
    }
  }

  function deformCarPoint(point, impact) {
    const [x, y, z] = point;
    if (z <= 0.82 || impact <= 0) {
      return [x, y, z];
    }
    const influence = Math.min(1, (z - 0.82) / 1.43);
    return [
      x * (1 + impact * influence * 0.22),
      y + Math.sin(x * 3.2 + z) * impact * influence * 0.09,
      z - impact * influence * 0.88
    ];
  }

  function drawWireframeCar(state) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.shadowColor = "#7598d4";
    ctx.shadowBlur = 6;

    const spotlight = ctx.createRadialGradient(
      state.centerX,
      state.centerY + Math.min(width, height) * 0.09,
      4,
      state.centerX,
      state.centerY + Math.min(width, height) * 0.09,
      Math.min(width, height) * 0.3
    );
    spotlight.addColorStop(0, "rgba(91,130,196,0.12)");
    spotlight.addColorStop(0.46, "rgba(169,145,255,0.045)");
    spotlight.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = 1;
    ctx.fillStyle = spotlight;
    ctx.fillRect(0, 0, width, height);

    const deformedVertices = carVertices.map((vertex) => deformCarPoint(vertex, state.impact));

    // Wheels sit behind the bodywork, giving the silhouette proper wheel arches.
    const wheelX = 1.13 + state.explode * 0.12 + state.impact * 0.1;
    [-1.42, 1.36].forEach((z, axle) => {
      const wheelZ = axle ? z - state.impact * 0.28 : z;
      drawWheel(state, -wheelX, wheelZ, axle ? "#698bc0" : "#536f9f");
      drawWheel(state, wheelX, wheelZ, axle ? "#698bc0" : "#536f9f");
      line3d([-wheelX, -0.4, wheelZ], deformCarPoint([-0.83, -0.1, z], state.impact), state, "#9fb5dc", 0.11, 0.7);
      line3d([wheelX, -0.4, wheelZ], deformCarPoint([0.83, -0.1, z], state.impact), state, "#9fb5dc", 0.11, 0.7);
    });

    carFaces.forEach((face) => face3d(face.points, state, face.color, face.alpha * 1.6, deformedVertices));

    carEdges.forEach(([from, to], index) => {
      const isCanopy = index >= 24;
      line3d(
        deformedVertices[from],
        deformedVertices[to],
        state,
        isCanopy ? (index % 3 === 0 ? "#7595c8" : "#a9c2eb") : (index % 5 === 0 ? "#7393ca" : "#7aa6d8"),
        isCanopy ? 0.38 : 0.48,
        isCanopy ? 1.05 : 1.35
      );
    });

    // Recognizable automotive details: hood creases, glass divider, lamps and mirrors.
    [-0.34, 0.34].forEach((x) => {
      line3d(deformCarPoint([x, 0.12, 1.08], state.impact), deformCarPoint([x * 0.68, -0.01, 2.12], state.impact), state, "#a9c6ef", 0.36, 0.9);
    });
    line3d([-0.66, 0.09, -2.14], [0.66, 0.09, -2.14], state, "#ff6f9f", 0.5, 2);
    line3d(deformCarPoint([-0.7, 0.01, 2.18], state.impact), deformCarPoint([0.7, 0.01, 2.18], state.impact), state, "#e9f5ff", 0.7, 2.6);
    line3d(deformCarPoint([-0.65, 0.01, 2.2], state.impact), deformCarPoint([-0.31, 0.05, 2.23], state.impact), state, "#ffffff", 0.82, 2.2);
    line3d(deformCarPoint([0.31, 0.05, 2.23], state.impact), deformCarPoint([0.65, 0.01, 2.2], state.impact), state, "#ffffff", 0.82, 2.2);
    line3d([0, 0.73, -0.98], deformCarPoint([0, 0.69, 0.56], state.impact), state, "#8da8d2", 0.2, 0.7);
    line3d([-1.01, 0.14, 0.34], [-1.28, 0.18, 0.16], state, "#7899cc", 0.43, 1.05);
    line3d([-1.28, 0.18, 0.16], [-1.03, 0.14, 0.06], state, "#7899cc", 0.32, 0.85);
    line3d([1.01, 0.14, 0.34], [1.28, 0.18, 0.16], state, "#7899cc", 0.43, 1.05);
    line3d([1.28, 0.18, 0.16], [1.03, 0.14, 0.06], state, "#7899cc", 0.32, 0.85);
    ctx.restore();
  }

  function drawCar(state, time) {
    if (!conceptCarReady) {
      drawWireframeCar(state);
      return;
    }

    const baseSize = conceptCarDimensions();
    const motionScale = 0.96 + Math.sin(scrollProgress * Math.PI * 3.2) * 0.025;
    const carWidth = baseSize.width * motionScale;
    const carHeight = baseSize.height * motionScale;
    const impactCompression = 1 - state.impact * 0.11;
    const pointerLean = reduceMotion ? 0 : pointerX * 0.026;
    const roadPitch = reduceMotion ? 0 : pointerY * 0.012;
    const float = reduceMotion ? 0 : Math.sin(time * 0.0014) * 2.5;
    const imageX = -carWidth * 0.5;
    const imageY = -carHeight * 0.5;

    ctx.save();
    ctx.translate(state.centerX, state.centerY + float);
    ctx.rotate(pointerLean * 0.45 + Math.sin(scrollProgress * Math.PI * 2) * 0.006);
    ctx.transform(1 + state.impact * 0.035, roadPitch, pointerLean, impactCompression, 0, 0);

    const groundGlow = ctx.createRadialGradient(0, 0, 4, 0, 0, carHeight * 0.54);
    groundGlow.addColorStop(0, `rgba(83,126,196,${0.2 - state.impact * 0.06})`);
    groundGlow.addColorStop(0.48, "rgba(88,214,202,0.065)");
    groundGlow.addColorStop(1, "rgba(20,30,62,0)");
    ctx.fillStyle = groundGlow;
    ctx.fillRect(-carWidth * 0.8, -carHeight * 0.56, carWidth * 1.6, carHeight * 1.12);

    const crashBlend = crashedCarReady ? smoothstep(0.04, 0.92, state.impact) : 0;
    ctx.globalAlpha = 0.83 * (1 - crashBlend);
    ctx.shadowColor = "rgba(105,151,225,0.58)";
    ctx.shadowBlur = 18;
    ctx.drawImage(conceptCarImage, imageX, imageY, carWidth, carHeight);

    if (crashBlend > 0) {
      ctx.globalAlpha = 0.83 * crashBlend;
      ctx.shadowColor = `rgba(255,132,78,${0.3 * crashBlend})`;
      ctx.shadowBlur = 18 + crashBlend * 14;
      ctx.drawImage(crashedCarImage, imageX, imageY, carWidth, carHeight);
    }

    // Loading fallback: mechanically crush the nose until the matched crash sprite is ready.
    if (!crashedCarReady && state.impact > 0.01) {
      const sourceNoseY = conceptCarImage.naturalHeight * 0.74;
      const sourceNoseHeight = conceptCarImage.naturalHeight * 0.26;
      const noseY = imageY + carHeight * 0.74;
      const noseHeight = carHeight * 0.26;
      ctx.save();
      ctx.translate(0, -state.impact * 13);
      ctx.rotate(state.impact * 0.012);
      ctx.globalAlpha = 0.48 * state.impact;
      ctx.drawImage(
        conceptCarImage,
        0,
        sourceNoseY,
        conceptCarImage.naturalWidth,
        sourceNoseHeight,
        imageX,
        noseY,
        carWidth,
        noseHeight * (1 - state.impact * 0.18)
      );
      ctx.restore();
    }

    // Fine highlight sweep reacts to scroll and pointer movement.
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = 0.12;
    const sweepY = imageY + carHeight * (0.3 + scrollProgress * 0.42 + pointerY * 0.035);
    const sweep = ctx.createLinearGradient(0, sweepY - 70, 0, sweepY + 70);
    sweep.addColorStop(0, "rgba(255,255,255,0)");
    sweep.addColorStop(0.5, "rgba(181,220,255,0.72)");
    sweep.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = sweep;
    ctx.fillRect(imageX, imageY, carWidth, carHeight);
    ctx.restore();
  }

  function drawCrashWall(state) {
    if (state.crash <= 0.001) {
      return;
    }

    const wallY = height * (1.02 - state.crash * 0.145);
    const wallLeft = width * 0.1;
    const wallWidth = width * 0.8;
    const wallHeight = Math.max(42, Math.min(72, height * 0.075));
    ctx.save();
    ctx.globalAlpha = state.crash * 0.72;
    const wallGradient = ctx.createLinearGradient(0, wallY - wallHeight / 2, 0, wallY + wallHeight / 2);
    wallGradient.addColorStop(0, "rgba(105,102,145,0.9)");
    wallGradient.addColorStop(0.18, "rgba(34,39,68,0.96)");
    wallGradient.addColorStop(0.76, "rgba(18,23,46,0.98)");
    wallGradient.addColorStop(1, "rgba(8,12,28,0.98)");
    ctx.fillStyle = wallGradient;
    ctx.strokeStyle = "rgba(169,145,255,0.68)";
    ctx.lineWidth = 1.4;
    ctx.fillRect(wallLeft, wallY - wallHeight / 2, wallWidth, wallHeight);
    ctx.strokeRect(wallLeft, wallY - wallHeight / 2, wallWidth, wallHeight);

    ctx.save();
    ctx.beginPath();
    ctx.rect(wallLeft, wallY - wallHeight / 2, wallWidth, wallHeight);
    ctx.clip();
    ctx.globalAlpha = state.crash * 0.34;
    ctx.lineWidth = 7;
    for (let stripe = -wallHeight; stripe < wallWidth + wallHeight; stripe += 48) {
      ctx.strokeStyle = stripe % 96 === 0 ? "#f2c66d" : "#ff6f9f";
      ctx.beginPath();
      ctx.moveTo(wallLeft + stripe, wallY + wallHeight / 2);
      ctx.lineTo(wallLeft + stripe + wallHeight, wallY - wallHeight / 2);
      ctx.stroke();
    }
    ctx.restore();

    ctx.globalAlpha = state.crash * 0.52;
    ctx.fillStyle = "#f9f7ff";
    ctx.font = "800 10px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("CRASHWORTHINESS BARRIER", width / 2, wallY + 3);

    if (state.impact > 0.02) {
      ctx.globalAlpha = state.impact * 0.55;
      ctx.strokeStyle = "#d9e8ff";
      ctx.lineWidth = 1.15;
      for (let crack = 0; crack < 11; crack += 1) {
        const angle = -Math.PI * 0.92 + crack / 10 * Math.PI * 0.84;
        const length = (18 + crack % 4 * 11) * state.impact;
        ctx.beginPath();
        ctx.moveTo(state.centerX, wallY);
        ctx.lineTo(state.centerX + Math.cos(angle) * length, wallY + Math.sin(angle) * length);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawImpact(state, time) {
    if (state.impact <= 0.001) {
      return;
    }

    const carSize = conceptCarDimensions();
    const impactCenter = {
      x: state.centerX,
      y: state.centerY + carSize.height * 0.49
    };

    const blast = state.impact;
    const clock = reduceMotion ? 0.72 : time * 0.001;
    const sceneScale = Math.min(width, height);

    // Hot smoke rolls outward behind the flash so the impact has volume.
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    for (let plume = 0; plume < 9; plume += 1) {
      const angle = plume * 2.399 + Math.sin(clock * 0.7 + plume) * 0.16;
      const drift = (34 + plume % 4 * 17) * blast;
      const plumeX = impactCenter.x + Math.cos(angle) * drift;
      const plumeY = impactCenter.y + Math.sin(angle) * drift * 0.68 - blast * 12;
      const plumeRadius = (42 + plume % 3 * 19) * blast;
      const smoke = ctx.createRadialGradient(plumeX, plumeY, 0, plumeX, plumeY, plumeRadius);
      smoke.addColorStop(0, `rgba(255,111,70,${0.15 * blast})`);
      smoke.addColorStop(0.28, `rgba(242,198,109,${0.1 * blast})`);
      smoke.addColorStop(0.62, `rgba(169,145,255,${0.075 * blast})`);
      smoke.addColorStop(1, "rgba(43,38,78,0)");
      ctx.fillStyle = smoke;
      ctx.fillRect(plumeX - plumeRadius, plumeY - plumeRadius, plumeRadius * 2, plumeRadius * 2);
    }
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const flicker = reduceMotion ? 1 : 0.9 + Math.sin(clock * 23) * 0.1;
    const radius = (34 + blast * sceneScale * 0.31) * flicker;
    const flare = ctx.createRadialGradient(impactCenter.x, impactCenter.y, 0, impactCenter.x, impactCenter.y, radius);
    flare.addColorStop(0, `rgba(255,255,255,${0.98 * blast})`);
    flare.addColorStop(0.08, `rgba(255,242,190,${0.86 * blast})`);
    flare.addColorStop(0.22, `rgba(255,141,65,${0.62 * blast})`);
    flare.addColorStop(0.48, `rgba(255,111,159,${0.31 * blast})`);
    flare.addColorStop(0.76, `rgba(169,145,255,${0.13 * blast})`);
    flare.addColorStop(1, "rgba(169,145,255,0)");
    ctx.fillStyle = flare;
    ctx.fillRect(impactCenter.x - radius, impactCenter.y - radius, radius * 2, radius * 2);

    // Fast expanding pressure rings sell the force without covering the content.
    for (let ring = 0; ring < 3; ring += 1) {
      const ringProgress = reduceMotion ? 0.58 + ring * 0.12 : (clock * 0.48 + ring / 3) % 1;
      const ringRadius = (34 + ringProgress * sceneScale * 0.34) * blast;
      ctx.globalAlpha = blast * Math.pow(1 - ringProgress, 2) * 0.72;
      ctx.strokeStyle = ring === 0 ? "#fff3c4" : palette[(ring + 2) % palette.length];
      ctx.lineWidth = 1 + (1 - ringProgress) * 4;
      ctx.beginPath();
      ctx.ellipse(impactCenter.x, impactCenter.y, ringRadius, ringRadius * 0.58, -0.12, 0, Math.PI * 2);
      ctx.stroke();
    }

    // A sharp horizontal/vertical flare gives the collision a cinematic snap.
    const flareLength = sceneScale * 0.34 * blast;
    const flareGradient = ctx.createLinearGradient(impactCenter.x - flareLength, 0, impactCenter.x + flareLength, 0);
    flareGradient.addColorStop(0, "rgba(255,198,109,0)");
    flareGradient.addColorStop(0.48, `rgba(255,227,172,${0.54 * blast})`);
    flareGradient.addColorStop(0.5, `rgba(255,255,255,${0.92 * blast})`);
    flareGradient.addColorStop(0.52, `rgba(255,227,172,${0.54 * blast})`);
    flareGradient.addColorStop(1, "rgba(255,198,109,0)");
    ctx.globalAlpha = 1;
    ctx.fillStyle = flareGradient;
    ctx.fillRect(impactCenter.x - flareLength, impactCenter.y - 1.5, flareLength * 2, 3);

    // Sparks use staggered ages, creating trails instead of a static starburst.
    for (let spark = 0; spark < 68; spark += 1) {
      const angle = spark * 2.399 + Math.sin(spark * 5.17) * 0.3;
      const age = reduceMotion ? 0.64 : (clock * (0.52 + spark % 5 * 0.035) + spark * 0.073) % 1;
      const speed = 78 + spark % 11 * 13;
      const distance = speed * age * blast;
      const gravity = age * age * (46 + spark % 4 * 8) * blast;
      const x = impactCenter.x + Math.cos(angle) * distance;
      const y = impactCenter.y + Math.sin(angle) * distance * 0.72 + gravity;
      const trail = (12 + spark % 6 * 4) * (1 - age) * blast;
      ctx.globalAlpha = blast * Math.pow(1 - age, 1.35) * (0.45 + spark % 3 * 0.18);
      ctx.strokeStyle = spark % 5 === 0 ? "#ffffff" : spark % 2 ? "#ffb45f" : "#ff6f9f";
      ctx.lineWidth = spark % 7 === 0 ? 2.4 : 1.05;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - Math.cos(angle) * trail, y - Math.sin(angle) * trail * 0.72 - trail * 0.18);
      ctx.stroke();
    }

    // Larger bodywork fragments stay around the wreck while sparks keep moving.
    for (let fragment = 0; fragment < 18; fragment += 1) {
      const angle = fragment * 2.399 + 0.28;
      const travel = (48 + fragment % 6 * 18) * blast;
      const x = impactCenter.x + Math.cos(angle) * travel;
      const y = impactCenter.y + Math.sin(angle) * travel * 0.62 + blast * blast * (fragment % 4) * 7;
      const size = (2.5 + fragment % 5 * 1.15) * blast;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle + clock * (fragment % 2 ? 1.7 : -1.3));
      ctx.globalAlpha = blast * 0.62;
      ctx.fillStyle = palette[(fragment + 1) % palette.length];
      ctx.beginPath();
      ctx.moveTo(size * 1.8, 0);
      ctx.lineTo(-size, size * 0.75);
      ctx.lineTo(-size * 0.55, -size);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  function drawExperienceOrbit(state, time) {
    const orbit = (reduceMotion ? 0 : time * 0.0001) + scrollProgress * Math.PI * 2.6;
    const panelWidth = 2.05;
    const panelHeight = 1.08;
    const radius = 4.15;
    const placements = experiences.map((experience, index) => {
      const angle = orbit + index / experiences.length * Math.PI * 2;
      return {
        ...experience,
        panelX: Math.sin(angle) * radius,
        panelY: (index % 2 === 0 ? 0.56 : -0.48) + Math.sin(angle * 1.4) * 0.24,
        panelZ: 0.8 + Math.cos(angle) * radius * 0.72,
        angle,
        index
      };
    }).sort((a, b) => b.panelZ - a.panelZ);

    placements.forEach((panel) => {
      const { panelX, panelY, panelZ } = panel;
      const x1 = panelX - panelWidth / 2;
      const x2 = panelX + panelWidth / 2;
      const y1 = panelY - panelHeight / 2;
      const y2 = panelY + panelHeight / 2;
      const corners = [
        project([x1, y1, panelZ], state),
        project([x2, y1, panelZ], state),
        project([x2, y2, panelZ], state),
        project([x1, y2, panelZ], state)
      ];

      if (corners.every(Boolean)) {
        const depthVisibility = Math.max(0.38, Math.min(1, 0.78 - panelZ * 0.07));
        const glass = ctx.createLinearGradient(corners[0].x, corners[0].y, corners[2].x, corners[2].y);
        glass.addColorStop(0, `${panel.color}10`);
        glass.addColorStop(0.52, `${panel.color}3d`);
        glass.addColorStop(1, "#ffffff08");
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = depthVisibility;
        ctx.fillStyle = glass;
        ctx.beginPath();
        ctx.moveTo(corners[0].x, corners[0].y);
        corners.slice(1).forEach((corner) => ctx.lineTo(corner.x, corner.y));
        ctx.closePath();
        ctx.fill();

        const center = project([panelX, panelY, panelZ], state);
        ctx.globalAlpha = 0.3 * depthVisibility;
        ctx.fillStyle = "#f9f7ff";
        ctx.font = "800 9px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(panel.label, center.x, center.y - 2);
        ctx.globalAlpha = 0.23 * depthVisibility;
        ctx.font = "600 7px Inter, sans-serif";
        ctx.fillText(panel.role, center.x, center.y + 11);
        ctx.restore();

        const edgeAlpha = 0.055 * depthVisibility;
        line3d([x1, y1, panelZ], [x2, y1, panelZ], state, panel.color, edgeAlpha, 0.9);
        line3d([x2, y1, panelZ], [x2, y2, panelZ], state, panel.color, edgeAlpha, 0.9);
        line3d([x2, y2, panelZ], [x1, y2, panelZ], state, panel.color, edgeAlpha, 0.9);
        line3d([x1, y2, panelZ], [x1, y1, panelZ], state, panel.color, edgeAlpha, 0.9);
        line3d([x1 + 0.16, y1 + 0.18, panelZ], [x1 + panelWidth * 0.56, y1 + 0.18, panelZ], state, panel.color, edgeAlpha * 0.72);
        line3d([x1 + 0.16, y2 - 0.16, panelZ], [x1 + panelWidth * 0.78, y2 - 0.16, panelZ], state, panel.color, edgeAlpha * 0.5);
      }
    });
  }

  function draw(time) {
    ctx.clearRect(0, 0, width, height);
    const state = sceneState(time);
    drawBloom(state);
    drawTunnel(state, time);
    drawParticles(state, time);
    drawNebula(state, time);
    drawHalo(state);
    drawCrashWall(state);
    drawCar(state, time);
    drawImpact(state, time);
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  function animate(time) {
    const delta = Math.min(32, time - lastTime || 16);
    lastTime = time;
    scrollProgress += (targetScrollProgress - scrollProgress) * Math.min(1, delta * 0.0065);
    pointerX += (targetPointerX - pointerX) * Math.min(1, delta * 0.005);
    pointerY += (targetPointerY - pointerY) * Math.min(1, delta * 0.005);
    scrollVelocity *= 0.93;
    draw(time + scrollVelocity * 12);
    requestAnimationFrame(animate);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("load", updateStoryAnchors, { once: true });
  window.addEventListener("scroll", () => {
    const nextScrollY = window.scrollY;
    scrollVelocity = Math.min(30, scrollVelocity + Math.abs(nextScrollY - lastScrollY) * 0.08);
    lastScrollY = nextScrollY;
    targetScrollProgress = measureScroll();
    if (reduceMotion) {
      scrollProgress = targetScrollProgress;
      draw(0);
    }
  }, { passive: true });

  if (!reduceMotion) {
    window.addEventListener("pointermove", (event) => {
      targetPointerX = event.clientX / window.innerWidth * 2 - 1;
      targetPointerY = event.clientY / window.innerHeight * 2 - 1;
    }, { passive: true });
  }

  resize();
  scrollProgress = measureScroll();
  targetScrollProgress = scrollProgress;
  document.body.classList.add("scene-ready");

  if (reduceMotion) {
    draw(0);
  } else {
    requestAnimationFrame(animate);
  }
})();
