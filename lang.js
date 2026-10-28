// ---- Language toggle: English <-> Kiswahili ----
// English text is read from index.html. Swahili text lives here.
// Have a fluent Swahili speaker read this before you share the site widely.
const SW = {
  title: 'Kagua Kabla Ya Kusambaza – Tambua habari za uongo, video bandia na utapeli',
  nav_cta: 'Kagua habari',
  h1: 'Umepata ujumbe au video inayokutia shaka? Ikague kabla ya kuisambaza.',
  hero_p: 'Habari za uongo, video zilizotengenezwa na AI na jumbe za matapeli huwadanganya hata watu werevu kila siku. Jifunze ukaguzi wa haraka unaozibaini. Ni bure na huchukua dakika 3.',
  btn_get: 'Pata ukaguzi wa hatua 3',
  btn_test: 'Jaribu macho yako',
  joined: 'Alijiunga siku 2 zilizopita',
  post_text: 'HABARI MOTO: Ksh 50,000 bure kwa watu 1,000 wa kwanza watakaosambaza!',
  flag1: 'Akaunti mpya',
  flag2: 'Haraka + pesa',
  flag3: 'Midomo haiendani na sauti',
  cl_h2: 'Ukaguzi wa hatua 3 kabla ya kusambaza',
  cl_lead: 'Huchukua chini ya dakika moja. Nakili na uwatumie familia yako au kikundi cha WhatsApp.',
  s1: '<b>Nani anasema hivi?</b> Nenda mwenyewe kwenye ukurasa au tovuti yao rasmi. Usitumie kiungo ulichotumiwa.',
  s2: '<b>Je, kuna wengine wanaoripoti?</b> Tafuta kichwa cha habari. Tafuta vyombo viwili vya habari unavyoviamini.',
  s3: '<b>Je, picha au video ni ya asili?</b> Tumia utafutaji wa picha kinyume (Google Lens, TinEye) kuona ilipoonekana mara ya kwanza.',
  copy: 'Nakili ukaguzi wa hatua 3',
  wa: 'Shiriki kwenye WhatsApp',
    a2hs: '<b>Kidokezo:</b> weka tovuti hii kwenye skrini yako ya mwanzo. Kwenye Android, gusa ⋮ kisha <b>Sakinisha programu</b>. Kwenye iPhone, gusa Shiriki kisha <b>Ongeza kwenye Skrini ya Mwanzo</b>.',
    print: 'Chapisha ukaguzi',
      ptip: 'Ukiwa na shaka, usisambaze, usilipe, na muulize mtu unayemwamini.',
  spot_h2: 'Ipi imetengenezwa na AI?',
  spot_lead: 'Tazama kwa makini, kisha gusa picha unayodhani ni ya AI.',
  quiz_h2: 'Kweli au uongo? Jaribu macho yako',
  quiz_lead: 'Soma kila mfano kisha chagua jibu.',
  signs_h2: 'Dalili za tahadhari za kujua',
  g1h: 'Video na sauti bandia',
  g1p: 'Midomo haiendani na sauti, sauti isiyo na hisia, mdomo au meno yaliyofifia, na hakuna chanzo. Mtu maarufu akitoa pesa bure, ni uongo.',
  g2h: 'Picha zilizotengenezwa na AI',
  g2p: 'Mikono au vidole vya ajabu, maandishi yaliyochanganyika kwenye mabango, vivuli vinavyoelekea pande tofauti, ngozi laini kupita kiasi.',
  g3h: 'Jumbe za matapeli',
  g3p: 'Shinikizo la kuchukua hatua sasa, ombi la kurudisha pesa, kiungo cha "kuthibitisha" taarifa zako, au namba usiyoifahamu.',
  g4h: 'Habari za zamani, hadithi mpya',
  g4p: 'Picha ya kweli, hadithi ya uongo. Angalia tarehe na mahali ilipoonekana mara ya kwanza kabla ya kuamini maelezo yake.',
  tools_h2: 'Zana za bure za kukagua mwenyewe',
  t1: 'Tafuta kwa picha uone inapoonekana kwingine mtandaoni.',
  t2: 'Utafutaji wa picha kinyume unaoweza kukusaidia kupata nakala za zamani za picha.',
  t3: 'Wakaguzi wa ukweli wa madai nchini Kenya, Tanzania na Uganda.',
  t4: 'Shirika huru la kukagua ukweli kwa Afrika.',
  about_h2: 'Kuhusu tovuti hii',
  about_p1: 'CheckFirst ni mradi wa kujifunza wa bure uliotengenezwa na [Okelo John Ouma].[checkfirst inakusaidia] kujifunza zaidi kuhusu matapeli na hutoa taarifa kuhusu uelewa wa mtandao, ili kuonyesha kile kilicho cha kweli na cha uongo mtandaoni]',
  about_p2: 'Haichukui nafasi ya ushauri wa benki yako, polisi au mtaalamu unayemwamini. Ukidhani umetapeliwa, wasiliana na benki yako au mtoa huduma wako wa pesa za simu mara moja.',
    privacy: 'Faragha: tovuti hii haitumii vidakuzi wala kukusanya majina au maelezo ya mawasiliano. Inahesabu wageni kwa zana rafiki kwa faragha (GoatCounter). Chaguo lako la lugha na rangi huhifadhiwa kwenye kifaa chako pekee.',
  foot: '<b>CheckFirst</b> ni zana ya bure ya kujifunza. Ukiwa na shaka, usisambaze, usilipe, na muulize mtu unayemwamini.'
};
const SW_CHECK =
`Kabla ya kusambaza hili, ninakagua mambo 3:
1) Nani anasema? Ninafungua ukurasa wao rasmi mwenyewe, si kiungo nilichotumiwa.
2) Je, kuna wengine wanaoripoti? Natafuta kichwa cha habari na kutafuta vyombo viwili ninavyoviamini.
3) Je, picha/video ni ya asili? Natumia utafutaji wa picha kinyume (Google Lens au TinEye).
Nisipoweza kuthibitisha yote matatu, sisambazi.`;
const SW_WA = 'Kabla ya kusambaza chochote mtandaoni, jaribu ukaguzi huu wa bure wa hatua 3 (huchukua chini ya dakika moja): ';

