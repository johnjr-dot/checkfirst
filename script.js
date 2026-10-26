// ---- Copy the 3-step check ----
const checkText =
`Before I share this, I check 3 things:
1) Who is saying it? I open their official page myself, not the link I was sent.
2) Is anyone else reporting it? I search the headline and look for two outlets I trust.
3) Is the photo/video original? I do a reverse image search (Google Lens or TinEye).
If I can't confirm all three, I don't share.`;

document.getElementById('copy').addEventListener('click', async () => {
  const note = document.getElementById('copied');
  try {
    await navigator.clipboard.writeText(checkText);
    note.textContent = 'Copied. Paste it anywhere.';
  } catch (e) {
    note.textContent = 'Copy failed. Select the steps above and copy them.';
  }
});

// ---- Quiz ----
const allItems = [
  { cat: 'Scams', answer: 'fake', text: 'SMS: "MPESA CONFIRMED. You have received Ksh 15,000 from PETER. Please send it back urgently, I sent it by mistake."',
    why: 'Scammers fake the confirmation and push you to send money back fast. Check your balance in the M-PESA app or menu, not in the message.' },
  { cat: 'Scams', answer: 'fake', text: 'WhatsApp forward: "URGENT!!! Forward to 10 people or your account will be deleted."',
    why: 'Chain messages with threats are never real. WhatsApp does not delete accounts for not forwarding.' },
  { cat: 'Scams', answer: 'real', text: 'Your bank sends a notice that asks for no PIN and has no links. The same notice appears inside the bank\'s official app.',
    why: 'No request for secrets, no links, and you can confirm it in the official app yourself.' },
  { cat: 'Scams', answer: 'fake', text: 'SMS: "Your parcel is on hold. Pay Ksh 150 at this link today or it will be returned."',
    why: 'Unexpected fees through a link are a common trick. Contact the courier through their official app or number instead.' },
  { cat: 'Scams', answer: 'fake', text: 'Message: "You have been selected for a job abroad. Pay Ksh 5,000 processing fee to start."',
    why: 'Genuine employers do not ask you to pay to be hired. Pressure plus a fee is a red flag.' },
  { cat: 'Deepfakes', answer: 'fake', text: 'A video shows a famous leader announcing a surprise giveaway. The lips are slightly off from the voice, and a link sits in the comments.',
    why: 'Giveaways, urgency and mismatched lips are classic deepfake scam signs. Real announcements appear on official channels.' },
  { cat: 'Deepfakes', answer: 'fake', text: 'A voice note from a new number sounds like your child and begs for money urgently. "Please do not call, just send it."',
    why: 'Voices can be copied by AI. Hang up and call your child on the number you already know. Agree a family code word.' },
  { cat: 'Deepfakes', answer: 'real', text: 'A leader\'s announcement is live on their official verified channel and also reported by several news outlets.',
    why: 'Several independent sources and an official channel agree. That passes steps 1 and 2 of the check.' },
  { cat: 'Fake news', answer: 'fake', text: 'A viral flood photo. A reverse image search shows it appeared in a news report three years ago, in another country.',
    why: 'The photo may be real, but the story is false. It is an old picture with a new caption.' },
  { cat: 'Fake news', answer: 'real', text: 'A notice is posted on a ministry\'s official verified website and carried by several major newspapers.',
    why: 'The source is official and independent outlets confirm it.' },
  { cat: 'Fake news', answer: 'fake', text: 'A screenshot of a "news headline" with no link, no date and odd mismatched fonts.',
    why: 'Screenshots are easy to fake. Search the headline on the outlet\'s own website before you believe it.' },
  { cat: 'Fake news', answer: 'real', text: 'An article on a well-known newspaper\'s website has a named author, today\'s date and links to its sources.',
    why: 'You can see who wrote it, when, and where the facts came from. That is what a trustworthy report looks like.' }
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
    .map(c => `<button type="button" class="chip${c === cat ? ' on' : ''}" data-c="${c}">${c}</button>`).join('') + '</div>';
}
function bindMenu() {
  box.querySelectorAll('.chip').forEach(b => b.onclick = () => start(b.dataset.c));
}

