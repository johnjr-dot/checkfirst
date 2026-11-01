// ---- Community articles: shows articles.json (older/manual ones) + approved rows from your Google Sheet ----
const artSafe = u => /^https?:\/\//i.test(u || '');
function artParagraphs(t) {
  t = String(t || '').replace(/\r\n?/g, '\n').trim();
  if (!t) return [];
  let p = t.split(/\n\s*\n/);
  if (p.length === 1) p = t.split('\n');
  return p.map(x => x.replace(/\s*\n\s*/g, ' ').trim()).filter(Boolean);
}
function artSources(t) { return String(t || '').replace(/\r\n?/g, '\n').split(/\n|;/).map(x => x.trim()).filter(Boolean); }
function artSummary(paras) {
  const t = paras[0] || '';
  const m = t.match(/^(.{40,}?[.!?])(\s|$)/);
  let s = m ? m[1] : t;
  if (s.length > 220) s = s.slice(0, 217).replace(/\s+\S*$/, '') + '…';
  return s;
}
function artSlug(a) {
  const base = String(a.title || 'article').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50).replace(/-+$/g, '');
  return String(a.date || '').replace(/[^0-9-]/g, '') + '-' + (base || 'article');
}
function artHost(u) { const m = String(u || '').match(/^https:\/\/([^\/?#:\s]+)/i); return m ? m[1].replace(/^www\./i, '') : ''; }
// turns one approved sheet row into the same shape as an articles.json entry
function artFromRow(r) {
  const body = artParagraphs(r.article);
  const e = { date: r.date || '', author: r.author || 'Anonymous', title: r.title || '', summary: artSummary(body), body: body };
  if (/swahili/i.test(r.language || '')) e.lang = 'sw';
  const s = artSources(r.sources);
  if (s.length) e.sources = s;
  if (artHost(r.link) && !/\s/.test(r.link)) e.link = r.link.trim();
  return e;
}
if (typeof module !== 'undefined') module.exports = { artSlug, artHost, artFromRow, artParagraphs, artSummary, artSources };

(function () {
  if (typeof document === 'undefined') return;
  const TXT = {
    en: { by: 'By', read: 'Read the article', empty: 'No community articles yet. Be the first to write one.',
          fail: 'Could not load the articles right now.', note: 'This article is only available in English.',
          noteSw: 'This article is written in Kiswahili.', sources: 'Sources',
          official: 'Official link', share: 'Share', copyLink: 'Copy link', copied: 'Link copied. Paste it anywhere.', copyFail: 'Copy this link:' },
    sw: { by: 'Na', read: 'Soma makala', empty: 'Hakuna makala za jamii bado. Kuwa wa kwanza kuandika.',
          fail: 'Imeshindikana kupakia makala kwa sasa.', note: 'Makala hii inapatikana kwa Kiingereza pekee.',
          noteSw: 'Makala hii imeandikwa kwa Kiswahili.', sources: 'Vyanzo',
          official: 'Kiungo rasmi', share: 'Shiriki', copyLink: 'Nakili kiungo', copied: 'Kiungo kimenakiliwa. Kibandike popote.', copyFail: 'Nakili kiungo hiki:' }
  };
  const list = document.getElementById('artlist');
  const btn = document.getElementById('writebtn');
  if (!list) return;
  let items = null, rendered = false;

  const L = () => (typeof lang !== 'undefined' && lang === 'sw') ? 'sw' : 'en';
  const t = k => TXT[L()][k];
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

  function ext(text, href) {
    const a = el('a', null, text);
    a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer';
    return a;
  }
  const slugs = new Map();
  function idFor(a) {
    if (slugs.has(a)) return slugs.get(a);
    let id = 'a-' + artSlug(a), n = 2;
    const used = new Set(slugs.values());
    while (used.has(id)) id = 'a-' + artSlug(a) + '-' + n++;
    slugs.set(a, id);
    return id;
  }
  function shareBar(a, title) {
    const url = location.origin + location.pathname + '#' + idFor(a);
    const u = encodeURIComponent(url), tt = encodeURIComponent(title);
    const bar = el('div', 'sharebar');
    if (navigator.share) {
      const b = el('button', null, t('share')); b.type = 'button';
      b.onclick = () => navigator.share({ title: title, text: title, url: url }).catch(() => {});
      bar.appendChild(b);
    }
    [['WhatsApp', 'https://wa.me/?text=' + encodeURIComponent(title + ' ' + url)],
     ['Facebook', 'https://www.facebook.com/sharer/sharer.php?u=' + u],
     ['X', 'https://twitter.com/intent/tweet?text=' + tt + '&url=' + u],
     ['Telegram', 'https://t.me/share/url?url=' + u + '&text=' + tt],
     ['LinkedIn', 'https://www.linkedin.com/sharing/share-offsite/?url=' + u],
     ['Email', 'mailto:?subject=' + tt + '&body=' + u]
    ].forEach(x => { const a2 = ext(x[0], x[1]); if (x[0] === 'Email') { a2.removeAttribute('target'); } bar.appendChild(a2); });
    const cp = el('button', null, t('copyLink')); cp.type = 'button';
    cp.onclick = async () => {
      try { await navigator.clipboard.writeText(url); cp.textContent = t('copied'); }
      catch (e) { window.prompt(t('copyFail'), url); }
    };
    bar.appendChild(cp);
    return bar;
  }
  function openFromHash(scroll) {
    const h = location.hash;
    if (!/^#a-[a-z0-9-]+$/.test(h)) return;
    const card = document.getElementById(h.slice(1));
    if (!card) return;
    const d = card.querySelector('details'); if (d) d.open = true;
    card.classList.add('hl');
    if (scroll) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  addEventListener('hashchange', () => openFromHash(true));

  const formUrl = typeof FORM_URL !== 'undefined' ? FORM_URL : '';
  const apiUrl = typeof SHEET_API !== 'undefined' ? SHEET_API : '';
  if (btn && artSafe(formUrl)) { btn.href = formUrl; btn.hidden = false; }

  function render() {
    if (!items) return;
    const sw = L() === 'sw';
    list.replaceChildren();
    const sorted = items.slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
    if (!sorted.length) list.appendChild(el('p', 'lead', t('empty')));
    sorted.forEach(a => {
      const c = el('article', 'story');
      c.id = idFor(a);
      c.appendChild(el('div', 'meta', fmt(a.date) + ' · ' + t('by') + ' ' + (a.author || 'Anonymous')));
      c.appendChild(el('h3', null, (sw && a.title_sw) || a.title));
      c.appendChild(el('p', null, (sw && a.summary_sw) || a.summary));
      const d = el('details');
      d.appendChild(el('summary', null, t('read')));
      const body = el('div', 'artbody');
      const swArticle = a.lang === 'sw';
      const useSw = sw && Array.isArray(a.body_sw) && a.body_sw.length;
      if (sw && !useSw && !swArticle) body.appendChild(el('p', 'meta', t('note')));
      if (!sw && swArticle) body.appendChild(el('p', 'meta', t('noteSw')));
      (useSw ? a.body_sw : (a.body || [])).forEach(par => body.appendChild(el('p', null, par)));
      if (Array.isArray(a.sources) && a.sources.length) {
        body.appendChild(el('p', 'meta', t('sources') + ':'));
        const ul = el('ul');
        a.sources.forEach(x => ul.appendChild(el('li', null, x)));
        body.appendChild(ul);
      }
      if (a.link && artHost(a.link) && !/\s/.test(a.link)) {
        const p = el('p', null, t('official') + ': ');
        p.appendChild(ext(artHost(a.link), a.link));
        body.appendChild(p);
      }
      body.appendChild(shareBar(a, (sw && a.title_sw) || a.title));
      d.appendChild(body);
      c.appendChild(d);
      list.appendChild(c);
    });
    openFromHash(!rendered);
    rendered = true;
  }

  window.refreshArticles = render; // lang.js calls this when the language changes

  const fromFile = fetch('articles.json').then(r => r.json()).then(d => d.articles || []).catch(() => null);
  const fromSheet = artSafe(apiUrl)
    ? fetch(apiUrl).then(r => r.json()).then(d => (d.articles || []).map(artFromRow)).catch(() => null)
    : Promise.resolve([]);
  Promise.all([fromFile, fromSheet]).then(([a, b]) => {
    if (a === null && b === null) { list.appendChild(el('p', 'lead', t('fail'))); return; }
    items = [].concat(a || [], b || []);
    render();
  });
})();
