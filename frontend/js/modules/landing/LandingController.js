import { appRouter } from '../../app.js';

export default class LandingController {
  constructor(container) {
    this.container = container;
    this.root = container.querySelector('#lpv-root');
    this.header = container.querySelector('#lpv-header');
    this.stage = container.querySelector('#lpv-stage');
    this.cards = [...container.querySelectorAll('.lpv-fly')];
    this.navLinks = [...container.querySelectorAll('.lpv-nav a')];
    this.rotator = container.querySelector('#lpv-rotator');
    this.motionReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.raf = null;
    this.rotationTimer = null;
    this.rotationTransition = null;
    this.revealObserver = null;
    this.disposed = false;
    this.phraseIndex = 0;
    this.phrases = [
      'tu próximo lanzamiento?',
      'una promoción especial?',
      'una historia para tu marca?',
      'tu producto estrella?',
      'una novedad de tu negocio?'
    ];

    this.root.classList.add('lpv-ready');
    this.bindEvents();
    this.setupReveals();
    this.setupRotation();
    this.updateOnScroll();
  }

  bindEvents() {
    const go = (id, path) => {
      this.container.querySelector(`#${id}`)?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        appRouter.navigate(path);
      });
    };
    go('btn-login', '/login');
    go('btn-register', '/registro');
    go('btn-hero-register', '/registro');
    go('btn-last-register', '/registro');

    this.container.querySelector('#btn-demo')?.addEventListener('click', () => this.scrollTo('muestras'));

    this.container.querySelectorAll('[data-lpv-scroll]').forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault(); // El router de la SPA usa el hash; no debemos cambiarlo con #seccion.
        this.scrollTo(link.dataset.lpvScroll);
      });
    });

    this.onScroll = () => {
      if (this.raf !== null) return;
      this.raf = window.requestAnimationFrame(() => {
        this.raf = null;
        if (!this.disposed) this.updateOnScroll();
      });
    };
    this.onResize = () => this.onScroll();
    this.onRouteChange = () => {
      if ((window.location.hash.slice(1) || '/') !== '/') this.destroy();
    };
    window.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('resize', this.onResize, { passive: true });
    window.addEventListener('hashchange', this.onRouteChange);
  }

  scrollTo(sectionId) {
    const section = this.container.querySelector(`#${sectionId}`);
    if (!section) return;
    const top = Math.max(0, section.getBoundingClientRect().top + window.scrollY - 85);
    window.scrollTo({ top, behavior: this.motionReduced ? 'auto' : 'smooth' });
  }

  setupReveals() {
    const elements = this.container.querySelectorAll('[data-lpv-reveal]');
    if (this.motionReduced || !('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('lpv-visible'));
      return;
    }
    this.revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('lpv-visible');
        this.revealObserver?.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -30px 0px', threshold: 0.12 });
    elements.forEach((element) => this.revealObserver.observe(element));
  }

  setupRotation() {
    if (!this.rotator || this.motionReduced) return;
    this.rotationTimer = window.setInterval(() => {
      if (this.disposed) return;
      this.rotator.classList.add('lpv-switching');
      this.rotationTransition = window.setTimeout(() => {
        if (this.disposed) return;
        this.phraseIndex = (this.phraseIndex + 1) % this.phrases.length;
        this.rotator.textContent = this.phrases[this.phraseIndex];
        this.rotator.classList.remove('lpv-switching');
      }, 250);
    }, 3200);
  }

  updateOnScroll() {
    const scrollY = window.scrollY || 0;
    this.header?.classList.toggle('lpv-header-compact', scrollY > 48);
    const viewport = window.innerHeight || 800;
    let active = 'inicio';
    for (const id of ['inicio', 'muestras', 'aplicacion', 'nosotros']) {
      const section = this.container.querySelector(`#${id}`);
      if (section?.getBoundingClientRect().top <= viewport * 0.35) active = id;
    }
    this.navLinks.forEach((link) => {
      const current = link.dataset.lpvScroll === active;
      link.classList.toggle('is-current', current);
      if (current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });

    if (!this.stage) return;
    const stageRect = this.stage.getBoundingClientRect();
    // 0 al entrar la escena; 1 cuando las tarjetas han llegado a sus posiciones.
    const raw = (viewport * 0.91 - stageRect.top) / (viewport * 1.08);
    const progress = Math.max(0, Math.min(1, raw));
    const eased = 1 - Math.pow(1 - progress, 3);
    const desktop = window.innerWidth > 1060;

    this.cards.forEach((card) => {
      const amount = desktop && !this.motionReduced ? 1 - eased : 0;
      const x = Number(card.dataset.enterX || 0) * amount;
      const y = Number(card.dataset.enterY || 0) * amount;
      card.style.setProperty('--lpv-x', `${x.toFixed(1)}px`);
      card.style.setProperty('--lpv-y', `${y.toFixed(1)}px`);
      card.style.setProperty('--lpv-opacity', desktop && !this.motionReduced ? (0.12 + 0.88 * eased).toFixed(3) : '1');
    });
  }

  destroy() {
    if (this.disposed) return;
    this.disposed = true;
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('hashchange', this.onRouteChange);
    if (this.raf !== null) window.cancelAnimationFrame(this.raf);
    if (this.rotationTimer !== null) window.clearInterval(this.rotationTimer);
    if (this.rotationTransition !== null) window.clearTimeout(this.rotationTransition);
    this.revealObserver?.disconnect();
  }
}
