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

    document.addEventListener('click', e => {
      const btn = e.target.closest('.star-btn');
      if (btn) animate(btn, { scale: [1, 1.3, 1] }, { duration: 0.35, easing: sprSnap });
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
  document.addEventListener('click', e => {
    const btn = e.target.closest('.star-btn');
    if (!btn) return;

    const nowStarred = btn.dataset.starred !== 'true';
    btn.dataset.starred = nowStarred.toString();
    btn.classList.toggle('starred', nowStarred);
    btn.querySelector('span').textContent = nowStarred ? 'Starred' : 'Star';

    const repoItem = btn.closest('.repo-item');
    if (repoItem) {
      const base = parseInt(repoItem.dataset.stars, 10) || 0;
      const countEl = repoItem.querySelector('.star-count');
      if (countEl) countEl.textContent = base + (nowStarred ? 1 : 0);
    }
  });
})();

(function () {
  const USER = 'thanerenevv';
  const API = 'https://api.github.com';
  const PINNED = ['quiztime', 'ESP32-Radio', 'Eraser', 'AirOne'];
  const CACHE_MS = 10 * 60 * 1000;

  const LANG_COLORS = {
    'TypeScript': '#2b7489', 'JavaScript': '#f1e05a', 'C++': '#f34b7d', 'C': '#555555',
    'Python': '#3572A5', 'CSS': '#563d7c', 'HTML': '#e34c26', 'Java': '#b07219',
    'Shell': '#89e051', 'Go': '#00ADD8', 'Rust': '#dea584', 'Kotlin': '#A97BFF'
  };

  const STAR_PATH = 'M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z';
  const FORK_PATH = 'M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z';
  const BOOK_PATH = 'M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8Z';

  const esc = s => String(s).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
  const icon = (path, size) =>
    `<svg viewBox="0 0 16 16" width="${size}" height="${size}" fill="currentColor" aria-hidden="true"><path d="${path}"/></svg>`;
  const langDot = lang =>
    lang ? `<span class="lang"><i class="lang-dot" style="background:${LANG_COLORS[lang] || '#8b949e'}"></i> ${esc(lang)}</span>` : '';
  const fmtDate = iso =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  function fetchJSON(url) {
    const key = 'gh-cache:' + url;
    try {
      const hit = JSON.parse(localStorage.getItem(key));
      if (hit && Date.now() - hit.t < CACHE_MS) return Promise.resolve(hit.d);
    } catch (e) {}
    return fetch(url).then(r => {
      if (!r.ok) throw new Error('GitHub API ' + r.status);
      return r.json();
    }).then(d => {
      try { localStorage.setItem(key, JSON.stringify({ t: Date.now(), d })); } catch (e) {}
      return d;
    });
  }

  function renderProfile(data) {
    const q = s => document.querySelector(s);
    const id = s => document.getElementById(s);
    if (data.name)        q('.name').textContent     = data.name;
    if (data.login)       q('.username').textContent = '@' + data.login;
    if (data.bio != null) q('.bio').textContent      = data.bio;
    if (data.avatar_url)  q('.avatar img').src       = data.avatar_url;
    if (id('followersCount')) id('followersCount').textContent = data.followers ?? 0;
    if (id('followingCount')) id('followingCount').textContent = data.following ?? 0;
  }

  function renderPinned(repos) {
    const grid = document.querySelector('.pinned-grid');
    const byName = new Map(repos.map(r => [r.name.toLowerCase(), r]));
    const pinned = PINNED.map(n => byName.get(n.toLowerCase())).filter(Boolean);
    if (!grid || !pinned.length) return;

    grid.innerHTML = pinned.map(r => `
      <article class="pin-card">
        <header class="pin-head">
          ${icon(BOOK_PATH, 16)}
          <a href="${esc(r.html_url)}" target="_blank" rel="noopener">${esc(r.name)}</a>
          <span class="pin-public">Public</span>
        </header>
        <p class="pin-desc">${esc(r.description || 'No description provided.')}</p>
        <footer class="pin-foot">
          ${langDot(r.language)}
          <span class="stars">${icon(STAR_PATH, 14)} ${r.stargazers_count}</span>
          <span class="forks">${icon(FORK_PATH, 14)} ${r.forks_count}</span>
        </footer>
      </article>`).join('');
  }

  function renderRepos(repos) {
    const list = document.getElementById('reposList');
    if (!list || !repos.length) return;

    list.innerHTML = repos.map(r => `
      <article class="repo-item" data-lang="${esc((r.language || '').toLowerCase())}" data-type="public" data-stars="${r.stargazers_count}" data-name="${esc(r.name.toLowerCase())}" data-updated="${esc(r.pushed_at || r.updated_at)}">
        <div class="repo-item-main">
          <div class="repo-name-row">
            <a href="${esc(r.html_url)}" target="_blank" rel="noopener" class="repo-name">${esc(r.name)}</a>
            <span class="pin-public">Public</span>
          </div>
          <p class="repo-desc">${esc(r.description || 'No description provided.')}</p>
          <div class="repo-meta">
            ${langDot(r.language)}
            <span class="stars">${icon(STAR_PATH, 13)} <span class="star-count">${r.stargazers_count}</span></span>
            <span>Updated ${fmtDate(r.pushed_at || r.updated_at)}</span>
          </div>
        </div>
        <button class="star-btn" type="button" data-starred="false">
          ${icon(STAR_PATH, 15)}
          <span>Star</span>
        </button>
      </article>`).join('');

    // Language filter options come from the languages actually in use
    const langFilter = document.getElementById('filterLang');
    if (langFilter) {
      const langs = [...new Set(repos.map(r => r.language).filter(Boolean))].sort();
      langFilter.innerHTML = '<option value="">Language</option>' +
        langs.map(l => `<option value="${esc(l.toLowerCase())}">${esc(l)}</option>`).join('');
    }
  }

  function setupFilters() {
    const searchInput = document.getElementById('reposSearch');
    const langFilter = document.getElementById('filterLang');
    const typeFilter = document.getElementById('filterType');
    const sortFilter = document.getElementById('filterSort');
    const list = document.getElementById('reposList');
    const noResults = document.getElementById('noResults');
    if (!list) return () => {};

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
    return applyFilters;
  }

  const applyFilters = setupFilters();

  // Live data. If any request fails (offline, rate-limited), the static markup stays as a fallback.
  fetchJSON(`${API}/users/${USER}`).then(renderProfile).catch(() => {});

  fetchJSON(`${API}/users/${USER}/repos?per_page=100&type=owner`).then(all => {
    const repos = all.filter(r => !r.fork);
    renderPinned(repos);
    renderRepos(repos);
    applyFilters();
  }).catch(() => {});
})();

(function () {
  const btn = document.getElementById('downloadBtn');
  if (!btn) return;
  btn.addEventListener('click', () => window.print());
})();
