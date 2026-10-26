// ---- Language state (lang.js changes this and calls refreshQuizzes) ----
let lang = 'en';

// ---- Text used by the quizzes ----
const T = {
  en: {
    round: 'Round {n} of {m}', picA: 'Picture A', picB: 'Picture B', ai: 'AI-made', real: 'Real photo',
    spotted: 'You spotted {s} of {m}', spotEnd: 'Even experts get fooled sometimes. That is why the 3-step check matters.',
    again: 'Play again', ok: 'Correct.', no: 'Not quite.', nextRound: 'Next round', seeScore: 'See my score', nextQ: 'Next question',
    trust: 'Looks trustworthy', susp: 'Looks suspicious', isSusp: 'It is suspicious.', isTrust: 'It is trustworthy.',
    qOf: 'Question {n} of {m}', scored: 'You scored {s} out of {m}',
    sharp: 'Sharp eye. Share the 3-step check with someone who needs it.', start: 'Good start. Read the warning signs below and try again.',
    cats: { 'All': 'All', 'Scams': 'Scams', 'Deepfakes': 'Deepfakes', 'Fake news': 'Fake news' }
  },
  sw: {
    round: 'Raundi {n} kati ya {m}', picA: 'Picha A', picB: 'Picha B', ai: 'Imetengenezwa na AI', real: 'Picha halisi',
    spotted: 'Umegundua {s} kati ya {m}', spotEnd: 'Hata wataalamu hudanganywa wakati mwingine. Ndiyo maana ukaguzi wa hatua 3 ni muhimu.',
    again: 'Cheza tena', ok: 'Sahihi.', no: 'Si sahihi kabisa.', nextRound: 'Raundi inayofuata', seeScore: 'Ona alama yangu', nextQ: 'Swali linalofuata',
    trust: 'Inaonekana ya kuaminika', susp: 'Inatia shaka', isSusp: 'Inatia shaka.', isTrust: 'Ni ya kuaminika.',
    qOf: 'Swali {n} kati ya {m}', scored: 'Umepata {s} kati ya {m}',
    sharp: 'Macho makali. Mshirikishe mtu anayehitaji ukaguzi wa hatua 3.', start: 'Mwanzo mzuri. Soma dalili za tahadhari hapa chini ujaribu tena.',
    cats: { 'All': 'Zote', 'Scams': 'Utapeli', 'Deepfakes': 'Video bandia', 'Fake news': 'Habari za uongo' }
  }
};
const tx = (k, v = {}) => T[lang][k].replace(/\{(\w)\}/g, (_, x) => v[x]);

// ---- Text of the 3-step check (used by the copy button in lang.js) ----
const checkText =
`Before I share this, I check 3 things:
1) Who is saying it? I open their official page myself, not the link I was sent.
2) Is anyone else reporting it? I search the headline and look for two outlets I trust.
3) Is the photo/video original? I do a reverse image search (Google Lens or TinEye).
If I can't confirm all three, I don't share.`;

// ---- AI or Real image quiz ----
// Paste your own pairs here. ai = which picture is AI ('a' or 'b').
// why_sw is the Swahili version of why (optional: English shows if it is missing).
const pairs = [
  { a: 'images/pair1-a.jpg', b: 'images/pair1-b.jpg', ai: 'b', why: 'eyes of the first and second cow are the same', why_sw: 'Macho ya ngombe wa kwanza na wa pili yamenakiliwa' },
  { a: 'images/pair2-a.jpg', b: 'images/pair2-b.jpg', ai: 'a', why: 'Flower pots have been reduced', why_sw: 'Vyungu vya maua vimepunguzwa' },
  { a: 'images/pair3-a.jpg', b: 'images/pair3-b.jpg', ai: 'b', why: 'The texture is softer', why_sw: 'Ngozi au muundo ni laini zaidi' }
];
const spot = document.getElementById('spotbox');
let p = 0, pScore = 0;

