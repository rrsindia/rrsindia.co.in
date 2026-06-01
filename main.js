// ── NAV ACTIVE STATE ──
(function(){
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if(href === page || (page === '' && href === 'index.html') || (page === 'index.html' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();

// ── MOBILE MENU ──
function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('open');
}
document.addEventListener('click', function(e) {
  const nav = document.getElementById('navLinks');
  const burger = document.getElementById('hamburger');
  if(nav && burger && nav.classList.contains('open') && !nav.contains(e.target) && !burger.contains(e.target)) {
    nav.classList.remove('open');
  }
});

// ── SCROLL REVEAL ──
function observeReveal() {
  const els = document.querySelectorAll('.reveal:not(.visible)');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if(e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 80);
        obs.unobserve(e.target);
      }
    });
  }, {threshold: 0.1});
  els.forEach(el => obs.observe(el));
}
observeReveal();
document.addEventListener('scroll', observeReveal);

// ── FAQ TOGGLE ──
function toggleFaq(el) {
  const item = el.parentElement;
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
  if(!isOpen) item.classList.add('open');
}

// ── CONTACT FORM → WHATSAPP ──
function submitForm() {
  const name = document.getElementById('cf-name').value.trim();
  const contact = document.getElementById('cf-contact').value.trim();
  const topic = document.getElementById('cf-topic').value;
  const msg = document.getElementById('cf-msg').value.trim();
  if(!name || !contact) { alert('Please fill in your name and contact details.'); return; }
  const waMsg = encodeURIComponent(
    `Hello R.R. Sphere India!\n\n*Name:* ${name}\n*Contact:* ${contact}\n*Topic:* ${topic || 'General Enquiry'}\n*Message:* ${msg || '(no message)'}`
  );
  window.open(`https://wa.me/919417128045?text=${waMsg}`, '_blank');
  document.getElementById('form-success').style.display = 'block';
  document.querySelector('.form-submit').style.display = 'none';
}

// ── ENQUIRY FORM (RRFinEApp page) → EMAIL via Web3Forms ──
async function submitEnquiry() {
  const name = document.getElementById('enq-name').value.trim();
  const contact = document.getElementById('enq-contact').value.trim();
  if(!name || !contact) { alert('Please fill in your name and phone/WhatsApp number.'); return; }
  const email = document.getElementById('enq-email').value.trim();
  const biz = document.getElementById('enq-biz').value.trim();
  const plan = document.getElementById('enq-plan').value || 'Not specified';
  const msg = document.getElementById('enq-msg').value.trim();

  const btn = document.querySelector('.enq-submit');
  const originalText = btn.textContent;
  btn.textContent = 'Sending…';
  btn.disabled = true;

  const payload = {
    access_key: WEB3FORMS_KEY,
    subject: `📩 RRFinEApp Enquiry — ${plan}`,
    from_name: 'RRFinEApp Website',
    "Name": name,
    "Phone/WhatsApp": contact,
    "Email": email || '—',
    "Business": biz || '—',
    "Interested In": plan,
    "Message": msg || '—'
  };

  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if(data.success) {
      document.getElementById('enq-success').style.display = 'block';
      btn.style.display = 'none';
    } else {
      alert('Sorry, something went wrong sending your enquiry. Please try WhatsApp or call us.');
      btn.textContent = originalText; btn.disabled = false;
    }
  } catch(err) {
    alert('Network issue — please check your connection or use the WhatsApp option.');
    btn.textContent = originalText; btn.disabled = false;
  }
}
const starLabels = ['','😞 Poor','😐 Fair','🙂 Good','😊 Very Good','🤩 Excellent!'];
function setRating(val) {
  fbRating = val;
  document.querySelectorAll('.star-btn').forEach((btn, i) => btn.classList.toggle('active', i < val));
  document.getElementById('starLabel').textContent = starLabels[val];
}
function setRecommend(val) {
  fbRecommend = val;
  ['yes','no'].forEach(v => {
    const btn = document.getElementById('rec-' + v);
    if(btn){ btn.style.borderColor = val===v?'var(--g4)':'var(--border)'; btn.style.color = val===v?'var(--g4)':'var(--muted)'; }
  });
}
// Web3Forms access key — sends feedback to rrsindia122@gmail.com
const WEB3FORMS_KEY = 'c06fa8d4-b67d-4cc3-9982-ad202da2d532';

