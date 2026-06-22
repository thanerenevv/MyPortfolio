// ===== Generate the contribution graph (53 weeks × 7 days) =====
// All cells start empty (level 0). To populate with real activity,
// push {date, level} entries into the `activity` map below.
(function () {
  const graph = document.getElementById('graph');
  const monthsEl = document.getElementById('months');
  const countEl = document.getElementById('contribCount');
  if (!graph) return;

  const WEEKS = 53;
  const DAYS = 7;

  // Optional: fill this with real activity data.
  // Key = ISO date (YYYY-MM-DD), value = level (0–4)
  const activity = {};

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // The graph ends on the most recent Sunday.
  const end = new Date(today);
  end.setDate(end.getDate() - end.getDay());
  // Start = 52 weeks + 6 days before end → 53 columns total.
  const start = new Date(end);
  start.setDate(start.getDate() - (WEEKS - 1) * 7 - 6);

  let total = 0;

  for (let w = 0; w < WEEKS; w++) {
    for (let d = 0; d < DAYS; d++) {
      const cellDate = new Date(start);
      cellDate.setDate(start.getDate() + w * 7 + d);
      if (cellDate > today) {
        // Future cells: render as empty placeholder, no level.
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
      cell.dataset.level = level;
      cell.title = cellDate.toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
      }) + (level > 0 ? ' — ' + level + ' contribution' + (level > 1 ? 's' : '') : ' — No activity');

      graph.appendChild(cell);
    }
  }

  if (countEl) countEl.textContent = total.toString();

  // ===== Month labels =====
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

// ===== Tab switching + smooth scroll =====
(function () {
  const tabs = document.querySelectorAll('.subnav-item');
  tabs.forEach(tab => {
    tab.addEventListener('click', e => {
      e.preventDefault();
      const id = tab.getAttribute('href');
      if (!id) return;
      const el = document.querySelector(id);
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - 140;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // Scrollspy: highlight the active tab while scrolling.
  const sections = ['#overview', '#projects', '#activity']
    .map(s => document.querySelector(s))
    .filter(Boolean);

  const setActive = id => {
    tabs.forEach(t => t.classList.toggle('active', t.getAttribute('href') === '#' + id));
  };

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  }, { rootMargin: '-30% 0px -60% 0px' });

  sections.forEach(s => io.observe(s));
})();

// ===== Search filter (filters pinned project cards) =====
(function () {
  const input = document.querySelector('.topbar-search input');
  if (!input) return;
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    document.querySelectorAll('.pin-card').forEach(card => {
      const text = card.textContent.toLowerCase();
      card.style.display = !q || text.includes(q) ? '' : 'none';
    });
  });
})();

// ===== Edit profile button — quick inline-edit for bio =====
(function () {
  const btn = document.querySelector('.edit-btn');
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
      ta.style.width = '100%';
      ta.style.font = 'inherit';
      ta.style.padding = '6px 8px';
      ta.style.border = '1px solid var(--border)';
      ta.style.borderRadius = 'var(--radius)';
      ta.style.resize = 'vertical';
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