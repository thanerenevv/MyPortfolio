(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const selector = '.repo-item, .timeline-item, .skills-grid, .profile-card, .readme-block';

  const observe = (root) => {
    root.querySelectorAll(selector).forEach((el, i) => {
      if (el.classList.contains('animate-on-scroll')) return;
      el.classList.add('animate-on-scroll');
      const siblings = Array.from(el.parentElement?.children || [el]);
      const idx = siblings.indexOf(el);
      el.style.setProperty('--anim-delay', `${Math.min(idx * 0.07, 0.42)}s`);
      io.observe(el);
    });
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

  observe(document);

  document.addEventListener('tabswitch', () => {
    const active = document.querySelector('.tab-panel.active');
    if (active) observe(active);
  });
})();

(function () {
  function switchTab(tabId) {
    document.querySelectorAll('.subnav-item').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tabId);
    });
    document.querySelectorAll('.tab-panel').forEach(p => {
      p.classList.toggle('active', p.id === 'panel-' + tabId);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.dispatchEvent(new Event('tabswitch'));
  }

  document.querySelectorAll('[data-tab]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      const tabId = el.dataset.tab;
      if (tabId) switchTab(tabId);
    });
  });
})();

(function () {
  document.querySelectorAll('.star-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const wasStarred = btn.dataset.starred === 'true';
      const nowStarred = !wasStarred;
      btn.dataset.starred = nowStarred.toString();
      btn.classList.toggle('starred', nowStarred);
      btn.querySelector('span').textContent = nowStarred ? 'Starred' : 'Star';

      const repoItem = btn.closest('.repo-item');
      if (repoItem) {
        const base = parseInt(repoItem.dataset.stars, 10) || 0;
        const next = nowStarred ? base + 1 : base;
        const countEl = repoItem.querySelector('.star-count');
        if (countEl) countEl.textContent = next;
        if (nowStarred) repoItem.dataset.stars = next;
      }
    });
  });
})();

(function () {
  const searchInput = document.getElementById('reposSearch');
  const langFilter = document.getElementById('filterLang');
  const typeFilter = document.getElementById('filterType');
  const sortFilter = document.getElementById('filterSort');
  const list = document.getElementById('reposList');
  const noResults = document.getElementById('noResults');
  if (!list) return;

  function applyFilters() {
    const q = (searchInput?.value || '').trim().toLowerCase();
    const lang = (langFilter?.value || '').toLowerCase();
    const type = (typeFilter?.value || '').toLowerCase();
    const sort = sortFilter?.value || 'updated';

    const items = Array.from(list.querySelectorAll('.repo-item'));
    let visibleCount = 0;

    items.forEach(item => {
      const name = (item.dataset.name || '').toLowerCase();
      const desc = (item.querySelector('.repo-desc')?.textContent || '').toLowerCase();
      const itemLang = (item.dataset.lang || '').toLowerCase();
      const itemType = (item.dataset.type || '').toLowerCase();

      const matchQ = !q || name.includes(q) || desc.includes(q);
      const matchLang = !lang || itemLang === lang;
      const matchType = !type || itemType === type;
      const visible = matchQ && matchLang && matchType;

      item.style.display = visible ? '' : 'none';
      if (visible) visibleCount++;
    });

    if (noResults) noResults.hidden = visibleCount > 0;

    const visible = items.filter(i => i.style.display !== 'none');
    visible.sort((a, b) => {
      if (sort === 'name') return (a.dataset.name || '').localeCompare(b.dataset.name || '');
      if (sort === 'stars') return parseInt(b.dataset.stars || 0, 10) - parseInt(a.dataset.stars || 0, 10);
      return (b.dataset.updated || '').localeCompare(a.dataset.updated || '');
    });
    visible.forEach(item => list.appendChild(item));
  }

  searchInput?.addEventListener('input', applyFilters);
  langFilter?.addEventListener('change', applyFilters);
  typeFilter?.addEventListener('change', applyFilters);
  sortFilter?.addEventListener('change', applyFilters);
})();

(function () {
  const btn = document.getElementById('downloadBtn');
  if (!btn) return;
  btn.addEventListener('click', () => window.print());
})();