async function submitFeedback() {
  const msg = document.getElementById('fb-msg').value.trim();
  if(!fbRating) { alert('Please select a star rating.'); return; }
  if(!msg) { alert('Please write a short feedback message.'); return; }
  const name = document.getElementById('fb-name').value.trim() || 'Anonymous';
  const biz  = document.getElementById('fb-biz').value.trim();
  const cat  = document.getElementById('fb-category').value || 'General';
  const stars= '⭐'.repeat(fbRating);
  const rec  = fbRecommend==='yes'?'👍 Yes, would recommend!':fbRecommend==='no'?'🤔 Maybe / Not sure':'Not specified';

  const btn = document.querySelector('.fb-submit');
  const originalText = btn.textContent;
  btn.textContent = 'Sending…';
  btn.disabled = true;

  const payload = {
    access_key: WEB3FORMS_KEY,
    subject: `🌟 New Feedback (${fbRating}/5) — ${cat}`,
    from_name: 'RR Sphere Website',
    "Rating": `${stars} (${fbRating}/5)`,
    "Category": cat,
    "Name": name,
    "Business": biz || '—',
    "Would Recommend": rec,
    "Feedback": msg
  };

  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if(data.success) {
      document.getElementById('fb-success').style.display = 'block';
      btn.style.display = 'none';
    } else {
      alert('Sorry, something went wrong sending your feedback. Please try the WhatsApp option below.');
      btn.textContent = originalText;
      btn.disabled = false;
    }
  } catch(err) {
    alert('Network issue — please check your connection or use the WhatsApp option below.');
    btn.textContent = originalText;
    btn.disabled = false;
  }
}

