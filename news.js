// ---- Scam news: reads news.json and shows it in English or Kiswahili ----
(function () {
  const MAX = 10; // most stories shown at once
  const TXT = {
    en: { all: 'All', kenya: 'Kenya', global: 'Global', read: 'Read the original', source: 'Source',
          empty: 'No stories here yet. Check back soon.', fail: 'Could not load the news right now.' },
    sw: { all: 'Zote', kenya: 'Kenya', global: 'Dunia', read: 'Soma habari asili', source: 'Chanzo',
          empty: 'Hakuna habari hapa bado. Rudi hivi karibuni.', fail: 'Imeshindikana kupakia habari kwa sasa.' }
  };
  let data = null, region = 'all';
  const list = document.getElementById('newslist');
  const filter = document.getElementById('newsfilter');
  const srcList = document.getElementById('sourcelist');
  if (!list || !filter || !srcList) return;

  const L = () => (typeof lang !== 'undefined' && lang === 'sw') ? 'sw' : 'en';
  const t = k => TXT[L()][k];
  const safe = u => /^https?:\/\//i.test(u || '');

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }
  function link(text, url) {
    const a = el('a', null, text);
    a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer';
    return a;
  }
  function fmt(d) {
    const p = String(d).split('-').map(Number);
    if (!p[0]) return '';
    const dt = new Date(p[0], (p[1] || 1) - 1, p[2] || 1);
    const opt = p[2] ? { year: 'numeric', month: 'long', day: 'numeric' } : { year: 'numeric', month: 'long' };
    return dt.toLocaleDateString(L() === 'sw' ? 'sw-KE' : 'en-GB', opt);
  }

  function render() {
    if (!data) return;
    const sw = L() === 'sw';

    filter.replaceChildren();
    ['all', 'kenya', 'global'].forEach(r => {
      const b = el('button', 'chip' + (r === region ? ' on' : ''), t(r));
      b.type = 'button';
      b.onclick = () => { region = r; render(); };
      filter.appendChild(b);
    });

    list.replaceChildren();
    const stories = (data.stories || [])
      .filter(s => region === 'all' || s.region === region)
      .sort((a, b) => String(b.date).localeCompare(String(a.date)))
      .slice(0, MAX);
    if (!stories.length) list.appendChild(el('p', 'lead', t('empty')));
    stories.forEach(s => {
      const c = el('article', 'story ' + s.region);
      c.appendChild(el('div', 'meta', t(s.region) + ' · ' + fmt(s.date) + ' · ' + t('source') + ': ' + s.source));
      c.appendChild(el('h3', null, (sw && s.title_sw) || s.title));
      c.appendChild(el('p', null, (sw && s.summary_sw) || s.summary));
      if (safe(s.url)) c.appendChild(link(t('read'), s.url));
      list.appendChild(c);
    });

    srcList.replaceChildren();
    (data.sources || []).forEach(s => {
      const li = el('li');
      if (safe(s.url)) li.appendChild(link(s.name, s.url)); else li.appendChild(document.createTextNode(s.name));
      li.appendChild(el('span', null, ' · ' + t(s.region)));
      srcList.appendChild(li);
    });
  }

  window.refreshNews = render; // lang.js calls this when the language changes
  fetch('news.json')
    .then(r => r.json())
    .then(d => { data = d; render(); })
    .catch(() => { list.appendChild(el('p', 'lead', t('fail'))); });
})();