lang = 'en';

// Replace the copy button so it can use the right language
const oldCopy = document.getElementById('copy');
const newCopy = oldCopy.cloneNode(true);
oldCopy.replaceWith(newCopy);
newCopy.addEventListener('click', async () => {
  const note = document.getElementById('copied');
  const text = lang === 'sw' ? SW_CHECK : checkText;
  try {
    await navigator.clipboard.writeText(text);
    note.textContent = lang === 'sw' ? 'Imenakiliwa. Bandika popote.' : 'Copied. Paste it anywhere.';
  } catch (e) {
    note.textContent = lang === 'sw' ? 'Kunakili kumeshindikana. Chagua hatua hapo juu uzinakili.' : 'Copy failed. Select the steps above and copy them.';
  }
});

const els = [...document.querySelectorAll('[data-i18n]')];
els.forEach(el => el.dataset.en = el.innerHTML);
const titleEn = document.title;

function setLang(l) {
  lang = l;
  els.forEach(el => {
    el.innerHTML = l === 'sw' ? (SW[el.dataset.i18n] ?? el.dataset.en) : el.dataset.en;
  });
  document.documentElement.lang = l;
    updateThemeBtn();
    document.getElementById('sizebtn').setAttribute('aria-label', l === 'sw' ? 'Maandishi makubwa' : 'Larger text');
  document.title = l === 'sw' ? SW.title : titleEn;
  document.getElementById('langbtn').textContent = l === 'sw' ? 'English' : 'Kiswahili';
  const link = location.href.split('#')[0];
  document.getElementById('wa').href =
    'https://wa.me/?text=' + encodeURIComponent((l === 'sw' ? SW_WA : 'Before you share anything online, try this free 3-step check (takes under a minute): ') + link);
  document.getElementById('copied').textContent = '';
  if (typeof refreshQuizzes === 'function') refreshQuizzes();
  try { localStorage.setItem('lang', l); } catch (e) {}
}

document.getElementById('langbtn').addEventListener('click', () => setLang(lang === 'en' ? 'sw' : 'en'));

let saved = 'en';
try { saved = localStorage.getItem('lang') || 'en'; } catch (e) {}
setLang(saved === 'sw' ? 'sw' : 'en');

// ---- Bigger text ----
const sizeBtn = document.getElementById('sizebtn');
function setBig(on) {
  document.documentElement.classList.toggle('big', on);
  sizeBtn.setAttribute('aria-pressed', on);
  try { localStorage.setItem('big', on ? '1' : '0'); } catch (e) {}
}
sizeBtn.addEventListener('click', () => setBig(!document.documentElement.classList.contains('big')));
let big = false;
try { big = localStorage.getItem('big') === '1'; } catch (e) {}
setBig(big);

// ---- Print the checklist ----
document.getElementById('print').addEventListener('click', () => window.print());
document.getElementById('printlink').textContent = location.href.split('#')[0];

// ---- Light / dark mode ----
function updateThemeBtn() {
  const b = document.getElementById('themebtn');
  if (!b) return;
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  const sw = lang === 'sw';
  b.textContent = dark ? '☀' : '☾';
  b.setAttribute('aria-label', dark
    ? (sw ? 'Badilisha kuwa hali ya mwanga' : 'Switch to light mode')
    : (sw ? 'Badilisha kuwa hali ya giza' : 'Switch to dark mode'));
}
function setTheme(t) {
  if (t === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  else document.documentElement.removeAttribute('data-theme');
  try { localStorage.setItem('theme', t); } catch (e) {}
  updateThemeBtn();
}
document.getElementById('themebtn').addEventListener('click', () => {
  setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
});
updateThemeBtn();

// Always print in light colours
let wasDark = false;
addEventListener('beforeprint', () => {
  wasDark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.documentElement.removeAttribute('data-theme');
});
addEventListener('afterprint', () => {
  if (wasDark) document.documentElement.setAttribute('data-theme', 'dark');
});