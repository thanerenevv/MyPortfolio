// ===== Scroll entrance animations =====
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // pin-card and award-card use CSS float animations — exclude from observer
  const selector = '.repo-item, .timeline-item, .skills-grid, .contact-form, .profile-card, .graph-wrap';

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

  // Observe initial visible panel
  observe(document);

  // Re-observe when tabs switch (new panel becomes visible)
  document.addEventListener('tabswitch', () => {
    const active = document.querySelector('.tab-panel.active');
    if (active) observe(active);
  });
})();

// ===== Tab switching =====
(function () {
  function switchTab(tabId) {
    document.querySelectorAll('.subnav-item').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tabId);
    });
    document.querySelectorAll('.topbar-nav a').forEach(a => {
      a.classList.toggle('active', a.dataset.tab === tabId);
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

// ===== Contribution graph (53 weeks × 7 days) =====
(function () {
  const graph = document.getElementById('graph');
  const monthsEl = document.getElementById('months');
  const countEl = document.getElementById('contribCount');
  if (!graph) return;

  const WEEKS = 53;
  const DAYS = 7;
  const activity = {};

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const end = new Date(today);
  end.setDate(end.getDate() - end.getDay());
  const start = new Date(end);
  start.setDate(start.getDate() - (WEEKS - 1) * 7 - 6);

  let total = 0;

  for (let w = 0; w < WEEKS; w++) {
    for (let d = 0; d < DAYS; d++) {
      const cellDate = new Date(start);
      cellDate.setDate(start.getDate() + w * 7 + d);

      if (cellDate > today) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.style.visibility = 'hidden';
        graph.appendChild(cell);
        continue;
      }

      const iso = cellDate.toISOString().slice(0, 10);
      const level = activity[iso] || 0;
      total += level > 0 ? 1 : 0;

      const cell = document.createElement('div');
      cell.className = 'cell' + (level > 0 ? ' lvl-' + level : '');
      cell.dataset.date = iso;
      cell.title = cellDate.toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
      }) + (level > 0 ? ' — ' + level + ' contribution' + (level > 1 ? 's' : '') : ' — No activity');
      graph.appendChild(cell);
    }
  }

  if (countEl) countEl.textContent = total.toString();

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  let lastMonth = -1;
  for (let w = 0; w < WEEKS; w++) {
    const d = new Date(start);
    d.setDate(start.getDate() + w * 7);
    const m = d.getMonth();
    if (m !== lastMonth && d.getDate() <= 7) {
      const span = document.createElement('span');
      span.textContent = monthNames[m];
      span.style.gridColumn = (w + 1) + '';
      monthsEl.appendChild(span);
      lastMonth = m;
    }
  }
})();

// ===== Edit profile (inline bio edit) =====
(function () {
  const btn = document.getElementById('editBtn');
  const bio = document.querySelector('.bio');
  if (!btn || !bio) return;
  let editing = false;

  btn.addEventListener('click', () => {
    if (!editing) {
      editing = true;
      btn.textContent = 'Save';
      const text = bio.textContent;
      bio.innerHTML = '';
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.rows = 3;
      ta.style.cssText = 'width:100%;font:inherit;padding:6px 8px;border:1px solid var(--border);border-radius:var(--radius);resize:vertical;outline:none;font-size:14px;';
      ta.addEventListener('focus', () => {
        ta.style.borderColor = 'var(--yellow)';
        ta.style.boxShadow = '0 0 0 3px rgba(245,197,24,.15)';
      });
      ta.addEventListener('blur', () => {
        ta.style.borderColor = 'var(--border)';
        ta.style.boxShadow = 'none';
      });
      bio.appendChild(ta);
      ta.focus();
    } else {
      editing = false;
      btn.textContent = 'Edit profile';
      const ta = bio.querySelector('textarea');
      if (ta) bio.textContent = ta.value;
    }
  });
})();

// ===== Follow button =====
(function () {
  const btn = document.getElementById('followBtn');
  const countEl = document.getElementById('followersCount');
  if (!btn || !countEl) return;
  let following = false;
  let count = parseInt(countEl.textContent, 10) || 0;

  btn.addEventListener('click', () => {
    following = !following;
    count += following ? 1 : -1;
    countEl.textContent = count;
    btn.textContent = following ? 'Unfollow' : 'Follow';
    btn.classList.toggle('following', following);
  });
})();

// ===== Star buttons (Projects tab) =====
(function () {
  document.querySelectorAll('.star-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const wasStarred = btn.dataset.starred === 'true';
      const nowStarred = !wasStarred;
      btn.dataset.starred = nowStarred.toString();
      btn.classList.toggle('starred', nowStarred);
      btn.querySelector('span').textContent = nowStarred ? 'Starred' : 'Star';

      // Update count in repo meta
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

// ===== Repos filter (Projects tab) =====
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

    // Sort visible items
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

// ===== Topbar search (filters pinned cards on overview) =====
(function () {
  const input = document.getElementById('topbarSearch');
  if (!input) return;
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    document.querySelectorAll('.pin-card').forEach(card => {
      card.style.display = !q || card.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });
})();

// ===== Download PDF (Resume tab) =====
(function () {
  const btn = document.getElementById('downloadBtn');
  if (!btn) return;
  btn.addEventListener('click', () => window.print());
})();

// ===== Contact form =====
(function () {
  const form = document.getElementById('contactForm');
  const success = document.getElementById('contactSuccess');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('contactName');
    const email = document.getElementById('contactEmail');
    const msg = document.getElementById('contactMsg');
    let valid = true;

    [name, email, msg].forEach(el => el.classList.remove('error'));

    if (!name.value.trim()) { name.classList.add('error'); valid = false; }
    if (!email.value.trim() || !email.value.includes('@')) { email.classList.add('error'); valid = false; }
    if (!msg.value.trim()) { msg.classList.add('error'); valid = false; }

    if (!valid) return;

    form.style.display = 'none';
    if (success) success.hidden = false;
  });
})();