// ════════════ AI ASSISTANT WIDGET ════════════
(function(){
  const KB = [
    {k:['price','pricing','cost','fee','charge','how much','rupee','plan','rate','expensive'],
     a:"Our RRFinEApp pricing plans are launching shortly! 🏷️ In the meantime we're happy to share current pricing and a personalised quote.<br><br>👉 <a href='enquire.html'>Request a quote</a> or <a href='https://wa.me/919417128045?text=I%27d%20like%20RRFinEApp%20pricing' target='_blank'>WhatsApp us</a>"},
    {k:['demo','trial','try','test','see it','show me','free demo'],
     a:"You can get a free demo of RRFinEApp! 🎓 We'll walk you through it the same day.<br><br>👉 <a href='enquire.html'>Book a free demo</a> or open the app at <a href='https://fin.rrsindia.co.in' target='_blank'>fin.rrsindia.co.in</a>"},
    {k:['what is','about rrfin','about the app','rrfineapp','tell me about','what does','rrfine'],
     a:"RRFinEApp is a cloud-based accounting app for Indian businesses — like Tally but in the cloud, like D365 but simple. 📊 Full accounting, GST invoicing, final accounts, stock & multi-company.<br><br>Want to <a href='finapp.html'>see all features</a>?"},
    {k:['gst','tax','gstr','invoice','invoicing','cgst','sgst','igst','return'],
     a:"Yes! RRFinEApp is fully GST-compliant 🧾 — GST Sales & Purchase invoices with auto CGST/SGST/IGST, plus GSTR-1 & GSTR-3B ready reports you can export straight to the portal."},
    {k:['tally','migrate','switch from','shift'],
     a:"RRFinEApp feels right at home for Tally users! ⌨️ Keyboard-first (F2 New, F5 Refresh, Esc Back) and Dr/Cr entry — just like Tally, but cloud-based so you can work from anywhere."},
    {k:['cloud','install','download','setup','anywhere','device','browser'],
     a:"RRFinEApp is 100% cloud-based ☁️ — no installation. Log in from any browser on any device, and your data backs up to Google Drive daily."},
    {k:['safe','secure','security','backup','data','audit','trust'],
     a:"Your data is very safe 🔐 — daily automated Google Drive backups, immutable posted entries (no silent edits), full audit trails, and role-based access control."},
    {k:['feature','what can','module','report','ledger','balance sheet','profit','loss','stock','inventory','trial balance','day book'],
     a:"RRFinEApp includes 📒 full accounting (Ledger, Trial Balance, Day Book), 🧾 GST invoicing, 📊 Final Accounts (P&L, Balance Sheet, Ageing), 📦 Stock & Inventory and 🏢 multi-company support.<br><br>Full list on the <a href='finapp.html'>RRFinEApp page</a>."},
    {k:['coaching','tuition','class','study','student','maths','math','school','child','kid','board'],
     a:"R.R. Coaching Classes offers expert tuition from Nursery to Class 10 — all boards & subjects 📚 — including our signature 'Maths Made Easy' program!<br><br>👉 <a href='coaching.html'>Learn about coaching</a>"},
    {k:['service','software','development','website','ai solution','what do you do','consulting','erp','data analytics'],
     a:"We offer custom software development, AI-powered solutions, cloud & DevOps, data analytics, IT training and ERP integrations 💻<br><br>👉 <a href='services.html'>Explore our services</a>"},
    {k:['contact','call','phone','email','reach','talk','number','whatsapp','address','location','where'],
     a:"Reach us anytime! 📞<br>📱 WhatsApp/Call: <a href='https://wa.me/919417128045' target='_blank'>+91-94171-28045</a><br>📧 <a href='mailto:rrsindia122@gmail.com'>rrsindia122@gmail.com</a><br>📍 Amritsar, Punjab, <span class='in-hl'>India</span>"},
    {k:['hi','hello','hey','namaste','good morning','good evening','hii','helo','hlo'],
     a:"Hello! 👋 I'm the AI Assistant. I can help with RRFinEApp features, pricing, demos, GST, coaching classes and more. What would you like to know?"},
    {k:['thank','thanks','thx','great','nice','okay','cool','good'],
     a:"You're welcome! 😊 Anything else I can help with? You can also <a href='enquire.html'>send an enquiry</a> anytime."},
    {k:['who are you','your name','what are you','are you human','bot','robot'],
     a:"I'm the AI Assistant 🤖 — here to help you learn about R.R. Sphere India, RRFinEApp and our coaching classes. Ask me anything!"},
    {k:['company','rr sphere','who','experience','about you','about us','history'],
     a:"R.R. Sphere India is an IT & Learning company with 30+ years of expertise (since 1995), based in Amritsar 🇮🇳. We build cloud software, AI solutions and run coaching classes.<br><br>👉 <a href='about.html'>About us</a>"}
  ];
  const FALLBACK = "I'm not totally sure about that one 🤔 — but our team would love to help!<br><br>👉 <a href='https://wa.me/919417128045' target='_blank'>WhatsApp us</a> or <a href='enquire.html'>send an enquiry</a> and we'll get right back to you.";
  const QUICK = ["💰 Pricing","🎓 Book a demo","📊 What is RRFinEApp?","🧾 GST features","📚 Coaching","📞 Contact"];

  function findAnswer(text){
    const t = ' ' + text.toLowerCase() + ' ';
    let best = null, score = 0;
    for(const item of KB){
      let s = 0;
      for(const kw of item.k){ if(t.includes(kw)) s += kw.length; }
      if(s > score){ score = s; best = item; }
    }
    return best ? best.a : FALLBACK;
  }

  function makeFabDraggable(fab){
    let startX = 0, startY = 0, origLeft = 0, origTop = 0;
    let dragging = false, moved = false, justDragged = false;

    function down(e){
      dragging = true; moved = false; justDragged = false;
      const r = fab.getBoundingClientRect();
      origLeft = r.left; origTop = r.top;
      startX = e.clientX; startY = e.clientY;
      try{ fab.setPointerCapture(e.pointerId); }catch(_){ }
      fab.style.transition = 'none';
      fab.style.animation = 'none';
    }
    function move(e){
      if(!dragging) return;
      const dx = e.clientX - startX, dy = e.clientY - startY;
      if(!moved && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) moved = true;
      if(!moved) return;
      const w = fab.offsetWidth, h = fab.offsetHeight;
      let nx = origLeft + dx, ny = origTop + dy;
      nx = Math.max(8, Math.min(window.innerWidth - w - 8, nx));
      ny = Math.max(8, Math.min(window.innerHeight - h - 8, ny));
      fab.style.left = nx + 'px'; fab.style.top = ny + 'px';
      fab.style.right = 'auto'; fab.style.bottom = 'auto';
    }
    function up(){
      if(!dragging) return;
      dragging = false;
      fab.style.transition = ''; fab.style.animation = '';
      if(moved){ justDragged = true; fab.dataset.dragged = '1'; }
    }
    fab.addEventListener('pointerdown', down);
    fab.addEventListener('pointermove', move);
    fab.addEventListener('pointerup', up);
    fab.addEventListener('pointercancel', up);
    fab.addEventListener('click', function(e){
      if(justDragged){ justDragged = false; e.preventDefault(); return; }
      openChat();
    });
  }

  function anchorToLogo(fab){
    const logo = document.querySelector('.nav-logo');
    const w = fab.offsetWidth || 60, h = fab.offsetHeight || 36;
    if(!logo){ fab.style.top='14px'; fab.style.left='300px'; fab.style.right='auto'; fab.style.bottom='auto'; return; }
    const r = logo.getBoundingClientRect();
    let top = r.top + (r.height - h)/2;
    let left = r.right + 14;
    top = Math.max(6, Math.min(window.innerHeight - h - 8, top));
    left = Math.max(8, Math.min(window.innerWidth - w - 8, left));
    fab.style.top = top+'px'; fab.style.left = left+'px';
    fab.style.right='auto'; fab.style.bottom='auto';
  }

  function buildAI(){
    // ONE floating, draggable AI button — auto-positions next to "R.R. Sphere India"
    if(!document.querySelector('.ai-fab')){
      const fab = document.createElement('button');
      fab.className = 'ai-fab'; fab.type = 'button';
      fab.title = 'Ask AI  (Alt + A)';
      fab.innerHTML = '<svg class="spark" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><defs><linearGradient id="boltg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8c860"/><stop offset="0.55" stop-color="#d6a830"/><stop offset="1" stop-color="#b8870f"/></linearGradient></defs><path d="M13 2L4.5 13.5H11l-1 8.5L18.5 10H12l1-8z" fill="url(#boltg)" stroke="#1c3508" stroke-width="1.8" stroke-linejoin="round"/></svg><span>AI</span>';
      document.body.appendChild(fab);

      // Always start next to "R.R. Sphere India" on every page load (no memory)
      anchorToLogo(fab); requestAnimationFrame(()=>anchorToLogo(fab));
      // keep it beside the name on resize, until the user drags it this session
      window.addEventListener('resize', function(){ if(!fab.dataset.dragged) anchorToLogo(fab); });
      window.addEventListener('load', function(){ if(!fab.dataset.dragged) anchorToLogo(fab); });

      makeFabDraggable(fab);
    }
    if(!document.querySelector('.ai-chat')){
      const chat = document.createElement('div');
      chat.className = 'ai-chat';
      chat.innerHTML =
        '<div class="ai-chat-header">'+
          '<div class="ai-ava"><svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><defs><linearGradient id="boltg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8c860"/><stop offset="0.55" stop-color="#d6a830"/><stop offset="1" stop-color="#b8870f"/></linearGradient></defs><path d="M13 2L4.5 13.5H11l-1 8.5L18.5 10H12l1-8z" fill="url(#boltg2)" stroke="#1c3508" stroke-width="1.8" stroke-linejoin="round"/></svg></div>'+
          '<div><h4>AI Assistant</h4><p>Online now · Alt+A</p></div>'+
          '<button class="ai-close" type="button" aria-label="Close">&times;</button>'+
        '</div>'+
        '<div class="ai-chat-body" id="aiBody"></div>'+
        '<div class="ai-quick" id="aiQuick"></div>'+
        '<div class="ai-chat-input">'+
          '<input type="text" id="aiInput" placeholder="Type your question...">'+
          '<button class="ai-send" type="button" aria-label="Send"><svg viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg></button>'+
        '</div>';
      document.body.appendChild(chat);
      chat.querySelector('.ai-close').addEventListener('click', closeChat);
      chat.querySelector('.ai-send').addEventListener('click', sendMsg);
      chat.querySelector('#aiInput').addEventListener('keydown', function(e){ if(e.key==='Enter') sendMsg(); });
    }
  }

  let greeted = false;
  function openChat(){
    document.querySelector('.ai-chat').classList.add('open');
    const fab = document.querySelector('.ai-fab'); if(fab) fab.classList.add('hidden');
    if(!greeted){
      greeted = true;
      botSay("Hi there! 👋 I'm the AI Assistant. Ask me about RRFinEApp, pricing, a free demo, GST features or our coaching classes!");
      renderQuick();
    }
    setTimeout(function(){ const i=document.getElementById('aiInput'); if(i) i.focus(); }, 120);
  }
  function closeChat(){
    document.querySelector('.ai-chat').classList.remove('open');
    const fab = document.querySelector('.ai-fab'); if(fab) fab.classList.remove('hidden');
  }
  function scrollBody(){ const b=document.getElementById('aiBody'); if(b) b.scrollTop=b.scrollHeight; }
  function botSay(html){ const b=document.getElementById('aiBody'); const d=document.createElement('div'); d.className='ai-msg bot'; d.innerHTML=html; b.appendChild(d); scrollBody(); }
  function userSay(text){ const b=document.getElementById('aiBody'); const d=document.createElement('div'); d.className='ai-msg user'; d.textContent=text; b.appendChild(d); scrollBody(); }
  function typing(on){
    const b=document.getElementById('aiBody');
    if(on){ const d=document.createElement('div'); d.className='ai-typing'; d.id='aiTyping'; d.innerHTML='<span></span><span></span><span></span>'; b.appendChild(d); scrollBody(); }
    else { const t=document.getElementById('aiTyping'); if(t) t.remove(); }
  }
  function respond(text){ typing(true); setTimeout(function(){ typing(false); botSay(findAnswer(text)); }, 650); }
  function renderQuick(){
    const q=document.getElementById('aiQuick'); q.innerHTML='';
    QUICK.forEach(function(label){
      const b=document.createElement('button'); b.type='button'; b.textContent=label;
      b.addEventListener('click', function(){ userSay(label); respond(label); });
      q.appendChild(b);
    });
  }
  function sendMsg(){
    const i=document.getElementById('aiInput'); const text=i.value.trim();
    if(!text) return;
    userSay(text); i.value=''; respond(text);
  }

  function chatIsOpen(){ const c=document.querySelector('.ai-chat'); return !!(c && c.classList.contains('open')); }
  function toggleChat(){ if(!document.querySelector('.ai-chat')) buildAI(); if(chatIsOpen()) closeChat(); else openChat(); }

  // Keyboard shortcut: Alt + A  →  open / close the AI assistant
  document.addEventListener('keydown', function(e){
    if(e.altKey && !e.ctrlKey && !e.metaKey && (e.code === 'KeyA' || (e.key && e.key.toLowerCase() === 'a'))){
      e.preventDefault();
      toggleChat();
    }
  });

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', buildAI);
  else buildAI();
})();
