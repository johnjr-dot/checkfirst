// ---- CheckFirst publisher: arranges a pasted article into an articles.json entry ----
// Everything happens inside your browser. Nothing is uploaded anywhere.
const GITHUB_EDIT_URL = 'https://github.com/johnjr-dot/checkfirst/edit/main/articles.json';

// These must match the question titles in your Google Form.
const LABELS = {
  name: 'Name to show with your article',
  email: 'Email',
  title: 'Article title',
  article: 'Your article',
  sources: 'Where did the facts come from?',
  language: 'Language of your article',
  confirm: 'Please confirm'
};
const ORDER = ['name', 'email', 'title', 'article', 'sources', 'language', 'confirm'];

const norm = s => String(s || '').replace(/\r\n?/g, '\n');

// If a saved web page (.html) is dropped or pasted, turn it into plain text first.
const looksHtml = t => /^\s*<!doctype html|<html[\s>]|<body[\s>]/i.test(t);
function htmlToText(h) {
  let t = String(h)
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style|noscript|head|svg)[\s\S]*?<\/\1>/gi, '')
    .replace(/<(br|hr)\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|ul|ol|h[1-6]|tr|td|th|label|section|article|header|footer|form|fieldset|legend)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (m, x) => String.fromCodePoint(parseInt(x, 16)))
    .replace(/&#(\d+);/g, (m, d) => String.fromCodePoint(+d))
    .replace(/&amp;/g, '&');
  return norm(t).split('\n').map(l => l.replace(/[ \t]+/g, ' ').trim()).join('\n').replace(/\n{3,}/g, '\n\n').trim();
}


function parseLabeled(text) {
  const out = {}; let cur = null, found = 0;
  const keys = Object.keys(LABELS);
  norm(text).split('\n').forEach(line => {
    const t = line.trim().replace(/\s*\*$/, '');
    const tl = t.toLowerCase();
    let hit = null, rest = '';
    for (const k of keys) {
      const lab = LABELS[k].toLowerCase();
      if (tl === lab || tl === lab + ':') { hit = k; break; }
      if (tl.startsWith(lab + ':')) { hit = k; rest = t.slice(lab.length + 1).trim(); break; }
    }
    if (hit) { cur = hit; found++; out[cur] = (out[cur] ? out[cur] + '\n' : '') + rest; return; }
    if (cur) out[cur] += '\n' + line;
  });
  keys.forEach(k => { if (out[k] !== undefined) out[k] = out[k].trim(); });
  return { fields: out, found };
}