function show() {
  if (i >= items.length) {
    box.innerHTML = menu() + `<h3>You scored ${score} out of ${items.length}</h3>
      <p>${score >= items.length * 0.8 ? 'Sharp eye. Share the 3-step check with someone who needs it.' : 'Good start. Read the warning signs below and try again.'}</p>
      <button class="btn" id="again" type="button">Play again</button>`;
    bindMenu();
    document.getElementById('again').onclick = () => start(cat);
    return;
  }
  const it = items[i];
  box.innerHTML = menu() + `<div class="progress">${it.cat} · Question ${i + 1} of ${items.length}</div>
    <p class="msg">${it.text}</p>
    <div class="choices">
      <button type="button" data-a="real">Looks trustworthy</button>
      <button type="button" data-a="fake">Looks suspicious</button>
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
    `<div class="result ${ok ? 'ok' : 'no'}"><b>${ok ? 'Correct.' : 'Not quite.'}</b> It is ${it.answer === 'fake' ? 'suspicious' : 'trustworthy'}. ${it.why}</div>
     <button class="btn" id="next" type="button">${i === items.length - 1 ? 'See my score' : 'Next question'}</button>`;
  document.getElementById('next').onclick = () => { i++; show(); };
}
start('All');
// ---- AI or Real image quiz ----
const pairs = [
  { a: 'images/pair1-a.jpg', b: 'images/pair1-b.jpg', ai: 'b', why: 'Write the clues you can see here.' },
  { a: 'images/pair2-a.jpg', b: 'images/pair2-b.jpg', ai: 'a', why: 'Write the clues you can see here.' },
  { a: 'images/pair3-a.jpg', b: 'images/pair3-b.jpg', ai: 'b', why: 'Write the clues you can see here.' }
];
const spot = document.getElementById('spotbox');
let p = 0, pScore = 0;

function showPair() {
  if (p >= pairs.length) {
    spot.innerHTML = `<h3>You spotted ${pScore} of ${pairs.length}</h3>
      <p>Even experts get fooled sometimes. That is why the 3-step check matters.</p>
      <button class="btn" id="pagain" type="button">Play again</button>`;
    document.getElementById('pagain').onclick = () => { p = 0; pScore = 0; showPair(); };
    return;
  }
  const it = pairs[p];
  spot.innerHTML = `<div class="progress">Round ${p + 1} of ${pairs.length}</div>
    <div class="pair">
      <button class="pick" type="button" data-k="a"><img src="${it.a}" alt="Picture A"><span class="tag">Picture A</span></button>
      <button class="pick" type="button" data-k="b"><img src="${it.b}" alt="Picture B"><span class="tag">Picture B</span></button>
    </div>
    <div id="pout" aria-live="polite"></div>`;
  spot.querySelectorAll('.pick').forEach(b => b.onclick = () => pick(b.dataset.k));
}

function pick(k) {
  const it = pairs[p], ok = k === it.ai;
  if (ok) pScore++;
  spot.querySelectorAll('.pick').forEach(b => {
    b.disabled = true;
    b.querySelector('.tag').textContent = b.dataset.k === it.ai ? 'AI-made' : 'Real photo';
    if (b.dataset.k === k) b.classList.add(ok ? 'right' : 'wrong');
  });
  document.getElementById('pout').innerHTML =
    `<div class="result ${ok ? 'ok' : 'no'}"><b>${ok ? 'Correct.' : 'Not quite.'}</b> ${it.why}</div>
     <button class="btn" id="pnext" type="button">${p === pairs.length - 1 ? 'See my score' : 'Next round'}</button>`;
  document.getElementById('pnext').onclick = () => { p++; showPair(); };
}
showPair();

// ---- WhatsApp
const waText = 'Before you share anything online, try this free 3-step check (takes under a minute): '
  + location.href.split('#')[0];
document.getElementById('wa').href = 'https://wa.me/?text=' + encodeURIComponent(waText);