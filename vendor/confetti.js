(() => {
  const DEFAULTS = {
    particleCount: 80,
    spread: 70,
    startVelocity: 40,
    gravity: 0.9,
    scalar: 1,
    origin: { x: 0.5, y: 0.5 },
  };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  function createCanvas() {
    const canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.inset = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "9999";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    return canvas;
  }

  function makeParticles(opts, width, height) {
    const particles = [];
    const angleStart = randomInRange(-opts.spread / 2, opts.spread / 2);
    for (let i = 0; i < opts.particleCount; i += 1) {
      const angle = ((angleStart + (opts.spread / opts.particleCount) * i) * Math.PI) / 180;
      const velocity = randomInRange(opts.startVelocity * 0.6, opts.startVelocity);
      const color = `hsl(${Math.floor(randomInRange(0, 360))} 90% 60%)`;
      particles.push({
        x: opts.origin.x * width,
        y: opts.origin.y * height,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        color,
        size: opts.scalar * randomInRange(4, 8),
        rotation: randomInRange(0, Math.PI * 2),
        rotationSpeed: randomInRange(-0.2, 0.2),
      });
    }
    return particles;
  }

  function drawParticle(ctx, particle) {
    ctx.save();
    ctx.translate(particle.x, particle.y);
    ctx.rotate(particle.rotation);
    ctx.fillStyle = particle.color;
    ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
    ctx.restore();
  }

  function confetti(options = {}) {
    const opts = {
      ...DEFAULTS,
      ...options,
      origin: { ...DEFAULTS.origin, ...(options.origin || {}) },
    };
    const canvas = createCanvas();
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      canvas.remove();
      return;
    }
    const particles = makeParticles(opts, canvas.width, canvas.height);
    const start = performance.now();
    const duration = 1200;

    function update(now) {
      const elapsed = now - start;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((particle) => {
        particle.vy += opts.gravity * 0.2;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.rotation += particle.rotationSpeed;
        drawParticle(ctx, particle);
      });
      if (elapsed < duration) {
        requestAnimationFrame(update);
      } else {
        canvas.remove();
      }
    }

    requestAnimationFrame(update);
  }

  window.confetti = confetti;
})();
