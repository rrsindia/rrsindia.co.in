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
