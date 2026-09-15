/* =========================================================
   NOVA — script.js
   Organized into small, single-purpose functions.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initActiveNavState();
  initHeroParallax();
  initProjectFilters();
  initBeforeAfterSlider();
  initScrollReveal();
  initConsultationForm();
});

/* ---------------------------------------------------------
   1. Mobile navigation
   --------------------------------------------------------- */
function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('mobileMenu');
  if (!toggle || !menu) return;

  const closeMenu = () => {
    menu.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };
  const openMenu = () => {
    menu.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMenu() : openMenu();
  });

  menu.querySelectorAll('[data-mobile-link]').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) closeMenu();
  });
}

/* ---------------------------------------------------------
   2. Active navigation state on scroll
   --------------------------------------------------------- */
function initActiveNavState() {
  const links = document.querySelectorAll('[data-nav-link]');
  const sections = Array.from(new Set(
    Array.from(links).map((l) => document.getElementById(l.getAttribute('href').slice(1)))
  )).filter(Boolean);

  if (!sections.length) return;

  const setActive = (id) => {
    links.forEach((link) => {
      const match = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('is-active', match);
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
}

/* ---------------------------------------------------------
   3. Subtle hero parallax (performance-aware)
   --------------------------------------------------------- */
function initHeroParallax() {
  const img = document.getElementById('heroImg');
  if (!img) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  let ticking = false;

  const update = () => {
    const offset = Math.min(window.scrollY * 0.12, 80);
    img.style.transform = `scale(1.06) translateY(${offset}px)`;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
}

/* ---------------------------------------------------------
   4. Selected work — category filtering
   --------------------------------------------------------- */
function initProjectFilters() {
  const buttons = document.querySelectorAll('.filter-btn');
  const projects = document.querySelectorAll('.project');
  if (!buttons.length || !projects.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      buttons.forEach((b) => {
        b.classList.toggle('is-active', b === btn);
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      });

      projects.forEach((project) => {
        const matches = filter === 'all' || project.dataset.category === filter;
        project.classList.toggle('is-hidden', !matches);
      });
    });
  });
}

/* ---------------------------------------------------------
   5. Before / After comparison slider
   --------------------------------------------------------- */
function initBeforeAfterSlider() {
  const wrap = document.getElementById('compareSlider');
  const after = document.getElementById('compareAfter');
  const divider = document.getElementById('compareDivider');
  if (!wrap || !after || !divider) return;

  let dragging = false;

  const setPosition = (percent) => {
    const clamped = Math.min(100, Math.max(0, percent));
    after.style.clipPath = `inset(0 0 0 ${clamped}%)`;
    divider.style.left = `${clamped}%`;
    wrap.setAttribute('aria-valuenow', Math.round(clamped));
  };

  const percentFromClientX = (clientX) => {
    const rect = wrap.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * 100;
  };

  const onMove = (clientX) => setPosition(percentFromClientX(clientX));

  // Mouse
  wrap.addEventListener('mousedown', (e) => {
    dragging = true;
    onMove(e.clientX);
  });
  window.addEventListener('mousemove', (e) => {
    if (dragging) onMove(e.clientX);
  });
  window.addEventListener('mouseup', () => { dragging = false; });

  // Touch
  wrap.addEventListener('touchstart', (e) => {
    dragging = true;
    onMove(e.touches[0].clientX);
  }, { passive: true });
  wrap.addEventListener('touchmove', (e) => {
    if (dragging) onMove(e.touches[0].clientX);
  }, { passive: true });
  wrap.addEventListener('touchend', () => { dragging = false; });

  // Keyboard
  wrap.addEventListener('keydown', (e) => {
    const current = parseFloat(wrap.getAttribute('aria-valuenow')) || 50;
    if (e.key === 'ArrowLeft') setPosition(current - 5);
    if (e.key === 'ArrowRight') setPosition(current + 5);
  });

  setPosition(50);
}

/* ---------------------------------------------------------
   6. Scroll reveal
   --------------------------------------------------------- */
function initScrollReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    items.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('is-visible'), index * 70);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  items.forEach((item) => observer.observe(item));
}

/* ---------------------------------------------------------
   7. Consultation form — validation + success state
   --------------------------------------------------------- */
function initConsultationForm() {
  const form = document.getElementById('consultForm');
  const success = document.getElementById('formSuccess');
  if (!form || !success) return;

  const rules = {
    name: (v) => v.trim().length >= 2 || 'Please enter your name.',
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || 'Please enter a valid email address.',
    projectType: (v) => v !== '' || 'Please select a project type.',
    budget: (v) => v !== '' || 'Please select an estimated budget.',
    message: (v) => v.trim().length >= 10 || 'Please tell us a little more about your space.',
  };

  const fieldIds = {
    name: 'fName',
    email: 'fEmail',
    projectType: 'fType',
    budget: 'fBudget',
    message: 'fMessage',
  };

  const showError = (name, message) => {
    const input = document.getElementById(fieldIds[name]);
    const errorEl = document.getElementById(`err-${name === 'projectType' ? 'type' : name}`);
    const field = input.closest('.field');
    field.classList.add('has-error');
    if (errorEl) errorEl.textContent = message;
  };

  const clearError = (name) => {
    const input = document.getElementById(fieldIds[name]);
    const errorEl = document.getElementById(`err-${name === 'projectType' ? 'type' : name}`);
    const field = input.closest('.field');
    field.classList.remove('has-error');
    if (errorEl) errorEl.textContent = '';
  };

  const validateField = (name) => {
    const input = document.getElementById(fieldIds[name]);
    const result = rules[name](input.value);
    if (result === true) {
      clearError(name);
      return true;
    }
    showError(name, result);
    return false;
  };

  Object.keys(rules).forEach((name) => {
    const input = document.getElementById(fieldIds[name]);
    input.addEventListener('blur', () => validateField(name));
    input.addEventListener('input', () => {
      if (input.closest('.field').classList.contains('has-error')) validateField(name);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const results = Object.keys(rules).map((name) => validateField(name));
    const isValid = results.every(Boolean);

    if (!isValid) {
      const firstInvalid = form.querySelector('.field.has-error input, .field.has-error select, .field.has-error textarea');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Frontend-only simulation — no data is sent anywhere.
    form.hidden = true;
    success.hidden = false;
    success.focus?.();
  });
}
