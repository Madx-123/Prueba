/**
 * Lusion-Inspired Dynamic Canvas Engine & Interactive Aesthetics
 * Pure Vanilla JavaScript (No external frameworks, No TSX)
 * Supports live cursor fluid glowing trails, organic undulating particles/mesh,
 * magnetic buttons, dynamic sound-visualizer simulation, and scroll triggers.
 */

export function initLusionLanding() {
  const canvas = document.getElementById('lusion-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  // Mouse tracking with smooth lerp
  const mouse = {
    x: width / 2,
    y: height / 2,
    targetX: width / 2,
    targetY: height / 2,
    vx: 0,
    vy: 0,
    speed: 0,
    down: false
  };

  // Custom cursor elements
  const cursorFollower = document.querySelector('.lusion-cursor-follower');
  const cursorDot = document.querySelector('.lusion-cursor-dot');

  // Handle Resize
  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initNodes();
  });

  // Track Mouse movement
  window.addEventListener('mousemove', (e) => {
    mouse.targetX = e.clientX;
    mouse.targetY = e.clientY;
  });

  window.addEventListener('mousedown', () => {
    mouse.down = true;
    if (cursorFollower) cursorFollower.style.transform = `translate3d(${mouse.targetX}px, ${mouse.targetY}px, 0) scale(1.6)`;
  });

  window.addEventListener('mouseup', () => {
    mouse.down = false;
    if (cursorFollower) cursorFollower.style.transform = `translate3d(${mouse.targetX}px, ${mouse.targetY}px, 0) scale(1)`;
  });

  // Organic Mesh Nodes / Floating Lusion Energy particles
  const NODES_COUNT = Math.min(Math.floor((width * height) / 12000), 75);
  let nodes = [];

  class EnergyNode {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = initial ? Math.random() * width : Math.random() < 0.5 ? 0 : width;
      this.y = Math.random() * height;
      this.radius = 1.8 + Math.random() * 2.8;
      this.baseAlpha = 0.25 + Math.random() * 0.55;
      this.alpha = this.baseAlpha;
      this.vx = (Math.random() - 0.5) * 0.9;
      this.vy = (Math.random() - 0.5) * 0.9;
      this.colorHue = Math.random() > 0.4 ? 245 : 180; // Electric indigo or bright cyan/iridescent
      this.phase = Math.random() * Math.PI * 2;
      this.pulseSpeed = 0.02 + Math.random() * 0.03;
    }

    update(time) {
      this.phase += this.pulseSpeed;
      this.alpha = this.baseAlpha + Math.sin(this.phase) * 0.2;

      // React to mouse proximity
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 180) {
        const force = (180 - dist) / 180;
        const angle = Math.atan2(dy, dx);
        this.x -= Math.cos(angle) * force * 3;
        this.y -= Math.sin(angle) * force * 3;
      }

      this.x += this.vx;
      this.y += this.vy;

      // Wrap around bounds softly
      if (this.x < -20) this.x = width + 20;
      if (this.x > width + 20) this.x = -20;
      if (this.y < -20) this.y = height + 20;
      if (this.y > height + 20) this.y = -20;
    }

    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.colorHue}, 90%, 65%, ${Math.max(0, this.alpha)})`;
      ctx.shadowBlur = 12;
      ctx.shadowColor = `hsla(${this.colorHue}, 100%, 60%, 0.6)`;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  function initNodes() {
    nodes = [];
    for (let i = 0; i < NODES_COUNT; i++) {
      nodes.push(new EnergyNode());
    }
  }
  initNodes();

  // Dynamic Flow Waves (Lusion Signature fluid ribbons)
  let waveTime = 0;

  function drawFluidGlowRays() {
    // Ambient dark background with radial highlight around cursor
    const gradient = ctx.createRadialGradient(
      mouse.x,
      mouse.y,
      20,
      mouse.x,
      mouse.y,
      Math.max(width, height) * 0.55
    );
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.16)');
    gradient.addColorStop(0.35, 'rgba(59, 130, 246, 0.06)');
    gradient.addColorStop(0.7, 'rgba(15, 23, 42, 0.0)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  function drawConstellationLines() {
    const maxDist = 130;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.22;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(147, 197, 253, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
  }

  // Fluid ribbon curves simulation
  function drawLusionRibbons() {
    waveTime += 0.012;
    ctx.lineWidth = 1.2;

    for (let r = 0; r < 3; r++) {
      ctx.beginPath();
      const yOffset = height * 0.45 + Math.sin(waveTime + r * 1.5) * 45;
      const hue = 220 + r * 30;

      ctx.strokeStyle = `hsla(${hue}, 85%, 65%, 0.18)`;

      for (let x = 0; x <= width; x += 15) {
        const angle = (x * 0.0035) + waveTime + (r * 0.8);
        const mouseFactor = Math.max(0, 1 - Math.abs(x - mouse.x) / 350);
        const y = yOffset + Math.sin(angle) * (35 + mouseFactor * 60) + Math.cos(angle * 1.5) * 20;

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }
  }

  // Interactive 3D Card Hover Effect on Mockup / Showcase
  const interactiveCards = document.querySelectorAll('.lusion-hover-tilt');
  interactiveCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      const tiltX = (y / (rect.height / 2)) * -9; // degrees
      const tiltY = (x / (rect.width / 2)) * 9;

      card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px)`;

      // Dynamic light shine overlay
      const shine = card.querySelector('.lusion-card-glare');
      if (shine) {
        const shineX = ((e.clientX - rect.left) / rect.width) * 100;
        const shineY = ((e.clientY - rect.top) / rect.height) * 100;
        shine.style.background = `radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 65%)`;
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)`;
      const shine = card.querySelector('.lusion-card-glare');
      if (shine) {
        shine.style.background = 'transparent';
      }
    });
  });

  // Magnetic Button Effect (Lusion style pill buttons that drift with cursor across the entire app)
  const magneticButtons = document.querySelectorAll('.lusion-magnetic-btn, .btn, .segmented-btn, .topbar-nav-btn, .user-bubble-trigger');
  magneticButtons.forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);

      btn.style.transform = `translate3d(${relX * 0.18}px, ${relY * 0.18}px, 0)`;
      const span = btn.querySelector('.btn-label-magnetic') || btn.querySelector('span');
      if (span) {
        span.style.transform = `translate3d(${relX * 0.08}px, ${relY * 0.08}px, 0)`;
      }
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = `translate3d(0, 0, 0)`;
      const span = btn.querySelector('.btn-label-magnetic') || btn.querySelector('span');
      if (span) {
        span.style.transform = `translate3d(0, 0, 0)`;
      }
    });
  });

  // Animation Loop
  let isRunning = true;

  function renderLoop() {
    if (!isRunning) return;

    // Smooth Mouse position interpolation
    mouse.x += (mouse.targetX - mouse.x) * 0.1;
    mouse.y += (mouse.targetY - mouse.y) * 0.1;

    // Update custom cursor
    if (cursorFollower) {
      cursorFollower.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0)`;
    }
    if (cursorDot) {
      cursorDot.style.transform = `translate3d(${mouse.targetX}px, ${mouse.targetY}px, 0)`;
    }

    // Clean canvas with deep dark clear
    ctx.clearRect(0, 0, width, height);

    drawFluidGlowRays();
    drawLusionRibbons();

    // Update & draw nodes
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].update(waveTime);
      nodes[i].draw(ctx);
    }

    drawConstellationLines();

    requestAnimationFrame(renderLoop);
  }

  requestAnimationFrame(renderLoop);

  // Quick sound visualizer animation for the Lusion audio / pulse bar
  const visualizerBars = document.querySelectorAll('.lusion-eq-bar');
  if (visualizerBars.length > 0) {
    setInterval(() => {
      visualizerBars.forEach((bar) => {
        const heightPercent = 20 + Math.random() * 75;
        bar.style.height = `${heightPercent}%`;
      });
    }, 110);
  }
}