function showPair() {
  if (p >= pairs.length) {
    spot.innerHTML = `<h3>${tx('spotted', { s: pScore, m: pairs.length })}</h3>
      <p>${tx('spotEnd')}</p>
      <button class="btn" id="pagain" type="button">${tx('again')}</button>`;
    document.getElementById('pagain').onclick = () => { p = 0; pScore = 0; showPair(); };
    return;
  }
  const it = pairs[p];
  spot.innerHTML = `<div class="progress">${tx('round', { n: p + 1, m: pairs.length })}</div>
    <div class="pair">
      <button class="pick" type="button" data-k="a"><img src="${it.a}" alt="${tx('picA')}"><span class="tag">${tx('picA')}</span></button>
      <button class="pick" type="button" data-k="b"><img src="${it.b}" alt="${tx('picB')}"><span class="tag">${tx('picB')}</span></button>
    </div>
    <div id="pout" aria-live="polite"></div>`;
  spot.querySelectorAll('.pick').forEach(b => b.onclick = () => pick(b.dataset.k));
}

function pick(k) {
  const it = pairs[p], ok = k === it.ai;
  if (ok) pScore++;
  spot.querySelectorAll('.pick').forEach(b => {
    b.disabled = true;
    b.querySelector('.tag').textContent = b.dataset.k === it.ai ? tx('ai') : tx('real');
    if (b.dataset.k === k) b.classList.add(ok ? 'right' : 'wrong');
  });
  const why = lang === 'sw' && it.why_sw ? it.why_sw : it.why;
  document.getElementById('pout').innerHTML =
    `<div class="result ${ok ? 'ok' : 'no'}"><b>${ok ? tx('ok') : tx('no')}</b> ${why}</div>
     <button class="btn" id="pnext" type="button">${p === pairs.length - 1 ? tx('seeScore') : tx('nextRound')}</button>`;
  document.getElementById('pnext').onclick = () => { p++; showPair(); };
}

