(() => {
  'use strict';

  // Reuse one catalog for the homepage previews and /experiments/ listing.
  async function loadExperiments() {
    const grids = [...document.querySelectorAll('[data-experiment-list]')];
    if (!grids.length) return;

    let projects;
    try {
      const response = await fetch('/experiments/catalog.json', { cache: 'no-cache' });
      if (!response.ok) throw new Error('Catalog unavailable');
      projects = await response.json();
      if (!Array.isArray(projects)) throw new Error('Invalid catalog');
    } catch (error) {
      for (const grid of grids) grid.replaceChildren(emptyMessage('Experiments could not be loaded.'));
      return;
    }

    // Every entry represents a real page, for example /experiments/example/.
    const valid = projects.filter(project =>
      project && typeof project.slug === 'string' &&
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug) &&
      typeof project.title === 'string' && project.title.trim()
    );

    const count = document.querySelector('[data-experiment-count]');
    if (count) count.textContent = `${valid.length} published`;

    for (const grid of grids) {
      const limit = Number(grid.dataset.limit) || valid.length;
      const visible = valid.slice(0, limit);
      grid.replaceChildren(...(visible.length
        ? visible.map(createCard)
        : [emptyMessage('projects will appear here')]));
    }
  }

  function emptyMessage(text) {
    const message = document.createElement('div');
    message.className = 'empty-state';
    message.textContent = text;
    return message;
  }

  function createCard(project) {
    const link = document.createElement('a');
    link.className = 'experiment-card';
    link.href = `/experiments/${project.slug}/`;

    const preview = document.createElement('div');
    preview.className = 'experiment-preview';

    if (typeof project.preview === 'string' && /^\/(?!\/)/.test(project.preview)) {
      const image = document.createElement('img');
      image.src = project.preview;
      image.alt = '';
      image.loading = 'lazy';
      image.addEventListener('error', () => {
        image.remove();
        addPreviewFallback(preview, project.title);
      });
      preview.append(image);
    } else {
      addPreviewFallback(preview, project.title);
    }

    const content = document.createElement('div');
    content.className = 'experiment-content';

    const category = document.createElement('span');
    category.className = 'experiment-category';
    category.textContent = project.category || 'Experiment';

    const heading = document.createElement('div');
    heading.className = 'experiment-heading';
    const title = document.createElement('h3');
    title.textContent = project.title;
    const arrow = document.createElement('span');
    arrow.className = 'experiment-arrow';
    arrow.textContent = '↗';
    arrow.setAttribute('aria-hidden', 'true');
    heading.append(title, arrow);
    content.append(category, heading);

    if (project.description) {
      const description = document.createElement('p');
      description.className = 'experiment-description';
      description.textContent = project.description;
      content.append(description);
    }

    link.append(preview, content);
    return link;
  }

  function addPreviewFallback(container, title) {
    const text = document.createElement('span');
    text.className = 'experiment-preview-text';
    text.textContent = title.slice(0, 2).toUpperCase();
    container.append(text);
  }

  // Floating dots from the main opel website: restrained and independent of scrolling.
  function startFloatingDots() {
    const canvas = document.getElementById('floating-dots');
    const context = canvas?.getContext('2d');
    if (!context) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let width = 0, height = 0, dots = [], frame = 0, lastFrame = 0;

    function newDot(scattered = false) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 5;
      const life = 8 + Math.random() * 10;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: .8 + Math.random() * 1.2,
        age: scattered ? Math.random() * life : 0,
        life
      };
    }

    function paint(dt) {
      context.clearRect(0, 0, width, height);
      for (let i = 0; i < dots.length; i++) {
        let dot = dots[i];
        dot.age += dt;
        if (dot.age >= dot.life) dot = dots[i] = newDot();
        dot.x += dot.vx * dt;
        dot.y += dot.vy * dt;
        const fade = Math.max(0, Math.min(1, dot.age / 2, (dot.life - dot.age) / 2));
        context.fillStyle = `rgba(88, 98, 112, ${fade * .65})`;
        context.beginPath();
        context.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        context.fill();
      }
    }

    function tick(now) {
      if (now - lastFrame >= 30) {
        paint(Math.min((now - lastFrame) / 1000, .06));
        lastFrame = now;
      }
      frame = requestAnimationFrame(tick);
    }

    function refresh() {
      cancelAnimationFrame(frame);
      paint(0);
      if (document.hidden || reducedMotion.matches) return;
      lastFrame = performance.now();
      frame = requestAnimationFrame(tick);
    }

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      context.setTransform(scale, 0, 0, scale, 0, 0);
      dots = Array.from({ length: Math.min(180, Math.ceil(width * height / 9000)) }, () => newDot(true));
      refresh();
    }

    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', refresh);
    reducedMotion.addEventListener('change', refresh);
    resize();
  }

  loadExperiments();
  startFloatingDots();
})();
