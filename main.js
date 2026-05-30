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

// ── FEEDBACK FORM ──
let fbRating = 0, fbRecommend = '';
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
function submitFeedback() {
  const msg = document.getElementById('fb-msg').value.trim();
  if(!fbRating) { alert('Please select a star rating.'); return; }
  if(!msg) { alert('Please write a short feedback message.'); return; }
  const name = document.getElementById('fb-name').value.trim() || 'Anonymous';
  const biz  = document.getElementById('fb-biz').value.trim();
  const cat  = document.getElementById('fb-category').value || 'General';
  const stars= '⭐'.repeat(fbRating);
  const rec  = fbRecommend==='yes'?'👍 Yes, would recommend!':fbRecommend==='no'?'🤔 Maybe / Not sure':'Not specified';
  const waText = encodeURIComponent(
    `🌟 *New Feedback — R.R. Sphere India*\n\n*Rating:* ${stars} (${fbRating}/5)\n*Category:* ${cat}\n*Name:* ${name}${biz?'\n*Business:* '+biz:''}\n*Would Recommend:* ${rec}\n\n*Feedback:*\n${msg}`
  );
  window.open(`https://wa.me/919417128045?text=${waText}`, '_blank');
  document.getElementById('fb-success').style.display = 'block';
  document.querySelector('.fb-submit').style.display = 'none';
}