// ---- Real or fake quiz ----
const allItems = [
  { cat: 'Scams', answer: 'fake',
    text: 'SMS: "MPESA CONFIRMED. You have received Ksh 15,000 from PETER. Please send it back urgently, I sent it by mistake."',
    why: 'Scammers fake the confirmation and push you to send money back fast. Check your balance in the M-PESA app or menu, not in the message.',
    text_sw: 'SMS: "MPESA IMETHIBITISHWA. Umepokea Ksh 15,000 kutoka kwa PETER. Tafadhali nirudishie haraka, nimetuma kwa makosa."',
    why_sw: 'Matapeli hughushi ujumbe wa uthibitisho na kukushinikiza kurudisha pesa haraka. Angalia salio lako kwenye programu ya M-PESA au menyu, si kwenye ujumbe.' },
  { cat: 'Scams', answer: 'fake',
    text: 'WhatsApp forward: "URGENT!!! Forward to 10 people or your account will be deleted."',
    why: 'Chain messages with threats are never real. WhatsApp does not delete accounts for not forwarding.',
    text_sw: 'Ujumbe wa WhatsApp: "DHARURA!!! Tuma kwa watu 10 la sivyo akaunti yako itafutwa."',
    why_sw: 'Jumbe za mnyororo zenye vitisho si za kweli. WhatsApp haifuti akaunti kwa sababu hukusambaza ujumbe.' },
  { cat: 'Scams', answer: 'real',
    text: 'Your bank sends a notice that asks for no PIN and has no links. The same notice appears inside the bank\'s official app.',
    why: 'No request for secrets, no links, and you can confirm it in the official app yourself.',
    text_sw: 'Benki yako inakutumia taarifa isiyoomba PIN wala kiungo. Taarifa hiyo hiyo inaonekana ndani ya programu rasmi ya benki.',
    why_sw: 'Hakuna ombi la siri, hakuna viungo, na unaweza kuithibitisha mwenyewe kwenye programu rasmi.' },
  { cat: 'Scams', answer: 'fake',
    text: 'SMS: "Your parcel is on hold. Pay Ksh 150 at this link today or it will be returned."',
    why: 'Unexpected fees through a link are a common trick. Contact the courier through their official app or number instead.',
    text_sw: 'SMS: "Kifurushi chako kimezuiliwa. Lipa Ksh 150 kupitia kiungo hiki leo la sivyo kitarudishwa."',
    why_sw: 'Ada zisizotarajiwa kupitia kiungo ni ujanja wa kawaida. Wasiliana na kampuni ya usafirishaji kupitia programu au namba yao rasmi.' },
  { cat: 'Scams', answer: 'fake',
    text: 'Message: "You have been selected for a job abroad. Pay Ksh 5,000 processing fee to start."',
    why: 'Genuine employers do not ask you to pay to be hired. Pressure plus a fee is a red flag.',
    text_sw: 'Ujumbe: "Umechaguliwa kwa kazi nje ya nchi. Lipa Ksh 5,000 za usindikaji ili uanze."',
    why_sw: 'Waajiri wa kweli hawakuombi ulipe ili uajiriwe. Shinikizo pamoja na ada ni ishara ya hatari.' },
  { cat: 'Deepfakes', answer: 'fake',
    text: 'A video shows a famous leader announcing a surprise giveaway. The lips are slightly off from the voice, and a link sits in the comments.',
    why: 'Giveaways, urgency and mismatched lips are classic deepfake scam signs. Real announcements appear on official channels.',
    text_sw: 'Video inamwonyesha kiongozi maarufu akitangaza zawadi ya ghafla. Midomo haiendani kidogo na sauti, na kuna kiungo kwenye maoni.',
    why_sw: 'Zawadi, haraka na midomo isiyoendana ni ishara za kawaida za utapeli wa video bandia. Matangazo ya kweli hutoka kwenye njia rasmi.' },
  { cat: 'Deepfakes', answer: 'fake',
    text: 'A voice note from a new number sounds like your child and begs for money urgently. "Please do not call, just send it."',
    why: 'Voices can be copied by AI. Hang up and call your child on the number you already know. Agree a family code word.',
    text_sw: 'Ujumbe wa sauti kutoka namba mpya unaofanana na sauti ya mtoto wako, anaomba pesa haraka. "Tafadhali usipige simu, tuma tu."',
    why_sw: 'Sauti zinaweza kunakiliwa na AI. Kata, kisha mpigie mtoto wako kwa namba unayoijua. Wekeni neno la siri la familia.' },
  { cat: 'Deepfakes', answer: 'real',
    text: 'A leader\'s announcement is live on their official verified channel and also reported by several news outlets.',
    why: 'Several independent sources and an official channel agree. That passes steps 1 and 2 of the check.',
    text_sw: 'Tangazo la kiongozi linaonekana moja kwa moja kwenye ukurasa wake rasmi uliothibitishwa na pia linaripotiwa na vyombo kadhaa vya habari.',
    why_sw: 'Vyanzo kadhaa huru na njia rasmi vinakubaliana. Hiyo inapita hatua ya 1 na 2 za ukaguzi.' },
  { cat: 'Fake news', answer: 'fake',
    text: 'A viral flood photo. A reverse image search shows it appeared in a news report three years ago, in another country.',
    why: 'The photo may be real, but the story is false. It is an old picture with a new caption.',
    text_sw: 'Picha ya mafuriko inayosambaa. Utafutaji wa picha kinyume unaonyesha ilichapishwa kwenye ripoti ya habari miaka mitatu iliyopita, nchi nyingine.',
    why_sw: 'Picha inaweza kuwa ya kweli, lakini hadithi ni ya uongo. Ni picha ya zamani yenye maelezo mapya.' },
  { cat: 'Fake news', answer: 'real',
    text: 'A notice is posted on a ministry\'s official verified website and carried by several major newspapers.',
    why: 'The source is official and independent outlets confirm it.',
    text_sw: 'Taarifa imewekwa kwenye tovuti rasmi iliyothibitishwa ya wizara na kuchapishwa na magazeti makubwa kadhaa.',
    why_sw: 'Chanzo ni rasmi na vyombo huru vinathibitisha.' },
  { cat: 'Fake news', answer: 'fake',
    text: 'A screenshot of a "news headline" with no link, no date and odd mismatched fonts.',
    why: 'Screenshots are easy to fake. Search the headline on the outlet\'s own website before you believe it.',
    text_sw: 'Picha ya skrini ya "kichwa cha habari" isiyo na kiungo, tarehe, na fonti zisizolingana.',
    why_sw: 'Picha za skrini ni rahisi kughushi. Tafuta kichwa cha habari kwenye tovuti ya chombo husika kabla ya kuamini.' },
  { cat: 'Fake news', answer: 'real',
    text: 'An article on a well-known newspaper\'s website has a named author, today\'s date and links to its sources.',
    why: 'You can see who wrote it, when, and where the facts came from. That is what a trustworthy report looks like.',
    text_sw: 'Makala kwenye tovuti ya gazeti linalojulikana ina jina la mwandishi, tarehe ya leo na viungo vya vyanzo vyake.',
    why_sw: 'Unaona nani aliandika, lini, na ukweli ulitoka wapi. Ndivyo ripoti ya kuaminika inavyoonekana.' }
];

