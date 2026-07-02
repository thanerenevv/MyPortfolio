(function () {
  try {
    if (typeof Motion === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const { animate, inView, stagger, spring } = Motion;

    const spr = spring({ stiffness: 180, damping: 22 });
    const sprSnap = spring({ stiffness: 260, damping: 28 });

    animate('.profile-card', { opacity: [0, 1], x: [-20, 0] }, { easing: spr });

    const pinCards = [...document.querySelectorAll('.pin-card')];
    if (pinCards.length) {
      animate(pinCards, { opacity: [0, 1], y: [24, 0] }, {
        delay: stagger(0.09),
        easing: spr
      });
    }

    const scrollEls = '.repo-item, .timeline-item, .skills-grid, .readme-block';
    document.querySelectorAll(scrollEls).forEach(el => {
      inView(el, () => {
        animate(el, { opacity: [0, 1], y: [20, 0] }, { easing: spr });
      }, { amount: 0.12 });
    });

    document.querySelectorAll('.star-btn').forEach(btn => {
btn.addEventListener('click', () => {
        animate(btn, { scale: [1, 1.3, 1] }, { duration: 0.35, easing: sprSnap });
      });
    });

    function animatePanel(panel) {
      animate(panel, { opacity: [0, 1], y: [10, 0] }, { duration: 0.28, easing: [0.22, 1, 0.36, 1] });

      const cards = [...panel.querySelectorAll('.pin-card, .award-card')];
      if (cards.length) {
        animate(cards, { opacity: [0, 1], y: [18, 0] }, {
          delay: stagger(0.07, { start: 0.06 }),
          easing: spr
        });
      }

      panel.querySelectorAll(scrollEls).forEach(el => {
        inView(el, () => {
          animate(el, { opacity: [0, 1], y: [20, 0] }, { easing: spr });
        }, { amount: 0.12 });
      });
    }

    document.addEventListener('tabswitch', () => {
      const active = document.querySelector('.tab-panel.active');
      if (active) animatePanel(active);
    });
  } catch (e) {
    console.warn('Motion animation failed:', e);
  }
})();

(function () {
  function switchTab(tabId) {
    const currentPanel = document.querySelector('.tab-panel.active');
    const nextPanel = document.getElementById('panel-' + tabId);

    if (!nextPanel || currentPanel === nextPanel) return;

    document.querySelectorAll('.subnav-item').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tabId);
    });

    function activate() {
      if (currentPanel) currentPanel.classList.remove('active');
      nextPanel.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.dispatchEvent(new Event('tabswitch'));
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (currentPanel && !reducedMotion) {
      currentPanel.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
      currentPanel.style.opacity = '0';
      currentPanel.style.transform = 'translateY(-8px)';
      setTimeout(() => {
        currentPanel.style.transition = '';
        currentPanel.style.opacity = '';
        currentPanel.style.transform = '';
        activate();
      }, 150);
    } else {
      activate();
    }
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

(function () {
  fetch('https://api.github.com/users/thanerenevv')
    .then(r => r.json())
    .then(data => {
      const q = s => document.querySelector(s);
      const id = s => document.getElementById(s);

      if (data.name)       q('.name').textContent        = data.name;
      if (data.login)      q('.username').textContent    = '@' + data.login;
      if (data.bio != null) q('.bio').textContent        = data.bio;
      if (data.avatar_url) q('.avatar img').src          = data.avatar_url;
      if (id('followersCount')) id('followersCount').textContent = data.followers ?? 0;
      if (id('followingCount')) id('followingCount').textContent = data.following ?? 0;
    })
    .catch(() => {});
})();

