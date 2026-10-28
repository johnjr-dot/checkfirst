// ---- Community articles: reads articles.json (only articles you have edited and approved) ----
(function () {
  // Paste your Google Form link between the quotes. While it is empty, the "Write for us" button stays hidden.
  const FORM_URL = 'https://forms.gle/H4xQ1oPgRYXqwaQk7';

  const TXT = {
    en: { by: 'By', read: 'Read the article', empty: 'No community articles yet. Be the first to write one.',
          fail: 'Could not load the articles right now.', note: 'This article is only available in English.' },
    sw: { by: 'Na', read: 'Soma makala', empty: 'Hakuna makala za jamii bado. Kuwa wa kwanza kuandika.',
          fail: 'Imeshindikana kupakia makala kwa sasa.', note: 'Makala hii inapatikana kwa Kiingereza pekee.' }
  };
  const list = document.getElementById('artlist');
  const btn = document.getElementById('writebtn');
  if (!list) return;
  let data = null;

  const L = () => (typeof lang !== 'undefined' && lang === 'sw') ? 'sw' : 'en';
  const t = k => TXT[L()][k];
  const safe = u => /^https?:\/\//i.test(u || '');
  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }
  function fmt(d) {
    const p = String(d).split('-').map(Number);
    if (!p[0]) return '';
    const dt = new Date(p[0], (p[1] || 1) - 1, p[2] || 1);
    const opt = p[2] ? { year: 'numeric', month: 'long', day: 'numeric' } : { year: 'numeric', month: 'long' };
    return dt.toLocaleDateString(L() === 'sw' ? 'sw-KE' : 'en-GB', opt);
  }

  if (btn && safe(FORM_URL)) { btn.href = FORM_URL; btn.hidden = false; }

  function render() {
    if (!data) return;
    const sw = L() === 'sw';
    list.replaceChildren();
    const items = (data.articles || []).slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
    if (!items.length) list.appendChild(el('p', 'lead', t('empty')));
    items.forEach(a => {
      const c = el('article', 'story');
      c.appendChild(el('div', 'meta', fmt(a.date) + ' · ' + t('by') + ' ' + (a.author || 'Anonymous')));
      c.appendChild(el('h3', null, (sw && a.title_sw) || a.title));
      c.appendChild(el('p', null, (sw && a.summary_sw) || a.summary));
      const d = el('details');
      d.appendChild(el('summary', null, t('read')));
      const body = el('div', 'artbody');
      const useSw = sw && Array.isArray(a.body_sw) && a.body_sw.length;
      if (sw && !useSw) body.appendChild(el('p', 'meta', t('note')));
      (useSw ? a.body_sw : (a.body || [])).forEach(par => body.appendChild(el('p', null, par)));
      d.appendChild(body);
      c.appendChild(d);
      list.appendChild(c);
    });
  }

  window.refreshArticles = render; // lang.js calls this when the language changes
  fetch('articles.json')
    .then(r => r.json())
    .then(d => { data = d; render(); })
    .catch(() => { list.appendChild(el('p', 'lead', t('fail'))); });
})();