const box = document.getElementById('quizbox');
let items = [], i = 0, score = 0, cat = 'All';

function shuffle(a) {
  const r = [...a];
  for (let k = r.length - 1; k > 0; k--) {
    const j = Math.floor(Math.random() * (k + 1));
    [r[k], r[j]] = [r[j], r[k]];
  }
  return r;
}

function start(c) {
  cat = c;
  items = shuffle(allItems.filter(x => c === 'All' || x.cat === c));
  i = 0; score = 0;
  show();
}

function menu() {
  return '<div class="cats">' + ['All', 'Scams', 'Deepfakes', 'Fake news']
    .map(c => `<button type="button" class="chip${c === cat ? ' on' : ''}" data-c="${c}">${T[lang].cats[c]}</button>`).join('') + '</div>';
}
function bindMenu() {
  box.querySelectorAll('.chip').forEach(b => b.onclick = () => start(b.dataset.c));
}

function show() {
  if (i >= items.length) {
    box.innerHTML = menu() + `<h3>${tx('scored', { s: score, m: items.length })}</h3>
      <p>${score >= items.length * 0.8 ? tx('sharp') : tx('start')}</p>
      <button class="btn" id="again" type="button">${tx('again')}</button>`;
    bindMenu();
    document.getElementById('again').onclick = () => start(cat);
    return;
  }
  const it = items[i];
  box.innerHTML = menu() + `<div class="progress">${T[lang].cats[it.cat]} · ${tx('qOf', { n: i + 1, m: items.length })}</div>
    <p class="msg">${lang === 'sw' ? it.text_sw : it.text}</p>
    <div class="choices">
      <button type="button" data-a="real">${tx('trust')}</button>
      <button type="button" data-a="fake">${tx('susp')}</button>
    </div>
    <div id="out" aria-live="polite"></div>`;
  bindMenu();
  box.querySelectorAll('.choices button').forEach(b => b.onclick = () => answer(b.dataset.a));
}

function answer(a) {
  const it = items[i], ok = a === it.answer;
  if (ok) score++;
  box.querySelectorAll('.choices button').forEach(b => b.disabled = true);
  document.getElementById('out').innerHTML =
    `<div class="result ${ok ? 'ok' : 'no'}"><b>${ok ? tx('ok') : tx('no')}</b> ${it.answer === 'fake' ? tx('isSusp') : tx('isTrust')} ${lang === 'sw' ? it.why_sw : it.why}</div>
     <button class="btn" id="next" type="button">${i === items.length - 1 ? tx('seeScore') : tx('nextQ')}</button>`;
  document.getElementById('next').onclick = () => { i++; show(); };
}

// lang.js calls this after the language changes
function refreshQuizzes() { show(); showPair(); }

start('All');
showPair();