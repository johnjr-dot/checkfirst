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
// turns one approved sheet row into the same shape as an articles.json entry
function artFromRow(r) {
  const body = artParagraphs(r.article);
  const e = { date: r.date || '', author: r.author || 'Anonymous', title: r.title || '', summary: artSummary(body), body: body };
  if (/swahili/i.test(r.language || '')) e.lang = 'sw';
  const s = artSources(r.sources);
  if (s.length) e.sources = s;
  return e;
}
if (typeof module !== 'undefined') module.exports = { artFromRow, artParagraphs, artSummary, artSources };

(function () {
  if (typeof document === 'undefined') return;
  const TXT = {
    en: { by: 'By', read: 'Read the article', empty: 'No community articles yet. Be the first to write one.',
          fail: 'Could not load the articles right now.', note: 'This article is only available in English.',
          noteSw: 'This article is written in Kiswahili.', sources: 'Sources' },
    sw: { by: 'Na', read: 'Soma makala', empty: 'Hakuna makala za jamii bado. Kuwa wa kwanza kuandika.',
          fail: 'Imeshindikana kupakia makala kwa sasa.', note: 'Makala hii inapatikana kwa Kiingereza pekee.',
          noteSw: 'Makala hii imeandikwa kwa Kiswahili.', sources: 'Vyanzo' }
  };
  const list = document.getElementById('artlist');
  const btn = document.getElementById('writebtn');
  if (!list) return;
  let items = null;

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
      d.appendChild(body);
      c.appendChild(d);
      list.appendChild(c);
    });
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