function parseTSV(text) {
  const rows = []; let row = [], cell = '', q = false;
  const s = norm(text);
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) {
      if (c === '"') { if (s[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += c;
    } else if (c === '"' && cell === '') q = true;
    else if (c === '\t') { row.push(cell); cell = ''; }
    else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
    else cell += c;
  }
  row.push(cell); rows.push(row);
  return rows.filter(r => r.some(x => x.trim()));
}

function parseInput(text) {
  const lab = parseLabeled(text);
  if (lab.found >= 3) return lab.fields;
  if (text.includes('\t')) {
    let r = parseTSV(text)[0] || [];
    if (/^\s*(\d{1,2}[\/.]\d{1,2}[\/.]\d{2,4}|\d{4}-\d{2}-\d{2})/.test(r[0] || '')) r = r.slice(1);
    const f = {};
    ORDER.forEach((k, i) => { if (r[i] !== undefined) f[k] = r[i].trim(); });
    return f;
  }
  const lines = norm(text).trim().split('\n');
  return { title: (lines.shift() || '').trim(), article: lines.join('\n').trim() };
}

function toParagraphs(t) {
  t = norm(t).trim();
  if (!t) return [];
  let p = t.split(/\n\s*\n/);
  if (p.length === 1) p = t.split('\n');
  return p.map(x => x.replace(/\s*\n\s*/g, ' ').trim()).filter(Boolean);
}
function toSources(t) { return norm(t).split(/\n|;/).map(x => x.trim()).filter(Boolean); }
function makeSummary(paras) {
  const t = paras[0] || '';
  const m = t.match(/^(.{40,}?[.!?])(\s|$)/);
  let s = m ? m[1] : t;
  if (s.length > 220) s = s.slice(0, 217).replace(/\s+\S*$/, '') + '…';
  return s;
}
function detectLang(f) {
  if (/swahili/i.test(f.language || '')) return 'sw';
  if (/english/i.test(f.language || '')) return 'en';
  const words = ((f.article || '') + ' ' + (f.title || '')).toLowerCase().match(/[a-z']+/g) || [];
  const sw = words.filter(w => ['na', 'ya', 'wa', 'kwa', 'ni', 'katika', 'kuwa', 'hii', 'za', 'yake'].includes(w)).length;
  return words.length && sw / words.length > 0.12 ? 'sw' : 'en';
}

function checkArticle(e, confirmText) {
  const w = [];
  const body = e.body.join(' ');
  const words = body.split(/\s+/).filter(Boolean).length;
  if (words < 300) w.push('Short: ' + words + ' words (guideline is 300 to 800).');
  if (words > 800) w.push('Long: ' + words + ' words (guideline is 300 to 800). Consider trimming.');
  const all = e.title + ' ' + e.summary + ' ' + body;
  if (/(https?:\/\/|www\.)\S+/i.test(all)) w.push('Contains a web link. Remove it, or replace it with an official link you have checked.');
  if (/[\w.+-]+@[\w-]+\.[\w.]+/.test(all)) w.push('Contains an email address. Remove it.');
  if (/(\+?\d[\d\s\-()]{8,}\d)/.test(all)) w.push('May contain a phone number or account number. Remove it.');
  const letters = all.replace(/[^A-Za-z]/g, '');
  if (letters.length > 40 && (all.replace(/[^A-Z]/g, '').length / letters.length) > 0.3) w.push('Lots of CAPITAL LETTERS. Tone it down.');
  if (!e.sources || !e.sources.length) w.push('No sources given. Ask the author, or add them after you check the facts.');
  if (!e.title) w.push('No title.');
  if (confirmText !== undefined) {
    const c = confirmText.toLowerCase();
    const need = [['own work', 'own work'], ['private people', 'no private people named'], ['may edit', 'editor may edit or decline'], ['can be published', 'agrees to publication']];
    const missing = need.filter(n => !c.includes(n[0])).map(n => n[1]);
    if (!confirmText.trim()) w.push('No confirmation ticks found in the pasted text. Check the form response.');
    else if (missing.length) w.push('Missing confirmation: ' + missing.join(', ') + '.');
  }
  return w;
}

if (typeof module !== 'undefined') module.exports = { htmlToText, looksHtml, parseInput, toParagraphs, toSources, makeSummary, detectLang, checkArticle, parseLabeled, parseTSV };

// ---------------- page ----------------
if (typeof document !== 'undefined' && document.getElementById('raw')) {
  const $ = id => document.getElementById(id);
  let confirmText, authorEmail = '';

  function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; }

  function buildEntry() {
    const e = { date: $('date').value, author: $('author').value.trim() || 'Anonymous' };
    if ($('lang').value === 'sw') e.lang = 'sw';
    e.title = $('title').value.trim();
    e.summary = $('summary').value.trim();
    e.body = toParagraphs($('body').value);
    const s = toSources($('sources').value);
    if (s.length) e.sources = s;
    return e;
  }

  function gateOk() { return [...document.querySelectorAll('.gate')].every(c => c.checked); }

  function refresh() {
    const e = buildEntry();
    const warn = $('warnings'); warn.replaceChildren();
    const list = checkArticle(e, confirmText);
    if (!list.length) warn.appendChild(el('div', 'okmsg', 'No automatic problems found. You still need to check the facts yourself.'));
    list.forEach(m => warn.appendChild(el('div', 'warn', m)));

    const pv = $('preview'); pv.replaceChildren();
    const c = el('article', 'story');
    c.appendChild(el('div', 'meta', e.date + ' · By ' + e.author));
    c.appendChild(el('h3', null, e.title));
    c.appendChild(el('p', null, e.summary));
    const d = el('details'); d.open = true;
    d.appendChild(el('summary', null, 'Article'));
    const b = el('div', 'artbody');
    e.body.forEach(p => b.appendChild(el('p', null, p)));
    if (e.sources) {
      b.appendChild(el('p', 'meta', 'Sources:'));
      const ul = el('ul'); e.sources.forEach(s => ul.appendChild(el('li', null, s))); b.appendChild(ul);
    }
    d.appendChild(b); c.appendChild(d); pv.appendChild(c);

    const ok = gateOk() && e.title && e.body.length;
    ['copyEntry', 'copyFull', 'dlFull'].forEach(id => { $(id).disabled = !ok; });
    $('json').value = JSON.stringify(e, null, 2);

    const r = $('reply');
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authorEmail)) {
      r.href = 'mailto:' + authorEmail + '?subject=' + encodeURIComponent('Your CheckFirst article');
      r.hidden = false; r.textContent = 'Reply to the author (' + authorEmail + ')';
    } else r.hidden = true;
  }

  function fill(f) {
    const paras = toParagraphs(f.article);
    confirmText = f.confirm;
    authorEmail = (f.email || '').trim();
    $('author').value = (f.name || '').trim();
    $('title').value = (f.title || '').trim();
    $('body').value = paras.join('\n\n');
    $('summary').value = makeSummary(paras);
    $('sources').value = toSources(f.sources).join('\n');
    $('lang').value = detectLang(f);
    $('date').value = new Date().toISOString().slice(0, 10);
    $('review').hidden = false;
    document.querySelectorAll('.gate').forEach(c => { c.checked = false; });
    refresh();
    $('review').scrollIntoView({ behavior: 'smooth' });
  }

  $('parse').onclick = () => {
    let t = $('raw').value;
    if (!t.trim()) return;
    if (looksHtml(t)) { t = htmlToText(t); $('raw').value = t; }
    fill(parseInput(t));
  };
  $('clear').onclick = () => { $('raw').value = ''; $('review').hidden = true; };
  document.querySelectorAll('#review input, #review textarea, #review select').forEach(x => x.addEventListener('input', refresh));

  const box = $('raw');
  box.addEventListener('dragover', e => { e.preventDefault(); box.classList.add('drag'); });
  box.addEventListener('dragleave', () => box.classList.remove('drag'));
  box.addEventListener('drop', e => {
    e.preventDefault(); box.classList.remove('drag');
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) { const r = new FileReader(); r.onload = () => { box.value = r.result; $('parse').click(); }; r.readAsText(f); }
    else { const t = e.dataTransfer.getData('text'); if (t) { box.value = t; $('parse').click(); } }
  });

  async function copy(text, msg) {
    try { await navigator.clipboard.writeText(text); $('status').textContent = msg; }
    catch (e) { $('status').textContent = 'Copy failed. Select the text in the box below and copy it yourself.'; }
  }
  async function merged() {
    try {
      const r = await fetch('articles.json?' + Date.now());
      const d = await r.json();
      return JSON.stringify({ articles: [buildEntry(), ...(d.articles || [])] }, null, 2);
    } catch (e) { $('status').textContent = 'Could not read the current articles.json. Open this page through Live Server or your live site.'; return null; }
  }
  $('copyEntry').onclick = () => copy($('json').value, 'Copied this article. Paste it inside the "articles" list in articles.json.');
  $('copyFull').onclick = async () => { const j = await merged(); if (j) copy(j, 'Copied the whole articles.json with this article added at the top. Paste it over everything in the GitHub editor.'); };
  $('dlFull').onclick = async () => {
    const j = await merged(); if (!j) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([j], { type: 'application/json' }));
    a.download = 'articles.json'; a.click(); URL.revokeObjectURL(a.href);
    $('status').textContent = 'Downloaded articles.json. Upload it to GitHub to replace the old one.';
  };
  $('gh').href = GITHUB_EDIT_URL;
  document.querySelectorAll('.gate').forEach(c => c.addEventListener('change', refresh));
}
