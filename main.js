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

// ── DROPDOWN NAV (About / Solutions / Business / Portals) ──
// Click toggles the menu (works on touch); desktop also opens on hover via CSS.
(function(){
  // Highlight the parent menu button when one of its links is the current page.
  document.querySelectorAll('.nav-dd').forEach(function(dd){
    if(dd.querySelector('.nav-dd-menu a.active')){
      const b = dd.querySelector('.nav-dd-btn'); if(b) b.classList.add('active');
    }
  });
  document.querySelectorAll('.nav-dd-btn').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.preventDefault(); e.stopPropagation();
      const dd = btn.parentElement;
      const wasOpen = dd.classList.contains('open');
      document.querySelectorAll('.nav-dd.open').forEach(function(d){ d.classList.remove('open'); });
      if(!wasOpen) dd.classList.add('open');
    });
  });
  // Click anywhere outside an open dropdown closes it.
  document.addEventListener('click', function(e){
    if(!e.target.closest('.nav-dd')){
      document.querySelectorAll('.nav-dd.open').forEach(function(d){ d.classList.remove('open'); });
    }
  });
})();

// ── FREE-DEMO ANNOUNCEMENT BAR + ⚡AI LOGO (every page) ──
(function(){
  if(sessionStorage.getItem('promoDismissed') === '1') return;
  function mount(){
    if(document.getElementById('promoBar')) return;
    var bar = document.createElement('div');
    bar.className = 'promo-bar'; bar.id = 'promoBar';
    bar.innerHTML =
      '<button class="promo-x" id="promoX" type="button" aria-label="Dismiss">&times;</button>' +
      '<div class="promo-ai"><span class="ai-logo" title="Rova"><span class="ai-bolt">⚡</span>AI</span></div>' +
      '<span class="promo-ai-sep">·</span>' +
      '<a class="promo-cta" href="enquire.html?demo=1">' +
        '<span class="promo-gift">🎁</span>' +
        '<span class="promo-msg">Try <b>RRFinEApp</b> FREE for 30 days</span>' +
        '<span class="promo-go">Book a Free Demo →</span>' +
      '</a>';
    document.body.appendChild(bar);
    document.body.classList.add('has-promo');
    document.getElementById('promoX').addEventListener('click', function(e){
      e.preventDefault(); e.stopPropagation();
      bar.remove(); document.body.classList.remove('has-promo');
      sessionStorage.setItem('promoDismissed', '1');
    });
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();

// ── Footer "Sitemap" link (SEO + UX), injected on every page ──
(function(){
  function add(){
    var col = document.querySelector('footer .footer-col');
    if(col && !col.querySelector('a[href="sitemap.html"]')){
      var a = document.createElement('a'); a.href = 'sitemap.html'; a.textContent = 'Sitemap';
      col.appendChild(a);
    }
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', add); else add();
})();

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

// ── CONTACT FORM → RRFinEApp enquiry API (web_submissions) ──
async function submitForm() {
  const name = document.getElementById('cf-name').value.trim();
  const contact = document.getElementById('cf-contact').value.trim();
  const topic = document.getElementById('cf-topic').value;
  const msg = document.getElementById('cf-msg').value.trim();
  if(!name || !contact) { alert('Please fill in your name and contact details.'); return; }
  const isEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contact);
  const btn = document.querySelector('.form-submit');
  const orig = btn.textContent; btn.textContent = 'Sending…'; btn.disabled = true;
  try {
    const res = await fetch(RRFINEAPP_API + '/public/enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'x-api-key': RRFINEAPP_PUBLIC_KEY },
      body: JSON.stringify({ name, phone: isEmail ? '' : contact, email: isEmail ? contact : '',
        business: '', plan_interest: topic || 'General Enquiry', message: msg })
    });
    const data = await res.json().catch(()=>({}));
    if(res.ok && data.ok) {
      const s = document.getElementById('form-success');
      if(s){ s.style.display = 'block'; s.innerHTML = `✅ Thank you! Your message has been received (ref ${data.ref_no}). We'll get back to you shortly!` + SPAM_NOTE; }
      btn.style.display = 'none';
    } else {
      alert(data.error || 'Sorry, something went wrong. Please try again.');
      btn.textContent = orig; btn.disabled = false;
    }
  } catch(err) {
    alert('Network issue, please check your connection and try again.');
    btn.textContent = orig; btn.disabled = false;
  }
}

// ── ENQUIRY FORM (RRFinEApp page) → our own API (web_submissions) ──
async function submitEnquiry() {
  const name = document.getElementById('enq-name').value.trim();
  const contact = document.getElementById('enq-contact').value.trim();
  const email = document.getElementById('enq-email').value.trim();
  if(!name) { alert('Please enter your name.'); return; }
  if(!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { alert('Please enter a valid email address.'); return; }
  if((contact.replace(/\D/g,'')).length < 10) { alert('Please enter a valid phone / WhatsApp number with country code.'); return; }
  const biz = document.getElementById('enq-biz').value.trim();
  const plan = document.getElementById('enq-plan').value || 'Not specified';
  const msg = document.getElementById('enq-msg').value.trim();
  const isDemo = plan === 'Just a free demo first';
  const demoProduct = isDemo ? ((document.getElementById('enq-demo-product')||{}).value || '') : '';
  const demoUser    = isDemo ? ((document.getElementById('enq-demo-user')||{}).value || 'any') : '';
  const demoCountry = isDemo ? ((document.getElementById('enq-demo-country')||{}).value || 'IN') : 'IN';

  const btn = document.querySelector('.enq-submit');
  const originalText = btn.textContent;
  btn.textContent = 'Sending…';
  btn.disabled = true;

  try {
    const res = await fetch(RRFINEAPP_API + '/public/enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'x-api-key': RRFINEAPP_PUBLIC_KEY },
      body: JSON.stringify({ name, phone: contact, email, business: biz, plan_interest: plan, message: msg,
        is_demo: isDemo, category: demoProduct, demo_user_type: demoUser, country: demoCountry })
    });
    const data = await res.json();
    if(res.ok && data.ok) {
      const s = document.getElementById('enq-success');
      const okMsg = isDemo
        ? `🎁 Your free demo is booked! Reference ${data.ref_no}. We'll set it up and email your access details, usually within 48 hours.`
        : `✅ Thank you! Your enquiry reference is ${data.ref_no}. Our team will get back to you shortly.`;
      if (s) { s.style.display = 'block'; s.innerHTML = okMsg + SPAM_NOTE; }
      btn.style.display = 'none';
    } else {
      alert(data.error || 'Sorry, something went wrong sending your enquiry. Please try WhatsApp or call us.');
      btn.textContent = originalText; btn.disabled = false;
    }
  } catch(err) {
    alert('Network issue, please check your connection or use the WhatsApp option.');
    btn.textContent = originalText; btn.disabled = false;
  }
}
// Show the demo-booking fields (product + who it's for) only when "Just a free demo
// first" is selected in the enquiry "I'm interested in" dropdown.
window.enqToggleDemo = function () {
  const plan = (document.getElementById('enq-plan') || {}).value || '';
  const box = document.getElementById('enq-demo-fields');
  if (box) box.style.display = (plan === 'Just a free demo first') ? 'block' : 'none';
};
// Honor ?demo=1 (e.g. the app login "Book a Free Demo" link) → preselect the free
// demo option and reveal its fields on page load.
(function () {
  function init() {
    const sel = document.getElementById('enq-plan');
    if (!sel || !/[?&]demo=1\b/.test(location.search)) return;
    for (let i = 0; i < sel.options.length; i++) {
      if (sel.options[i].value === 'Just a free demo first' || sel.options[i].text === 'Just a free demo first') {
        sel.selectedIndex = i; break;
      }
    }
    if (window.enqToggleDemo) window.enqToggleDemo();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

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
// Web3Forms access key (legacy, feedback now posts to the RRFinEApp API below)
const WEB3FORMS_KEY = 'c06fa8d4-b67d-4cc3-9982-ad202da2d532';
const IMGBB_KEY = '96a92f3973c9b79d3b83aa5d19cee3d0';

// ── RRFinEApp own support API (no 3rd-party for tickets/screenshots) ─────────
// Tickets submit straight into the RRFinEApp database (single source of truth)
// and screenshots are hosted on our own server. PUBLIC key is a submit-only,
// publishable token (same posture as the Web3Forms key above).
const RRFINEAPP_API        = 'https://fin.rrsindia.co.in/api/v1';
// Appended to every form's success message. Disabled 2026-06-30: mail now sends from
// the authenticated domain mailbox (SPF/DKIM/DMARC pass) and lands in the inbox, so the
// "check your spam folder" prompt is no longer needed. Kept as '' to leave call sites intact.
const SPAM_NOTE = '';
const RRFINEAPP_PUBLIC_KEY = '2a524909821fa4cdd07b96a173a02603479a7deca1aa0ef0';

async function submitFeedback() {
  const msg = document.getElementById('fb-msg').value.trim();
  if(!fbRating) { alert('Please select a star rating.'); return; }
  if(!msg) { alert('Please write a short feedback message.'); return; }
  const email = document.getElementById('fb-email').value.trim();
  const phone = document.getElementById('fb-phone').value.trim();
  if(!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { alert('Please enter a valid email address.'); return; }
  if((phone.replace(/\D/g,'')).length < 10) { alert('Please enter a valid phone / WhatsApp number with country code.'); return; }
  const name = document.getElementById('fb-name').value.trim() || 'Anonymous';
  const biz  = document.getElementById('fb-biz').value.trim();
  const cat  = document.getElementById('fb-category').value || 'General';
  const stars= '⭐'.repeat(fbRating);
  const rec  = fbRecommend==='yes'?'👍 Yes, would recommend!':fbRecommend==='no'?'🤔 Maybe / Not sure':'Not specified';

  const btn = document.querySelector('.fb-submit');
  const originalText = btn.textContent;
  btn.textContent = 'Sending…';
  btn.disabled = true;

  try {
    const res = await fetch(RRFINEAPP_API + '/public/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'x-api-key': RRFINEAPP_PUBLIC_KEY },
      body: JSON.stringify({ name, email, phone, business: biz, category: cat, rating: fbRating, recommend: fbRecommend || null, message: msg })
    });
    const data = await res.json();
    if(res.ok && data.ok) {
      const s = document.getElementById('fb-success');
      if (s) { s.style.display = 'block'; s.innerHTML = `🌟 Thank you for your feedback! Reference ${data.ref_no}.` + SPAM_NOTE; }
      btn.style.display = 'none';
    } else {
      alert(data.error || 'Sorry, something went wrong sending your feedback. Please try the WhatsApp option below.');
      btn.textContent = originalText;
      btn.disabled = false;
    }
  } catch(err) {
    alert('Network issue, please check your connection or use the WhatsApp option below.');
    btn.textContent = originalText;
    btn.disabled = false;
  }
}

// ════════════ RRFinEApp SUPPORT TICKET ════════════
async function submitTicket() {
  const name    = document.getElementById('tk-name').value.trim();
  const contact = document.getElementById('tk-contact').value.trim();
  const area    = document.getElementById('tk-area').value;
  const type    = document.getElementById('tk-type').value;
  const desc    = document.getElementById('tk-desc').value.trim();
  const sevEl   = document.querySelector('input[name="severity"]:checked');

  // required fields
  if(!name)    { alert('Please enter your name.'); return; }
  if(!contact || (contact.replace(/\D/g,'')).length < 10) { alert('Please enter a valid phone / WhatsApp number with country code.'); return; }
  if(!area)    { alert('Please select which area of the app the issue is in.'); return; }
  if(!type)    { alert('Please select the type of issue.'); return; }
  if(!sevEl)   { alert('Please choose how serious the issue is.'); return; }
  if(!desc)    { alert('Please describe the problem.'); return; }

  const email    = document.getElementById('tk-email').value.trim();
  if(!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { alert('Please enter a valid email address.'); return; }
  const biz      = document.getElementById('tk-biz').value.trim();
  const tenantId = (document.getElementById('tk-tenant')  || {}).value ? document.getElementById('tk-tenant').value.trim()  : '';
  const companyId= (document.getElementById('tk-company') || {}).value ? document.getElementById('tk-company').value.trim() : '';
  const steps    = document.getElementById('tk-steps').value.trim();
  const device  = document.getElementById('tk-device').value.trim();
  const browser = document.getElementById('tk-browser').value.trim();
  const severity = sevEl.value;

  // screenshot (optional), validate size client-side (server re-checks at 5MB)
  const shotEl = document.getElementById('tk-screenshot');
  const shotFile = (shotEl && shotEl.files && shotEl.files.length) ? shotEl.files[0] : null;
  if(shotFile && shotFile.size > 5 * 1024 * 1024) {
    alert('Your screenshot is larger than 5MB. Please upload a smaller image, or send it to us on WhatsApp.');
    return;
  }

  const btn = document.querySelector('.tk-submit');
  const originalText = btn.textContent;
  btn.textContent = 'Submitting…';
  btn.disabled = true;

  // Map the website fields onto the RRFinEApp ticket model.
  const priority = /high/i.test(severity) ? 'Urgent' : /medium/i.test(severity) ? 'Medium' : 'Low';
  const category = /bill|invoic|gst|tax/i.test(area + ' ' + type) ? 'Billing' : 'Technical';
  const description =
    desc +
    (steps   ? `\n\nSteps to reproduce:\n${steps}` : '') +
    `\n\nSeverity: ${severity}\nApp area: ${area}\nIssue type: ${type}` +
    (device  ? `\nDevice: ${device}`   : '') +
    (browser ? `\nBrowser: ${browser}` : '');

  try {
    // 1) Upload the screenshot to OUR server (no 3rd-party image host).
    let screenshotUrl = '';
    if(shotFile) {
      btn.textContent = 'Uploading screenshot…';
      const imgData = new FormData();
      imgData.append('image', shotFile);
      const imgRes = await fetch(RRFINEAPP_API + '/public/upload-screenshot', {
        method: 'POST',
        headers: { 'x-api-key': RRFINEAPP_PUBLIC_KEY },   // do NOT set Content-Type for FormData
        body: imgData
      });
      const imgJson = await imgRes.json().catch(() => ({}));
      if(imgRes.ok && imgJson.url) screenshotUrl = imgJson.url;
      else if(!imgRes.ok) { alert(imgJson.error || 'Could not upload the screenshot. Please try a smaller image.'); btn.textContent = originalText; btn.disabled = false; return; }
    }

    // 2) Create the ticket directly in the RRFinEApp database (our data).
    btn.textContent = 'Submitting…';
    const res = await fetch(RRFINEAPP_API + '/public/submit-ticket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'x-api-key': RRFINEAPP_PUBLIC_KEY },
      body: JSON.stringify({
        subject: `${type}, ${area}`,
        description,
        name,
        email,
        phone: contact,
        company: biz,
        country: 'IN',
        category,
        priority,
        tenant_id: tenantId,
        company_id: companyId,
        screenshot_url: screenshotUrl
      })
    });
    const data = await res.json().catch(() => ({}));
    if(res.ok && data.ok) {
      const s = document.getElementById('tk-success');
      s.innerHTML = '✅ Your issue has been logged! Your reference number is <strong>' + data.ticket_no +
        '</strong>. Please keep it to track your ticket. Our support team will get back to you soon. 🙏' + SPAM_NOTE;
      s.style.display = 'block';
      btn.style.display = 'none';
    } else {
      alert('Sorry, something went wrong submitting your report.' + (data.error ? '\n\nReason: ' + data.error : '') + '\n\nPlease try the WhatsApp option below.');
      btn.textContent = originalText;
      btn.disabled = false;
    }
  } catch(err) {
    alert('Network issue, please check your connection or use the WhatsApp option below.');
    btn.textContent = originalText;
    btn.disabled = false;
  }
}

// ── Order form: load plan categories + premium features, collect users, submit ─
const ROLE_OPTS = [['admin','Admin'],['dataentry','Data Entry'],['viewonly','Viewer'],['auditor','Auditor']];
function odUserRow(role){
  return '<div class="od-user"><select onchange="odTotal()">' +
    ROLE_OPTS.map(r => '<option value="'+r[0]+'"'+(r[0]===role?' selected':'')+'>'+r[1]+'</option>').join('') +
    '</select>'+
    '<input type="text" class="od-uname" placeholder="Full name">'+
    '<input type="text" class="od-ulogin" placeholder="Email or mobile (login)">'+
    '<button type="button" class="rm" onclick="this.parentNode.remove();odTotal()">✕</button></div>';
}
function odAddUser(role){ const box=document.getElementById('od-users'); if(box){ box.insertAdjacentHTML('beforeend', odUserRow(role||'dataentry')); odTotal(); } }

let OD = { cats:[], prices:[], feats:[], userRates:{}, offer:{eligible:true,value:10000}, terms:'', note:'', company:null, footer:'' };
function odEsc(s){ return String(s==null?'':s).replace(/[<>&]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;'}[c])); }
function odPrice(code){ const p = OD.prices.find(x=>String(x.code).toUpperCase()===String(code).toUpperCase()); return p?Number(p.rate)||0:0; }
function odSelCat(){ const el=document.querySelector('input[name="od-cat"]:checked'); return el?OD.cats.find(c=>c.code===el.value):null; }
// Premium value = the SELECTED plan's "Premium worth ₹" configured in SuperAdmin →
// Price List. NO code fallback: if it's blank, it stays blank (shows no "worth ₹X").
function odOfferVal(){ const c=odSelCat(); return (c && c.free_value) ? Number(c.free_value) : 0; }
// Offer note is a TEMPLATE: {worth} = " (worth ₹X)" or blank, {limit} = client limit,
// {count} = number of premium features. {value} is also supported (blank when unset).
function odOfferNote(){
  var val = odOfferVal();
  var worthTxt = val > 0 ? (' (worth ₹' + val.toLocaleString('en-IN') + ')') : '';
  var tpl = (OD.note && OD.note.trim()) ? OD.note
    : 'All premium features are auto-selected and FREE for the first {limit} clients{worth}, activated after your first user login within 48 hours.';
  var lim = (OD.offer && (OD.offer.client_limit || OD.offer.limit)) || 10;
  var cnt = odPlanPremium().filter(function(f){ return !f.coming_soon; }).length;
  return tpl.replace(/\s*\(worth ₹\{value\}\)/g, worthTxt)   // old templates with (worth ₹{value})
            .replace(/\{worth\}/g, worthTxt)
            .replace(/\{value\}/g, val > 0 ? val.toLocaleString('en-IN') : '')
            .replace(/\{limit\}/g, lim).replace(/\{count\}/g, cnt);
}

// Premium features that apply to the selected plan (min_plan all/null or == plan).
// "Full Finance (Non-GST)" is Full Finance under the hood: it matches full_finance
// features but EXCLUDES GST-only ones (GST Returns, e-Way/e-Invoice, GSTR-2A/2B Recon).
function odPlanPremium(){ const c=odSelCat(); const plan=c?c.code:null;
  const nonGst = plan==='full_finance_nongst';
  const base = nonGst ? 'full_finance' : plan;
  return OD.feats.filter(f=>{ const m=(f.min_plan||'all');
    if(nonGst && f.gst_only) return false;
    return (m==='all'||m===base); }); }

// Render the "included free" premium list + a separate display-only upcoming window.
function odRenderPremium(){
  const feat=document.getElementById('od-feat'); if(!feat) return;
  const list=odPlanPremium();
  // Included/selectable = active features for THIS plan only. Upcoming preview =
  // ALL coming-soon features (across every plan), display-only, not part of the order.
  const now=list.filter(f=>!f.coming_soon);
  const soon=(OD.feats||[]).filter(f=>f.coming_soon);
  let html='';
  if(now.length){
    html += '<div class="od-incl"><div class="od-incl-h">✓ All premium features included FREE with your plan'+(odOfferVal()>0?(', worth ₹'+odOfferVal().toLocaleString('en-IN')):'')+'</div>'+
      now.map(f=>'<div class="od-incl-row"><span>'+(f.icon||'⚡')+' '+odEsc(f.name)+'</span><span class="od-free">FREE</span></div>'+
        (f.description?'<div class="od-incl-d">'+odEsc(f.description)+'</div>':'')).join('')+
      '<div class="od-incl-note">Auto-selected for you, activated after your first user login, within 48 hours.</div></div>';
  } else { html += '<p style="color:var(--muted)">Premium features are included with your plan.</p>'; }
  if(soon.length){
    html += '<div class="od-soon"><div class="od-soon-h">★ Upcoming, coming soon</div>'+
      soon.map(f=>'<div class="od-soon-row"><b>'+(f.icon||'⚡')+' '+odEsc(f.name)+'</b>'+(f.description?'<span>, '+odEsc(f.description)+'</span>':'')+'</div>').join('')+
      '<div class="od-incl-note">Preview only, not part of this order. We’ll let you know when these launch.</div></div>';
  }
  feat.innerHTML=html;
}

// Build the order breakdown: plan + (premium free) + extra companies + extra users.
function odBreakdown(){
  const lines=[]; let total=0;
  const c=odSelCat();
  const inclC=c?(c.incl_companies||1):1, inclU=c?(c.incl_users||1):1;
  if(c){ const r=Number(c.rate)||0; lines.push({label:'Plan: '+c.label, qty:1, rate:r, amt:r, note:'Includes '+inclC+' company(s) & '+inclU+' user(s)'}); total+=r; }
  const prem=odPlanPremium().filter(f=>!f.coming_soon);
  if(prem.length){ lines.push({label:'Premium features ('+prem.length+'), all included', qty:'', rate:0, amt:0, blank:true}); }
  const numC=parseInt((document.getElementById('od-companies')||{}).value,10)||1;
  const exC=Math.max(0,numC-inclC); if(exC>0){ const r=odPrice('ADDON_EXTRA_COMPANY'); lines.push({label:'Extra companies × '+exC, qty:exC, rate:r, amt:r*exC}); total+=r*exC; }
  // Extra users (beyond the plan's included count) charged per ROLE/category rate.
  const userRoles=Array.from(document.querySelectorAll('#od-users .od-user select')).map(s=>s.value);
  const extraRoles=userRoles.slice(inclU);
  const roleLbl={admin:'Admin',dataentry:'Data Entry',viewonly:'Viewer',auditor:'Auditor'};
  const rc={}; extraRoles.forEach(role=>{ rc[role]=(rc[role]||0)+1; });
  Object.keys(rc).forEach(role=>{ const n=rc[role]; const r=odPrice('USER_'+role.toUpperCase()); lines.push({label:'Extra user × '+n+' ('+(roleLbl[role]||role)+')', qty:n, rate:r, amt:r*n}); total+=r*n; });
  return { lines, total, inclC, inclU };
}
function odTotal(){
  const el=document.getElementById('od-total'); if(!el) return;
  odRenderPremium();
  const { total }=odBreakdown();
  el.innerHTML = (total ? 'Tentative total: ₹'+total.toLocaleString('en-IN')+' ' : '')+'<span style="color:var(--muted);font-weight:400;font-size:.85rem">(all premium free)</span>';
}

// Billing is a fixed 1 year, show the auto end date from the chosen start date.
function odBillingEnd(){
  const s=document.getElementById('od-billing-start'), out=document.getElementById('od-billing-end');
  if(!out) return;
  if(!s || !s.value){ out.textContent=''; return; }
  const d0=new Date(s.value+'T00:00:00'); const d1=new Date(d0); d1.setFullYear(d1.getFullYear()+1); d1.setDate(d1.getDate()-1);
  const f=x=>x.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});
  out.innerHTML='🗓 Valid till <b style="color:var(--g4)">'+f(d1)+'</b> &nbsp;(1 year)';
}

// When the plan changes, set the Users section to the plan's included user count.
function odPlanChanged(){
  const c=odSelCat(), ub=document.getElementById('od-users');
  if(c && ub){
    const inclU=Math.max(1, c.incl_users||1);
    const roles=['admin','dataentry','viewonly','auditor'];
    let html=''; for(let i=0;i<inclU;i++) html+=odUserRow(roles[Math.min(i,roles.length-1)]);
    ub.innerHTML=html;
  }
  // Default Number of Companies to the plan's included count (editable).
  const comp=document.getElementById('od-companies'), hint=document.getElementById('od-companies-hint');
  if(c && comp){ const inclC=Math.max(1, c.incl_companies||1); comp.value=inclC; if(hint) hint.innerHTML='Plan includes <b style="color:var(--g4)">'+inclC+'</b>, add more if needed (extra charged per price list).'; }
  const ob=document.getElementById('od-offer'); if(ob){ if(odOfferVal()>0){ ob.textContent='🎁 '+odOfferNote(); ob.style.display='block'; } else { ob.style.display='none'; } }
  odTotal();
}

async function loadPlansFeatures(){
  const cat = document.getElementById('od-cat'), feat = document.getElementById('od-feat');
  if(!cat) return;
  const ub = document.getElementById('od-users'); if(ub && !ub.children.length){ ub.innerHTML = odUserRow('admin'); }
  try {
    const res = await fetch(RRFINEAPP_API + '/public/plans-features', { headers: { 'x-api-key': RRFINEAPP_PUBLIC_KEY, 'Accept':'application/json' } });
    const d = await res.json().catch(()=>({}));
    OD.cats = d.categories||[]; OD.prices = d.prices||[]; OD.feats = d.premiumFeatures||[]; OD.userRates = d.userRates||{};
    OD.offer = d.offer||{eligible:true,value:10000}; OD.terms = d.terms||''; OD.note = d.activation_note||''; OD.company = d.company||null; OD.footer = d.footer||'';
    const cy = document.getElementById('od-country');
    if(cy && Array.isArray(d.countries) && d.countries.length){ cy.innerHTML = d.countries.map(c=>'<option value="'+c.code+'">'+odEsc(c.label)+'</option>').join(''); }
    // Partner list (from R.R. Sphere brokers), blank default, names only from the DB (none hardcoded).
    const pr = document.getElementById('od-partner');
    if(pr){ pr.innerHTML = '<option value="">No Partner</option>' + (Array.isArray(d.brokers)? d.brokers.map(b=>'<option value="'+odEsc(b.name)+'">'+odEsc(b.name)+'</option>').join(''):''); }
    cat.innerHTML = OD.cats.length ? OD.cats.map((c,i)=>
      '<label><input type="radio" name="od-cat" value="'+c.code+'"'+(i===0?' checked':'')+' onchange="odPlanChanged()"><span>'+odEsc(c.label)+(Number(c.rate)?(' · ₹'+Number(c.rate).toLocaleString('en-IN')+'/yr'):'')+' <em style="color:var(--muted);font-style:normal;font-size:.8rem">· '+(c.incl_companies||1)+' co / '+(c.incl_users||1)+' users included</em></span></label>'
    ).join('') : '<p style="color:#f87171">Could not load plans.</p>';
    // Offer banner (auto-selected free premium · worth ₹10,000 · activated within 48 hrs).
    const ob = document.getElementById('od-offer');
    if(ob){ if(odOfferVal()>0){ ob.textContent = '🎁 ' + odOfferNote(); ob.style.display = 'block'; } else { ob.style.display = 'none'; } }
    odRenderPremium();
    odPlanChanged();   // set Users to the selected plan's included count + total
    // Auto, incremental account/tenant code.
    try {
      const cr = await fetch(RRFINEAPP_API + '/public/next-account-code', { headers: { 'x-api-key': RRFINEAPP_PUBLIC_KEY, 'Accept':'application/json' } });
      const cd = await cr.json().catch(()=>({})); const ce = document.getElementById('od-code');
      if(ce && cd.code) ce.value = cd.code;
    } catch(e){}
  } catch(e){ cat.innerHTML = '<p style="color:#f87171">Could not load plans, try again or use the <a href="enquire.html">enquiry form</a>.</p>'; }
}

// Print a professional GREEN order summary (DRAFT, or FINAL when an order_no is given).
function printDraftOrder(orderNo){
  const v = id => (document.getElementById(id)?document.getElementById(id).value.trim():'');
  const cat = document.querySelector('input[name="od-cat"]:checked');
  if(!cat){ alert('Please choose a plan first.'); return; }
  const { lines, total, inclC, inclU } = odBreakdown();
  const c = odSelCat();
  const esc = odEsc;
  const inr = n => { const x = Number(n)||0; return x ? '₹'+x.toLocaleString('en-IN') : ''; };  // zero/blank → blank, no lone ₹
  const today = new Date().toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'});
  const addr = [v('od-add1'),v('od-add2'),[v('od-city'),v('od-pin')].filter(Boolean).join(' '),v('od-state')].filter(Boolean);
  // Billing = fixed 1 year from the chosen start date.
  const bStart = v('od-billing-start');
  let period = '1 year';
  if(bStart){ const d0=new Date(bStart+'T00:00:00'); const d1=new Date(d0); d1.setFullYear(d1.getFullYear()+1); d1.setDate(d1.getDate()-1);
    const f=x=>x.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}); period=f(d0)+' to '+f(d1)+' (1 year)'; }
  const numC = parseInt(v('od-companies'),10)||1;
  const odUsers = Array.from(document.querySelectorAll('#od-users .od-user')).map(r=>({ role:r.querySelector('select').value, name:(((r.querySelector('.od-uname')||{}).value)||'').trim(), login:(((r.querySelector('.od-ulogin')||{}).value)||'').trim() }));
  const nUsers = odUsers.length;
  const usersCard = odUsers.length ? '<div class="card"><div class="card-h">Users ('+odUsers.length+')</div><table><thead><tr><th>Name</th><th>Login (email / mobile)</th><th style="text-align:right">Role</th></tr></thead><tbody>'+odUsers.map(u=>'<tr><td style="padding:8px 10px;border-bottom:1px solid #e5e7eb">'+esc(u.name||'·')+'</td><td style="padding:8px 10px;border-bottom:1px solid #e5e7eb">'+esc(u.login||'·')+'</td><td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;text-align:right">'+esc(u.role)+'</td></tr>').join('')+'</tbody></table></div>' : '';
  const premNames = odPlanPremium().filter(f=>!f.coming_soon).map(f=>f.name);
  const TL = {'1_week':'Within 1 week','2_weeks':'Within 2 weeks','1_month':'Within 1 month','flexible':'Flexible / no rush'};
  const tl = (document.querySelector('input[name="od-timeline"]:checked')||{}).value;
  const pri = (document.querySelector('input[name="od-priority"]:checked')||{}).value;
  const custom = v('od-custom');
  const itemRows = lines.map(l=>
    '<tr><td>'+esc(l.label)+(l.note?'<div style="color:#555;font-size:8pt;margin-top:1px">'+esc(l.note)+'</div>':'')+'</td>'+
    '<td style="text-align:center">'+(l.blank?'':l.qty)+'</td>'+
    '<td style="text-align:right;white-space:nowrap;font-weight:600">'+(l.blank?'':(l.amt?inr(l.amt):''))+'</td></tr>').join('');
  const termsBox = OD.terms ?
    '<div class="card"><div class="card-h">Terms &amp; Conditions</div><div class="addr" style="white-space:pre-wrap;color:#374151;font-size:12px">'+esc(OD.terms)+'</div></div>' : '';
  const customBox = custom ?
    '<div class="card"><div class="card-h">🛠 Custom / additional requirement</div><div class="addr" style="font-size:13px">'+
      esc(custom)+'<div style="color:#6b7280;font-size:12px;margin-top:8px">⏱ Timeline: <b>'+esc(TL[tl]||'·')+'</b>'+(v('od-timeline-notes')?' ('+esc(v('od-timeline-notes'))+')':'')+
      ' &nbsp;·&nbsp; Priority: <b>'+(pri==='now'?'Need it now':pri==='next_update'?'Future update is fine':'·')+'</b></div></div></div>' : '';
  const docTitle = orderNo ? 'ORDER CONFIRMATION' : 'DRAFT ORDER';
  const html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>'+docTitle+', RRFinEApp</title><style>'+
    '@page{margin:0}'+
    '*{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;color:#000;background:#fff;max-width:800px;margin:0 auto;padding:8mm}'+
    '.doc{border:2px solid #000}'+
    '.hd{display:grid;grid-template-columns:1fr auto;border-bottom:2px solid #000}'+
    '.hd-l{padding:8px 10px;border-right:1px solid #000}.hd-l .nm{font-size:15pt;font-weight:900;line-height:1.2}.hd-l .ad{font-size:9pt;margin-top:2px}'+
    '.hd-r{padding:8px 12px;text-align:center;min-width:200px;display:flex;flex-direction:column;justify-content:center;align-items:center}'+
    '.hd-r .tt{font-size:13pt;font-weight:900;letter-spacing:2px;border-bottom:2px solid #14532d;color:#14532d;padding-bottom:4px;margin-bottom:5px;width:100%}.hd-r .rf{font-size:8.5pt;color:#444}'+
    '.offer{background:#ecfdf5;border-bottom:1px solid #000;padding:6px 10px;color:#166534;font-size:9pt;font-weight:700}'+
    '.two{display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid #000}.two>div{padding:6px 9px}.two>div:first-child{border-right:1px solid #000}'+
    '.sec-h{font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid #ccc;padding-bottom:2px;margin-bottom:3px}.row{font-size:9.5pt;line-height:1.5}'+
    '.band{background:#e8e8e8;border-bottom:1px solid #000;padding:4px 10px;font-size:8.5pt;font-weight:700;text-transform:uppercase;letter-spacing:.5px}'+
    '.pad{padding:6px 10px;font-size:9.5pt;line-height:1.55;border-bottom:1px solid #000}'+
    'table{width:100%;border-collapse:collapse;font-size:9pt}th{border:1px solid #000;background:#e8e8e8;padding:4px 6px;font-size:8.5pt;font-weight:700;text-align:left}td{border:1px solid #000;padding:4px 6px;font-size:9pt}.tot td{background:#f0f0f0;font-weight:700}'+
    '.ft{border-top:2px solid #16a34a;background:#f0fdf4;padding:6px 10px;display:flex;justify-content:space-between;align-items:center;font-size:8.5pt;font-weight:700;color:#14532d;gap:8px}.ft .r{font-weight:600;color:#374151}'+
    '.btns{margin-top:14px;text-align:center}.pbtn{padding:9px 26px;background:#16a34a;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600}'+
    '.paper-love{background:#ecfdf5;border:1px solid #a7f3d0;color:#166534;border-radius:8px;padding:8px 12px;margin:0 0 12px;font-size:11px;text-align:center;line-height:1.5}'+
    '@media print{.btns{display:none}.paper-love{display:none}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body>'+
    '<div class="paper-love">🌿 A gentle note, with love: if you can, please share this by Email or WhatsApp instead of printing. Every sheet you save is a little love for our planet. 💚 <b>Tech for People &amp; Planet</b></div>'+
    '<div class="doc">'+
      '<div class="hd"><div class="hd-l"><div class="nm">'+esc((OD.company&&OD.company.name)||'R.R. Sphere INDIA')+'</div>'+
        ((OD.company&&OD.company.address)?'<div class="ad">'+esc(OD.company.address)+'</div>':'')+
        ((OD.company&&OD.company.state_pin)?'<div class="ad">'+esc(OD.company.state_pin)+'</div>':'')+
        ((OD.company&&(OD.company.phone||OD.company.email))?'<div class="ad">'+(OD.company.phone?'Ph: '+esc(OD.company.phone):'')+((OD.company.phone&&OD.company.email)?' &nbsp;·&nbsp; ':'')+(OD.company.email?'Email: '+esc(OD.company.email):'')+'</div>':'')+
        '</div>'+
        '<div class="hd-r"><div class="tt">'+docTitle+'</div><div class="rf">'+(orderNo?('Ref: '+esc(orderNo)):'Not a final invoice')+'<br>'+today+'</div></div></div>'+
      (odOfferVal()>0?'<div class="offer">🎁 '+esc(odOfferNote())+'</div>':'')+
      '<div class="two"><div><div class="sec-h">Account / Tenant (Bill To)</div><div class="row"><b>'+esc(v('od-name'))+'</b> ('+esc(v('od-code'))+')'+(v('od-company')?'<br>'+esc(v('od-company')):'')+'<br>'+esc(addr.join(', '))+'<br>'+esc(v('od-email'))+(v('od-phone')?' · Ph: '+esc(v('od-phone')):'')+'</div></div>'+
        '<div><div class="sec-h">Order Details</div><div class="row"><b>Plan:</b> '+esc(c?c.label:cat.value)+'<br><b>Billing:</b> '+esc(period)+'<br><b>Companies:</b> '+numC+' (incl '+inclC+') &nbsp; <b>Users:</b> '+nUsers+' (incl '+inclU+')</div></div></div>'+
      '<div class="band">Premium features included</div><div class="pad">'+(premNames.length?esc(premNames.join(', ')):'·')+'</div>'+
      (odUsers.length?'<div class="band">Users ('+odUsers.length+')</div><table><thead><tr><th>Name</th><th>Login (email / mobile)</th><th style="text-align:center">Role</th></tr></thead><tbody>'+odUsers.map(u=>'<tr><td>'+esc(u.name||'·')+'</td><td>'+esc(u.login||'·')+'</td><td style="text-align:center">'+esc(u.role)+'</td></tr>').join('')+'</tbody></table>':'')+
      '<div class="band">Order details</div><table><thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Amount</th></tr></thead><tbody>'+itemRows+
        '<tr class="tot"><td colspan="2" style="text-align:right">Subtotal</td><td style="text-align:right">'+(total?inr(total):'')+'</td></tr>'+
        '<tr class="tot"><td colspan="2" style="text-align:right;font-size:10pt">Order Total</td><td style="text-align:right;font-size:10pt">'+(total?inr(total)+'*':'')+'</td></tr></tbody></table>'+
      (OD.terms?'<div class="band">Terms &amp; Conditions</div><div class="pad" style="white-space:pre-wrap;font-size:8.5pt">'+esc(OD.terms)+'</div>':'')+
      (custom?'<div class="band">Custom / additional requirement</div><div class="pad">'+esc(custom)+'</div>':'')+
      ((OD.company&&(OD.company.bank||OD.company.upi_id))?(function(){
        var bk=OD.company.bank, upi=OD.company.upi_id, nm=(OD.company.name||'R.R. Sphere INDIA');
        var qr = upi?'<img src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&qzone=1&data='+encodeURIComponent('upi://pay?pa='+upi+'&pn='+nm)+'" width="112" height="112" alt="UPI QR" style="display:block">':'';
        return '<div class="band">Payment · Bank Details</div>'+
          '<div style="display:grid;grid-template-columns:1fr auto">'+
            '<div class="pad" style="border-right:'+(qr?'1px solid #ccc':'none')+'">'+
              (bk?'<b>Bank:</b> '+esc(bk.name||'')+'<br><b>A/C No:</b> '+esc(bk.account_no||'')+'<br><b>IFSC:</b> '+esc(bk.ifsc||'')+'<br><b>Branch:</b> '+esc(bk.branch||''):'')+
              (upi?(bk?'<br>':'')+'<b>UPI:</b> '+esc(upi):'')+
            '</div>'+
            (qr?'<div class="pad" style="text-align:center">'+qr+'<div style="font-size:7.5pt;color:#444;margin-top:1px">Scan to pay</div></div>':'')+
          '</div>';
      })():'')+
      '<div class="pad" style="font-size:8pt;color:#444;border-bottom:none">*Tentative, prices may change. Final pricing and any discount are confirmed by R.R. Sphere INDIA after you place the order.</div>'+
      '<div class="ft"><span>'+esc(OD.footer||'RRFinEApp | R.R. Sphere INDIA | https://rrsindia.co.in | https://fin.rrsindia.co.in')+'</span><span class="r">This is a computer generated '+(orderNo?'order':'draft order')+'.</span></div>'+
    '</div>'+
    '<div class="btns"><button class="pbtn" onclick="window.print()">🖨 Print this order</button></div>'+
    '</body></html>';
  const w = window.open('', '_blank'); if(!w){ alert('Please allow popups to print the order.'); return; }
  w.document.write(html); w.document.close(); w.focus(); setTimeout(()=>w.print(), 800);
}

async function submitOrder(){
  const v = id => (document.getElementById(id)?document.getElementById(id).value.trim():'');
  const req = [['od-name','Account/Tenant Name'],['od-email','Email'],['od-phone','Phone'],['od-add1','Address Line 1'],['od-city','City'],['od-pin','PIN'],['od-state','State']];
  for(const [id,lbl] of req){ if(!v(id)){ alert('Please fill: '+lbl); document.getElementById(id)?.focus(); return; } }
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v('od-email'))){ alert('Please enter a valid email.'); return; }
  if((v('od-phone').replace(/\D/g,'')).length < 10){ alert('Please enter a valid phone / WhatsApp number with country code.'); return; }
  const catEl = document.querySelector('input[name="od-cat"]:checked');
  if(!catEl){ alert('Please choose a plan (Tenant Category).'); return; }
  const bStart = v('od-billing-start');
  if(!bStart){ alert('Please select the billing start date.'); return; }
  const users = Array.from(document.querySelectorAll('#od-users .od-user')).map(r=>({
    role:r.querySelector('select').value,
    name:(((r.querySelector('.od-uname')||{}).value)||'').trim(),
    login:(((r.querySelector('.od-ulogin')||{}).value)||'').trim()
  }));
  if(!users.length){ alert('Please add at least one user.'); return; }
  if(!users.some(u=>u.role==='admin')){ alert('At least one Admin user is required.'); return; }
  for(const u of users){
    if(!u.name){ alert('Enter a name for each user.'); return; }
    if(!u.login){ alert('Enter an email or mobile (login) for each user, this is their username.'); return; }
  }

  const btn = document.querySelector('.od-submit'); const orig = btn.textContent; btn.textContent='Placing…'; btn.disabled=true;
  try {
    const res = await fetch(RRFINEAPP_API + '/public/submit-order', {
      method:'POST', headers:{ 'Content-Type':'application/json','Accept':'application/json','x-api-key':RRFINEAPP_PUBLIC_KEY },
      body: JSON.stringify({
        account_code: v('od-code'), customer_name: v('od-name'), customer_company: v('od-company'),
        num_companies: parseInt(v('od-companies'),10)||1,
        billing_from: bStart,
        customer_email: v('od-email'),
        customer_phone: v('od-phone'), country: v('od-country')||'IN', gstin: v('od-gstin'),
        broker: v('od-partner')||'',
        address1: v('od-add1'), address2: v('od-add2'), city: v('od-city'), pin_code: v('od-pin'),
        state_code: v('od-state').slice(0,2).toUpperCase(),
        tenant_category: catEl.value, users, notes: v('od-notes'),
        custom_requirement: v('od-custom'),
        dev_timeline: (document.querySelector('input[name="od-timeline"]:checked')||{}).value || '',
        dev_timeline_notes: v('od-timeline-notes'),
        dev_priority: (document.querySelector('input[name="od-priority"]:checked')||{}).value || ''
      })
    });
    const d = await res.json().catch(()=>({}));
    if(res.ok && d.ok){
      const s = document.getElementById('od-success');
      s.innerHTML = '✅ Order received! Your reference is <strong>'+d.order_no+'</strong>. Your account will be opened and you’ll be <b>live within 48 hours</b>, we’ll confirm pricing and send your invoice. <b>All premium features are included free</b>'+(odOfferVal()>0?(' (worth ₹'+odOfferVal().toLocaleString('en-IN')+')'):'')+'. '+
        '<button type="button" class="btn-outline" style="margin-top:8px;font-size:.82rem;padding:6px 14px" onclick="printDraftOrder(\''+String(d.order_no).replace(/[^A-Za-z0-9\-]/g,'')+'\')">🖨 Print your order</button><br>Track it on the <a href="portal.html">Customer Login</a> page.' + SPAM_NOTE;
      s.style.display='block'; btn.style.display='none';
    } else { alert('Could not place the order.'+(d.error?'\n\nReason: '+d.error:'')); btn.textContent=orig; btn.disabled=false; }
  } catch(e){ alert('Network issue, please try again.'); btn.textContent=orig; btn.disabled=false; }
}
function odResetForm(){
  ['od-code','od-name','od-company','od-email','od-phone','od-gstin','od-add1','od-add2','od-city','od-pin','od-state','od-notes','od-custom','od-timeline-notes','od-billing-start'].forEach(id=>{ const e=document.getElementById(id); if(e) e.value=''; });
  const comp=document.getElementById('od-companies'); if(comp) comp.value='1';
  const ub=document.getElementById('od-users'); if(ub) ub.innerHTML = odUserRow('admin');
  if(typeof odTotal==='function') odTotal();
}
if(document.getElementById('od-cat')) loadPlansFeatures();

// ── Track tickets from RRFinEApp ─────────────────────────────────────────────
// Email only  → list every ticket for that email + status.
// Email + no  → open that one ticket with its full reply thread.
const TRK_LABELS = { OPEN:'🟦 Open', IN_PROGRESS:'🟨 In Progress', WAITING:'🟪 Waiting', RESOLVED:'🟩 Resolved', CLOSED:'⬜ Closed' };
const trkApi = (p) => fetch(RRFINEAPP_API + '/public/' + p, { headers: { 'x-api-key': RRFINEAPP_PUBLIC_KEY, 'Accept': 'application/json' } });

async function trackTicket() {
  const no    = document.getElementById('trk-no').value.trim();
  const email = document.getElementById('trk-email').value.trim();
  const box   = document.getElementById('trk-result');
  if(!email) { alert('Please enter the email you used to raise the ticket.'); return; }
  box.style.display = 'block';
  box.innerHTML = '<p style="color:var(--muted)">Checking…</p>';
  try {
    if(no) { await trkRenderOne(no, email, box); return; }
    // List all tickets for this email.
    const res = await trkApi('my-tickets?email=' + encodeURIComponent(email));
    const list = await res.json().catch(() => ([]));
    if(!res.ok) { box.innerHTML = '<p style="color:#f87171">' + (list.error || 'Could not look that up.') + '</p>'; return; }
    if(!list.length) { box.innerHTML = '<p style="color:var(--muted)">No tickets found for ' + email.replace(/</g,'&lt;') + '. Check the spelling, or raise one above.</p>'; return; }
    box.innerHTML =
      '<p style="color:var(--muted);font-size:.82rem;margin-bottom:10px">' + list.length + ' ticket(s) for ' + email.replace(/</g,'&lt;') + ', click one to see replies.</p>' +
      list.map(t =>
        '<div onclick="trkOpen(\'' + t.ticket_no + '\',\'' + email.replace(/'/g,'') + '\')" style="cursor:pointer;padding:12px 14px;border:1px solid var(--border);border-radius:10px;background:var(--card-bg);margin-bottom:8px">' +
          '<div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:6px">' +
            '<strong style="color:var(--white)">' + t.ticket_no + '</strong>' +
            '<span style="color:var(--white)">' + (TRK_LABELS[t.status] || t.status) + '</span>' +
          '</div>' +
          '<div style="color:var(--muted);font-size:.85rem;margin-top:4px">' + (t.subject || '').replace(/</g,'&lt;') + '</div>' +
          '<div style="color:var(--muted);font-size:.72rem;margin-top:4px">Updated ' + new Date(t.updated_at).toLocaleString() + '</div>' +
        '</div>'
      ).join('');
  } catch(e) {
    box.innerHTML = '<p style="color:#f87171">Network issue, please try again.</p>';
  }
}

// Open one ticket (called from a list row).
async function trkOpen(no, email) {
  document.getElementById('trk-no').value = no;
  const box = document.getElementById('trk-result');
  box.innerHTML = '<p style="color:var(--muted)">Loading…</p>';
  try { await trkRenderOne(no, email, box); } catch(e) { box.innerHTML = '<p style="color:#f87171">Network issue, please try again.</p>'; }
}

async function trkRenderOne(no, email, box) {
  const res = await trkApi('ticket-status?ticket_no=' + encodeURIComponent(no) + '&email=' + encodeURIComponent(email));
  const d = await res.json().catch(() => ({}));
  if(!res.ok) { box.innerHTML = '<p style="color:#f87171">' + (d.error || 'Ticket not found. Check the number and email.') + '</p>'; return; }
  const msgs = (d.messages || []).map(m => {
    const support = m.sender_type === 'superadmin';
    return '<div style="margin:8px 0;padding:8px 12px;border-radius:10px;font-size:.85rem;' +
      (support ? 'background:rgba(34,197,94,0.12);border:1px solid var(--border)' : 'background:var(--darker);border:1px solid var(--border)') + '">' +
      '<div style="font-size:.72rem;color:var(--muted);margin-bottom:3px">' + (support ? '🛟 Support' : '👤 You') +
      ' · ' + new Date(m.created_at).toLocaleString() + '</div>' +
      (m.body || '').replace(/</g,'&lt;') + '</div>';
  }).join('');
  box.innerHTML =
    '<div style="padding:14px;border:1px solid var(--border);border-radius:12px;background:var(--card-bg)">' +
      '<div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:6px">' +
        '<strong style="color:var(--white)">' + d.ticket_no + '</strong>' +
        '<span style="color:var(--white)">' + (TRK_LABELS[d.status] || d.status) + '</span>' +
      '</div>' +
      '<div style="color:var(--muted);font-size:.85rem;margin-top:4px">' + (d.subject || '').replace(/</g,'&lt;') + '</div>' +
      (msgs ? '<div style="margin-top:12px">' + msgs + '</div>' : '<div style="color:var(--muted);font-size:.8rem;margin-top:10px">No replies yet.</div>') +
    '</div>';
}

// ════════════ AI ASSISTANT WIDGET ════════════
(function(){
  const KB = [
    {k:['price','pricing','cost','fee','charge','how much','rupee','plan','rate','expensive'],
     a:"Our RRFinEApp pricing plans are launching shortly! 🏷️ In the meantime we're happy to share current pricing and a personalised quote.<br><br>👉 <a href='enquire.html'>Request a quote</a>"},
    {k:['demo','trial','try','test','see it','show me','free demo'],
     a:"You can get a free demo of RRFinEApp! 🎓 We'll walk you through it the same day.<br><br>👉 <a href='enquire.html'>Book a free demo</a> or open the app at <a href='https://fin.rrsindia.co.in' target='_blank'>fin.rrsindia.co.in</a>"},
    {k:['what is','about rrfin','about the app','rrfineapp','tell me about','what does','rrfine'],
     a:"RRFinEApp is a cloud-based accounting app for Indian businesses, like Tally but in the cloud, like D365 but simple. 📊 Full accounting, GST invoicing, final accounts, stock & multi-company.<br><br>Want to <a href='finapp.html'>see all features</a>?"},
    {k:['gst','tax','gstr','invoice','invoicing','cgst','sgst','igst','return'],
     a:"Yes! RRFinEApp is fully GST-compliant 🧾, GST Sales & Purchase invoices with auto CGST/SGST/IGST, plus GSTR-1 & GSTR-3B ready reports you can export straight to the portal."},
    {k:['tally','migrate','switch from','shift'],
     a:"RRFinEApp feels right at home for Tally users! ⌨️ Keyboard-first (F2 New, F5 Refresh, Esc Back) and Dr/Cr entry, just like Tally, but cloud-based so you can work from anywhere."},
    {k:['cloud','install','download','setup','anywhere','device','browser'],
     a:"RRFinEApp is 100% cloud-based ☁️, no installation. Log in from any browser on any device, and your data backs up to Google Drive daily."},
    {k:['safe','secure','security','backup','data','audit','trust'],
     a:"Your data is very safe 🔐, daily automated Google Drive backups, immutable posted entries (no silent edits), full audit trails, and role-based access control."},
    {k:['feature','what can','module','report','ledger','balance sheet','profit','loss','stock','inventory','trial balance','day book'],
     a:"RRFinEApp includes 📒 full accounting (Ledger, Trial Balance, Day Book), 🧾 GST invoicing, 📊 Final Accounts (P&L, Balance Sheet, Ageing), 📦 Stock & Inventory and 🏢 multi-company support.<br><br>Full list on the <a href='finapp.html'>RRFinEApp page</a>."},
    {k:['issue','problem','bug','error','not working','complaint','broken','crash','stuck','hang','wrong','fix','trouble','help me','support','report'],
     a:"Sorry you're facing trouble! 🛠️ You can report the issue directly to our support team and we'll look into it fast.<br><br>👉 <a href='support.html'>Report an Issue</a>"},
    {k:['coaching','tuition','class','study','student','maths','math','school','child','kid','board'],
     a:"R.R. Coaching Classes offers expert tuition from Nursery to Class 10, all boards & subjects 📚, including our signature 'Maths Made Easy' program!<br><br>👉 <a href='coaching.html'>Learn about coaching</a>"},
    {k:['service','software','development','website','ai solution','what do you do','consulting','erp','data analytics'],
     a:"We offer custom software development, AI-powered solutions, cloud & DevOps, data analytics, IT training and ERP integrations 💻<br><br>👉 <a href='services.html'>Explore our services</a>"},
    {k:['contact','call','phone','email','reach','talk','number','whatsapp','address','location','where'],
     a:"Reach us anytime! 📞<br>📧 <a href='mailto:rrsphere@rrsindia.co.in'>rrsphere@rrsindia.co.in</a><br>📍 Amritsar, Punjab, <span class='in-hl'>India</span>"},
    {k:['hi','hello','hey','namaste','good morning','good evening','hii','helo','hlo'],
     a:"Hello! 👋 I'm the AI Assistant. I can help with RRFinEApp features, pricing, demos, GST, coaching classes and more. What would you like to know?"},
    {k:['thank','thanks','thx','great','nice','okay','cool','good'],
     a:"You're welcome! 😊 Anything else I can help with? You can also <a href='enquire.html'>send an enquiry</a> anytime."},
    {k:['who are you','your name','what are you','are you human','bot','robot'],
     a:"I'm the AI Assistant, here to help you learn about R.R. Sphere INDIA, RRFinEApp and our coaching classes. Ask me anything!"},
    {k:['company','rr sphere','who','experience','about you','about us','history'],
     a:"R.R. Sphere INDIA is an IT & Learning company with 30+ years of expertise (since 1995), based in Amritsar 🇮🇳. We build cloud software, AI solutions and run coaching classes.<br><br>👉 <a href='about.html'>About us</a>"}
  ];
  const FALLBACK = "I'm not totally sure about that one 🤔, but our team would love to help!<br><br>👉 <a href='enquire.html'>send an enquiry</a> and we'll get right back to you.";
  const QUICK = ["▶ Product tour","💰 Pricing","🎓 Book a demo","📊 What is RRFinEApp?","🧾 GST features","📚 Coaching","📞 Contact"];

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
    // Default position: just to the RIGHT of the "R.R. Sphere INDIA" logo (its old
    // spot). The nav font is now smaller so the menu no longer reaches it. Draggable.
    const logo = document.querySelector('.nav-logo');
    const w = fab.offsetWidth || 60, h = fab.offsetHeight || 36;
    if(!logo){ fab.style.top='13px'; fab.style.left='300px'; fab.style.right='auto'; fab.style.bottom='auto'; return; }
    const r = logo.getBoundingClientRect();
    let top = r.top + (r.height - h)/2;
    let left = r.right + 12;
    top = Math.max(6, Math.min(window.innerHeight - h - 8, top));
    left = Math.max(8, Math.min(window.innerWidth - w - 8, left));
    fab.style.top = top+'px'; fab.style.left = left+'px';
    fab.style.right='auto'; fab.style.bottom='auto';
  }

  function buildAI(){
    // Vanilla FAB removed for the hybrid — the SHARED cloud Rova widget is the button now.
    if(false){
      const fab = document.createElement('button');
      fab.className = 'ai-fab'; fab.type = 'button';
      fab.title = 'Rova (Real One Virtual Assistant)  ·  Alt + R';
      fab.innerHTML = '<svg class="spark" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><defs><linearGradient id="boltg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8c860"/><stop offset="0.55" stop-color="#d6a830"/><stop offset="1" stop-color="#b8870f"/></linearGradient></defs><path d="M13 2L4.5 13.5H11l-1 8.5L18.5 10H12l1-8z" fill="url(#boltg)" stroke="#1c3508" stroke-width="1.8" stroke-linejoin="round"/></svg><span>AI</span>';
      document.body.appendChild(fab);

      // Always start next to "R.R. Sphere INDIA" on every page load (no memory)
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
          '<div class="ai-ava" title="Rova"><span class="ai-bolt" style="font-size:1.15rem">⚡</span></div>'+
          '<div class="ai-hd-txt"><h4>Rova</h4><p id="aiState">Online now</p></div>'+
          '<button class="ai-ico ai-speaker" type="button" title="Voice on / off" aria-label="Voice">🔇</button>'+
          '<button class="ai-ico ai-full" type="button" title="Full screen" aria-label="Full screen">⛶</button>'+
          '<button class="ai-close" type="button" aria-label="Close">&times;</button>'+
        '</div>'+
        '<div class="ai-chat-body" id="aiBody"></div>'+
        '<div class="ai-quick" id="aiQuick"></div>'+
        '<div class="ai-chat-input">'+
          '<input type="text" id="aiInput" placeholder="Ask Rova…">'+
          '<button class="ai-mic" type="button" title="Speak your question" aria-label="Speak">🎤</button>'+
          '<button class="ai-send" type="button" aria-label="Send"><svg viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg></button>'+
        '</div>';
      document.body.appendChild(chat);
      chat.querySelector('.ai-close').addEventListener('click', closeChat);
      chat.querySelector('.ai-send').addEventListener('click', sendMsg);
      chat.querySelector('#aiInput').addEventListener('keydown', function(e){ if(e.key==='Enter') sendMsg(); });
      var _spk = chat.querySelector('.ai-speaker'); if(_spk) _spk.addEventListener('click', function(){ toggleSpeaker(_spk); });
      var _full = chat.querySelector('.ai-full'); if(_full) _full.addEventListener('click', toggleFull);
      var _mic = chat.querySelector('.ai-mic');
      if(_mic){ if(micSupported()){ _mic.addEventListener('click', function(){ toggleMic(_mic); }); } else { _mic.style.display='none'; } }
    }
  }

  let greeted = false;
  function openChat(){
    document.querySelector('.ai-chat').classList.add('open');
    const fab = document.querySelector('.ai-fab'); if(fab) fab.classList.add('hidden');
    if(!greeted){
      greeted = true;
      botSay("Hi, I'm <b>Rova</b>, your R.R. Sphere assistant. 🌿 Ask me anything about RRFinEApp, pricing, a free demo, GST, the mobile app, or our coaching, and I'll help.");
      renderQuick();
    }
    setTimeout(function(){ const i=document.getElementById('aiInput'); if(i) i.focus(); }, 120);
  }
  function closeChat(){
    const c = document.querySelector('.ai-chat');
    c.classList.remove('open'); c.classList.remove('fullscreen');
    try{ stopSpeaking(); }catch(e){} try{ if(_rec) _rec.stop(); }catch(e){} setState('idle');
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
  // Rova answers with the SAME brain as the cloud/app (public endpoint /public/rova-ask,
  // grounded in the app + product knowledge + persona). Graceful offline/limit fallback to
  // the local canned answers so the widget never goes silent. Bomb-proof.
  function aiEscape(s){ var d=document.createElement('div'); d.textContent=String(s==null?'':s); return d.innerHTML; }
  function askRova(text){
    return fetch(RRFINEAPP_API + '/public/rova-ask', {
      method:'POST',
      headers:{ 'Content-Type':'application/json', 'Accept':'application/json', 'x-api-key':RRFINEAPP_PUBLIC_KEY },
      body: JSON.stringify({ question: text })
    }).then(function(r){ return r.json(); }).then(function(d){
      if(d && typeof d.answer === 'string' && d.answer.trim()){
        return { html: aiEscape(d.answer).replace(/\n/g, '<br>'), speak: d.answer };   // real Rova (limit msg too)
      }
      return { html: findAnswer(text), speak: null };         // skipped/error → canned fallback
    }).catch(function(){ return { html: findAnswer(text), speak: null }; });  // offline → canned fallback
  }
  function tourIntent(t){ return /\b(product tour|presentation|present the (deck|product|ppt|pdf)|walk ?through|show me around|give me a tour|take a tour|start (the )?tour|tour)\b/i.test(String(t||'')); }
  function respond(text){
    if(!_tour.on && tourIntent(text)){ startTour(); return; }                       // "present / tour" → Rova presents
    if(_tour.on && _tour.playing){ _tour.playing=false; updatePlayBtn(); stopSpeaking(); }  // a question pauses the tour
    typing(true); setState('thinking');
    askRova(text).then(function(res){
      typing(false); botSay(res.html);
      if(speakerOn && res.speak){ speakRova(res.speak); } else { setState('idle'); }
    }).catch(function(){ typing(false); setState('idle'); botSay(findAnswer(text)); });
  }

  // ── Rova state cue in the header (idle / listening / thinking / speaking) — mirrors cloud
  function setState(kind){
    var p = document.getElementById('aiState'); if(!p) return;
    var map = { idle:['Online now',''], listening:['listening…','state-listening'],
                thinking:['thinking…','state-thinking'], speaking:['speaking…','state-speaking'] };
    var m = map[kind] || map.idle;
    p.textContent = m[0];
    p.className = m[1];
    var ava = document.querySelector('.ai-chat .ai-ava');
    if(ava){ ava.className = 'ai-ava' + (m[1] ? ' ' + m[1] : ''); }
  }

  // ── Voice OUT — she speaks her answer in the REAL Rova cloud voice (public TTS endpoint,
  // Sulafat) so the website sounds exactly like the app; falls back to the device voice if
  // the cloud voice is unavailable or capped. Toggle in the header. Bomb-proof.
  var speakerOn = false, _audio = null;
  function speakRova(txt, onDone){
    var t = String(txt || '').slice(0, 800);
    if(!t){ setState('idle'); if(onDone) onDone(); return; }
    setState('speaking');
    try{
      fetch(RRFINEAPP_API + '/public/rova-speak', {
        method:'POST',
        headers:{ 'Content-Type':'application/json', 'Accept':'audio/wav', 'x-api-key':RRFINEAPP_PUBLIC_KEY },
        body: JSON.stringify({ text: t })
      }).then(function(r){ if(!r.ok) throw 0; return r.blob(); })
        .then(function(b){
          if(!b || !b.size) throw 0;
          stopSpeaking();
          var url = URL.createObjectURL(b);
          _audio = new Audio(url);
          _audio.onended = function(){ setState('idle'); try{ URL.revokeObjectURL(url); }catch(e){} if(onDone) onDone(); };
          _audio.onerror = function(){ deviceSpeak(t, onDone); };
          _audio.play().catch(function(){ deviceSpeak(t, onDone); });
        })
        .catch(function(){ deviceSpeak(t, onDone); });   // capped / unavailable → device voice
    }catch(e){ deviceSpeak(t, onDone); }
  }
  function deviceSpeak(txt, onDone){
    try{
      if(!('speechSynthesis' in window)){ setState('idle'); if(onDone) onDone(); return; }
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(String(txt).slice(0, 600));
      u.lang = 'en-IN'; u.rate = 1; u.pitch = 1;
      u.onend = function(){ setState('idle'); if(onDone) onDone(); };
      u.onerror = function(){ setState('idle'); if(onDone) onDone(); };
      window.speechSynthesis.speak(u);
    }catch(e){ setState('idle'); if(onDone) onDone(); }
  }
  function stopSpeaking(){
    try{ if(_audio){ _audio.pause(); _audio = null; } }catch(e){}
    try{ window.speechSynthesis.cancel(); }catch(e){}
  }
  function toggleSpeaker(btn){
    speakerOn = !speakerOn;
    if(btn){ btn.textContent = speakerOn ? '🔊' : '🔇'; btn.classList.toggle('on', speakerOn); }
    if(!speakerOn){ stopSpeaking(); setState('idle'); }
  }

  // ── Voice IN — tap the mic and just speak (browser recognizer). Transcribes → sends.
  var _rec = null, micOn = false;
  function micSupported(){ return typeof window!=='undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition); }
  function toggleMic(btn){
    if(micOn){ try{ if(_rec) _rec.stop(); }catch(e){} return; }
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition; if(!SR) return;
    stopSpeaking();
    var rec; try{ rec = new SR(); }catch(e){ return; }
    rec.lang='en-IN'; rec.interimResults=true; rec.continuous=false; rec.maxAlternatives=1;
    var finalText='';
    rec.onstart=function(){ micOn=true; if(btn) btn.classList.add('on'); setState('listening'); };
    rec.onresult=function(e){ var t=''; for(var i=e.resultIndex;i<e.results.length;i++) t+=e.results[i][0].transcript;
      finalText=t; var inp=document.getElementById('aiInput'); if(inp) inp.value=t; };
    rec.onerror=function(){};
    rec.onend=function(){ micOn=false; _rec=null; if(btn) btn.classList.remove('on'); setState('idle');
      var q=(finalText||'').trim(); var inp=document.getElementById('aiInput');
      if(q){ if(inp) inp.value=''; if(!speakerOn) speakerOn=true; userSay(q); respond(q); } };
    _rec=rec; try{ rec.start(); }catch(e){ micOn=false; if(btn) btn.classList.remove('on'); }
  }

  // ── Full-screen "stage" — bring Rova forward for demos (mirrors the cloud ⛶)
  function toggleFull(){ var c=document.querySelector('.ai-chat'); if(c) c.classList.toggle('fullscreen'); }

  // ── Rova PRESENTS the product deck — a full-screen, voice-narrated slide tour. She
  // walks each slide, auto-advances when she finishes speaking, and the visitor can ask
  // a question anytime (it pauses the tour and she answers from her knowledge). The slide
  // text mirrors the product deck; grounded Q&A comes from the same brain as the app.
  var ROVA_TOUR = [
    { t:'RRFinEApp — a quick tour', b:['Cloud accounting, GST, final accounts & stock','Like Tally or Busy, but in the cloud','Like D365 or SAP, but simple'],
      say:'Namaste, I am Rova. Let me give you a quick tour of RRFinEApp, R.R. Sphere’s cloud finance app. In about two minutes you will see what it does. You can ask me a question anytime.' },
    { t:'The cloud advantage', b:['No servers, no hardware, nothing to install','Run it from any phone or PC with a browser','Always the latest version, automatic daily backups'],
      say:'It runs entirely in the cloud, so there is no server, no hardware and nothing to install. Open it on any phone or PC. We host, secure, update and back it up for you every day.' },
    { t:'Dashboards & insights', b:['Live sales, purchase, GST & year progress','Premium sales and purchase dashboards','R.R. Sphere AI insights'],
      say:'Your dashboard is live: sales, purchases, GST and your financial-year progress at a glance, with premium dashboards and R.R. Sphere AI insights.' },
    { t:'Invoicing & GST', b:['Sales & purchase invoices','GST tax invoice with UPI scan-to-pay QR','GSTR-1, GSTR-3B, e-Way Bill & e-Invoice'],
      say:'Raise sales and purchase invoices, including GST tax invoices with a UPI scan-to-pay QR, and file GSTR-1 and 3B, with e-Way Bill and e-Invoice support.' },
    { t:'Final accounts', b:['Trial Balance, tallied','Trading and Profit & Loss','Balance Sheet & Cash Flow'],
      say:'Your final accounts are ready automatically: a tallied trial balance, trading and profit and loss, balance sheet and cash flow.' },
    { t:'Stock', b:['Valuation: FIFO, weighted average or last','Stock ageing','Item-wise registers'],
      say:'Track stock with valuation by FIFO, weighted average or last cost, plus stock ageing and item registers.' },
    { t:'Professionals Suite', b:['For CAs, accountants & tax professionals','All client books in one place','Access granted and approved securely'],
      say:'For professionals, the Professionals Suite puts all your client books in one place, with access that clients grant and approve, so it stays secure.' },
    { t:'Built to work your way', b:['Bomb-proof: no wrong entry can corrupt your books','One change updates every report, you never reconcile','Keyboard-first, blink-speed, easy for anyone'],
      say:'It is built to be bomb-proof: a wrong entry can never corrupt your books. One change flows to every report automatically, so you never reconcile. It is keyboard-first, fast, and easy even for a non-accountant.' },
    { t:'On your phone', b:['Android app live on Google Play','Your books in your pocket, fully in sync','Secure device login, ask Rova by voice'],
      say:'The Android app is live on Google Play. Your books are in your pocket, fully in sync, with secure device login, and you can ask me by voice right from your phone.' },
    { t:'Meet Rova, your assistant', b:['Open any screen or report by asking','Pull a ledger or item stock by name','Voice, guided tutorials, and answers from your books'],
      say:'And I am here to help. Ask me to open any screen or report, pull a ledger or an item’s stock by name, and I answer in my own voice, in your language.' },
    { t:'Get started', b:['Free 30-day demo, extendable on request','First 50 clients: all premium features free','Book a demo or start your free trial'],
      say:'Ready to try? Start a free thirty-day demo, and as one of the first fifty clients you get all premium features free. Ask me anything, or book a demo.' },
  ];
  var _tour = { on:false, i:0, playing:true };
  function startTour(){
    if(!document.querySelector('.ai-chat')) buildAI();
    openChat();
    var c=document.querySelector('.ai-chat'); if(c){ c.classList.add('fullscreen'); c.classList.add('touring'); }
    speakerOn = true; var spk=c&&c.querySelector('.ai-speaker'); if(spk){ spk.textContent='🔊'; spk.classList.add('on'); }
    _tour.on=true; _tour.i=0; _tour.playing=true;
    buildTourUI(); showTourSlide(0);
  }
  function buildTourUI(){
    var c=document.querySelector('.ai-chat'); if(!c || c.querySelector('#rovaTour')) return;
    var d=document.createElement('div'); d.id='rovaTour'; d.className='rova-tour';
    d.innerHTML =
      '<div class="rt-slide" id="rtSlide"></div>'+
      '<div class="rt-ctrl">'+
        '<button class="rt-btn" id="rtPrev" type="button">‹ Prev</button>'+
        '<button class="rt-btn rt-play" id="rtPlay" type="button">⏸ Pause</button>'+
        '<button class="rt-btn" id="rtNext" type="button">Next ›</button>'+
        '<span class="rt-prog" id="rtProg"></span>'+
        '<button class="rt-btn rt-exit" id="rtExit" type="button">✕ Exit tour</button>'+
      '</div>';
    c.insertBefore(d, c.querySelector('.ai-chat-body'));
    d.querySelector('#rtPrev').addEventListener('click', function(){ tourGo(_tour.i-1); });
    d.querySelector('#rtNext').addEventListener('click', function(){ tourGo(_tour.i+1); });
    d.querySelector('#rtPlay').addEventListener('click', tourToggle);
    d.querySelector('#rtExit').addEventListener('click', endTour);
  }
  function showTourSlide(i){
    _tour.i = Math.max(0, Math.min(ROVA_TOUR.length-1, i));
    _tour.gen = (_tour.gen||0)+1;                       // invalidates any in-flight narration callback
    var s=ROVA_TOUR[_tour.i], el=document.getElementById('rtSlide'); if(!el) return;
    el.innerHTML = '<h2>'+aiEscape(s.t)+'</h2><ul>'+ s.b.map(function(x){ return '<li>'+aiEscape(x)+'</li>'; }).join('') +'</ul>';
    var p=document.getElementById('rtProg'); if(p) p.textContent=(_tour.i+1)+' / '+ROVA_TOUR.length;
    if(_tour.playing) narrateTour(_tour.gen);
  }
  function narrateTour(gen){
    var s=ROVA_TOUR[_tour.i], shownAt=Date.now();
    speakRova(s.say, function(){
      if(!_tour.on || !_tour.playing || gen!==_tour.gen) return;
      var wait=Math.max(0, 3500-(Date.now()-shownAt));   // min dwell so it never blasts through if voice is off
      setTimeout(function(){
        if(!_tour.on || !_tour.playing || gen!==_tour.gen) return;
        if(_tour.i < ROVA_TOUR.length-1) tourGo(_tour.i+1);
        else { _tour.playing=false; updatePlayBtn(); setState('idle'); }
      }, wait);
    });
  }
  function tourGo(i){ stopSpeaking(); showTourSlide(i); }
  function tourToggle(){ _tour.playing=!_tour.playing; updatePlayBtn(); if(_tour.playing){ _tour.gen=(_tour.gen||0)+1; narrateTour(_tour.gen); } else stopSpeaking(); }
  function updatePlayBtn(){ var b=document.getElementById('rtPlay'); if(b) b.textContent=_tour.playing?'⏸ Pause':'▶ Play'; }
  function endTour(){
    _tour.on=false; stopSpeaking();
    var d=document.getElementById('rovaTour'); if(d) d.remove();
    var c=document.querySelector('.ai-chat'); if(c){ c.classList.remove('touring'); c.classList.remove('fullscreen'); }
    setState('idle');
    botSay("That's the tour! Ask me anything, or start a free 30-day demo, first 50 clients get all premium features free.");
  }
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
  // Let any on-page button start Rova's product tour (e.g. the hero "Take a tour with Rova").
  window.rovaStartTour = function(){ try{ if(!document.querySelector('.ai-chat')) buildAI(); startTour(); }catch(e){} };

  // Alt+R is handled by the shared cloud Rova widget now (vanilla shortcut removed for the hybrid).

  // Load the SHARED cloud Rova widget (base = cloud) as the primary chat / voice / panel.
  // The Product Tour + avatar-in-nav stay website-side (hybrid); buildAI now runs only on
  // demand from the tour (it builds the tour's panel; no vanilla FAB).
  try{
    var _rw = document.createElement('script');
    _rw.src = '/rova-widget.js?v=2'; _rw.async = true;
    _rw.onload = function(){ try{ if(window.Rova) window.Rova.init({ mode:'website' }); }catch(e){} };
    document.head.appendChild(_rw);
  }catch(e){}
})();

// ════════════ Render every whole-word "India" as larger "INDIA" ════════════
(function(){
  var SKIP = {SCRIPT:1, STYLE:1, NOSCRIPT:1, TEXTAREA:1, INPUT:1};
  var RE = /India(?![A-Za-z])/gi;   // whole word, any case, never matches "Indian"

  function process(root){
    if(!root) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function(node){
        if(!node.nodeValue || node.nodeValue.toLowerCase().indexOf('india') === -1) return NodeFilter.FILTER_REJECT;
        var p = node.parentNode;
        while(p){
          if(SKIP[p.nodeName]) return NodeFilter.FILTER_REJECT;
          if(p.classList && p.classList.contains('india-big')) return NodeFilter.FILTER_REJECT; // already done
          if(p === document.body) break;
          p = p.parentNode;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var targets = [], n;
    while((n = walker.nextNode())) targets.push(n);
    targets.forEach(function(node){
      var text = node.nodeValue, frag = document.createDocumentFragment();
      var last = 0, m, found = false;
      RE.lastIndex = 0;
      while((m = RE.exec(text))){
        found = true;
        if(m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
        var span = document.createElement('span');
        span.className = 'india-big';
        span.textContent = 'INDIA';
        frag.appendChild(span);
        last = m.index + m[0].length;
      }
      if(found){
        if(last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
        node.parentNode.replaceChild(frag, node);
      }
    });
  }

  function run(){
    process(document.body);
    // also re-process anything added later (e.g. AI chat messages), without infinite loops
    if(window.MutationObserver){
      var mo = new MutationObserver(function(muts){
        for(var i=0;i<muts.length;i++){
          var added = muts[i].addedNodes;
          for(var j=0;j<added.length;j++){
            var nd = added[j];
            if(nd.nodeType === 1 && !(nd.classList && nd.classList.contains('india-big'))) process(nd);
            else if(nd.nodeType === 3 && nd.parentNode) process(nd.parentNode);
          }
        }
      });
      mo.observe(document.body, {childList:true, subtree:true});
    }
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();

// ════════════ Show selected screenshot filename on support form ════════════
(function(){
  function init(){
    var inp = document.getElementById('tk-screenshot');
    var lbl = document.getElementById('tk-shot-name');
    if(!inp || !lbl) return;
    inp.addEventListener('change', function(){
      if(inp.files && inp.files.length){
        var f = inp.files[0];
        var mb = (f.size/1024/1024).toFixed(1);
        lbl.textContent = '📎 ' + f.name + ' (' + mb + ' MB)';
        lbl.style.display = 'block';
        if(f.size > 5*1024*1024){
          lbl.style.color = '#ef4444';
          lbl.textContent += ', too large (max 5MB)';
        } else {
          lbl.style.color = 'var(--g4)';
        }
      } else {
        lbl.style.display = 'none';
      }
    });
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

// ── Promo / announcement banner ─────────────────────────────────────────────
// Pulls the SAME SuperAdmin announcements the app uses (login_announcements via
// /public/login-page) and shows a highlighted strip at the top of every website
// page. One announcement (SuperAdmin → Announcements) → app login + dashboard +
// ── Homepage brand title + description from SuperAdmin (live, NO code deploy) ──
// company_title / company_desc are set in SuperAdmin → System Settings → Brand Titles.
// Applied at load to the HOMEPAGE ONLY (other pages keep their own titles so per-page SEO
// stays intact). Falls back to the static HTML title if the API is unreachable.
(function(){
  var p = location.pathname.replace(/\/+$/,'');
  var isHome = p === '' || /\/index\.html$/i.test(p);
  if (!isHome) return;
  try {
    fetch(RRFINEAPP_API + '/public/config', { headers:{ 'Accept':'application/json' } })
      .then(function(r){ return r.json(); })
      .then(function(c){
        if (c && c.company_title) document.title = c.company_title;
        if (c && c.company_desc) {
          var m = document.querySelector('meta[name="description"]');
          if (m) m.setAttribute('content', c.company_desc);
        }
      }).catch(function(){});
  } catch(e){}
})();

// the whole website. Dismissible per session.
(function(){
  function esc(s){ return String(s==null?'':s).replace(/[<>&]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;'}[c];}); }
  function render(a){
    if(!a || sessionStorage.getItem('promoDismiss_'+a.id)) return;
    var bar = document.createElement('div');
    bar.style.cssText = 'position:relative;z-index:50;padding:10px 42px 10px 18px;text-align:center;font-size:.9rem;font-weight:600;line-height:1.5;'+
      'background:'+(a.bg_color||'linear-gradient(90deg,#f59e0b,#16a34a)')+';color:'+(a.text_color||'#ffffff')+';box-shadow:0 2px 8px rgba(0,0,0,.2)';
    bar.innerHTML = (a.emoji?a.emoji+' ':'')+(a.tag?'<b style="text-transform:uppercase;letter-spacing:.5px">'+esc(a.tag)+'</b> · ':'')+
      '<b>'+esc(a.title||'')+'</b>'+(a.body?', '+esc(a.body):'');
    var x = document.createElement('button');
    x.innerHTML = '&times;'; x.setAttribute('aria-label','Dismiss');
    x.style.cssText = 'position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;color:inherit;font-size:1.35rem;cursor:pointer;line-height:1;opacity:.85';
    x.onclick = function(){ bar.remove(); try{ sessionStorage.setItem('promoDismiss_'+a.id,'1'); }catch(e){} };
    bar.appendChild(x);
    var host = document.querySelector('.page-wrapper') || document.querySelector('.page-hero');
    if(host){ host.insertBefore(bar, host.firstChild); }
    else { document.body.insertBefore(bar, (document.querySelector('nav')?document.querySelector('nav').nextSibling:document.body.firstChild)); }
  }
  function load(){
    try{
      fetch('https://fin.rrsindia.co.in/api/v1/public/login-page', { headers:{ 'x-api-key':'2a524909821fa4cdd07b96a173a02603479a7deca1aa0ef0', 'Accept':'application/json' } })
        .then(function(r){ return r.ok?r.json():null; })
        .then(function(d){ if(!d) return; var list=(d.festival_banners||[]).concat(d.app_highlights||[]); if(list.length) render(list[0]); })
        .catch(function(){});
    }catch(e){}
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', load); else load();
})();

// ── finapp.html, live pricing plans from the SuperAdmin price list ──────────
// Renders the plan cards from /public/plans-features (no hardcoded prices). If the
// list is empty or the request fails, the static "Coming Soon" fallback stays.
(function initFinappPricing(){
  function run(){
    var wrap = document.getElementById('finapp-pricing');
    if (!wrap) return;                                   // not the finapp page
    var fallback = document.getElementById('pricing-fallback');
    var inr = function(n){ var x = Number(n)||0; return x ? '₹' + x.toLocaleString('en-IN') : ''; };  // zero/blank → blank
    fetch(RRFINEAPP_API + '/public/plans-features', { headers:{ 'x-api-key':RRFINEAPP_PUBLIC_KEY, 'Accept':'application/json' } })
      .then(function(r){ return r.ok ? r.json() : Promise.reject(); })
      .then(function(d){
        var plans = (d && d.categories) || [];
        if (!plans.length) { wrap.removeAttribute('data-loading'); return; }   // keep fallback
        wrap.innerHTML = plans.map(function(p){
          var rate = Number(p.rate) || 0;
          var price = rate > 0
            ? inr(rate) + '<span style="font-size:.78rem;color:var(--muted);font-weight:500"> / year</span>'
            : '';
          var comps = p.incl_companies || 1, users = p.incl_users || 1;
          var free = p.free_value
            ? '<div style="margin-top:10px;font-size:.78rem;color:var(--g4);font-weight:600">★ Premium features free, worth ' + inr(p.free_value) + '</div>'
            : '';
          return '<div class="reveal" style="background:linear-gradient(135deg,rgba(10,61,31,0.7),rgba(26,138,71,0.18));border:1px solid var(--g3);border-radius:18px;padding:28px 22px;text-align:center;display:flex;flex-direction:column;align-items:center">'
            + '<div style="font-family:\'Rajdhani\',sans-serif;font-size:1.25rem;color:var(--white);font-weight:700;letter-spacing:.3px">' + (p.label||'') + '</div>'
            + (price ? '<div style="font-size:1.9rem;color:var(--g4);font-weight:800;margin:10px 0 6px">' + price + '</div>' : '')
            + '<div style="color:var(--muted);font-size:.85rem;line-height:1.9">'
            +   comps + ' compan' + (comps>1?'ies':'y') + '<br>' + users + ' user' + (users>1?'s':'') + ' included'
            + '</div>' + free
            + '<a href="order.html" class="btn-primary" style="margin-top:18px;display:inline-block">Order Now</a>'
            + '</div>';
        }).join('');
        wrap.removeAttribute('data-loading');
        if (fallback) fallback.style.display = 'none';
      })
      .catch(function(){ wrap.removeAttribute('data-loading'); });   // network fail → keep fallback
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
// ── resources.html, Web Resources online viewer (PPT/DOC/XLS/PDF) ────────────
// Reads the admin-managed, public resources from /public/web-resources and opens
// each in an online viewer (Microsoft Office Online for office files, direct for
// PDF). Present in a meeting by screen-sharing the viewer. ?r=<token> deep-links a
// link-only item.
(function initResources(){
  function esc(s){ return String(s==null?'':s).replace(/[<>&]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;'}[c];}); }
  function absUrl(u){ return (u && u.indexOf('http')===0) ? u : ('https://fin.rrsindia.co.in' + (u||'')); }
  function isPdf(r){ var u=absUrl(r.file_url).toLowerCase().split('?')[0]; return (r.doc_type==='pdf') || /\.pdf$/.test(u); }
  function viewerSrc(r){ var url=absUrl(r.file_url); return isPdf(r) ? url : ('https://view.officeapps.live.com/op/embed.aspx?src='+encodeURIComponent(url)); }
  var ICON={ppt:'📊',doc:'📄',xls:'📈',pdf:'📕',auto:'🗂️'};
  window.openResource=function(r){
    // PDFs: open in a new tab (native browser PDF viewer). Cross-origin iframing of
    // the file is blocked by X-Frame-Options at Cloudflare's edge, so the modal
    // iframe cannot show it. Office files still use the Office Online embed modal.
    if(isPdf(r)){ window.open(absUrl(r.file_url), '_blank', 'noopener'); return; }
    var t=document.getElementById('res-title'); if(t) t.textContent=(ICON[r.doc_type]||'🗂️')+'  '+r.title;
    var f=document.getElementById('res-iframe'); if(f) f.src=viewerSrc(r);
    var v=document.getElementById('res-viewer'); if(v) v.style.display='block';
    document.body.style.overflow='hidden';
  };
  window.closeResource=function(){
    var v=document.getElementById('res-viewer'); if(v) v.style.display='none';
    var f=document.getElementById('res-iframe'); if(f) f.src='';
    document.body.style.overflow='';
  };
  function card(r){
    var icon=ICON[r.doc_type]||'🗂️';
    var d=document.createElement('div');
    d.style.cssText='background:linear-gradient(135deg,rgba(10,61,31,0.7),rgba(26,138,71,0.18));border:1px solid var(--g3);border-radius:16px;padding:22px;cursor:pointer;transition:transform .2s,border-color .2s';
    d.onmouseover=function(){ d.style.transform='translateY(-3px)'; d.style.borderColor='var(--g4)'; };
    d.onmouseout=function(){ d.style.transform=''; d.style.borderColor=''; };
    d.innerHTML='<div style="font-size:2rem;margin-bottom:8px">'+icon+'</div>'+
      '<div style="font-family:\'Rajdhani\',sans-serif;font-weight:700;font-size:1.12rem;color:var(--white);margin-bottom:4px">'+esc(r.title)+'</div>'+
      (r.description?'<div style="color:var(--muted);font-size:.85rem;line-height:1.5;margin-bottom:10px">'+esc(r.description)+'</div>':'<div style="margin-bottom:10px"></div>')+
      (r.category?'<div style="font-size:.72rem;color:var(--g4);text-transform:uppercase;letter-spacing:.6px;margin-bottom:12px">'+esc(r.category)+'</div>':'')+
      '<span class="btn-primary" style="display:inline-block;font-size:.85rem">View &#9658;</span>';
    d.onclick=function(){ openResource(r); };
    return d;
  }
  function run(){
    var wrap=document.getElementById('resources-list'); if(!wrap) return;
    var empty=document.getElementById('resources-empty');
    document.addEventListener('keydown', function(e){ if(e.key==='Escape') closeResource(); });
    fetch(RRFINEAPP_API+'/public/web-resources', { headers:{ 'x-api-key':RRFINEAPP_PUBLIC_KEY, 'Accept':'application/json' } })
      .then(function(r){ return r.ok ? r.json() : Promise.reject(); })
      .then(function(list){
        wrap.innerHTML='';
        if(!list || !list.length){ wrap.style.display='none'; if(empty) empty.style.display='block'; return; }
        list.forEach(function(r){ wrap.appendChild(card(r)); });
        var tok=new URLSearchParams(location.search).get('r');
        if(tok){ fetch(RRFINEAPP_API+'/public/web-resource/'+encodeURIComponent(tok), { headers:{ 'x-api-key':RRFINEAPP_PUBLIC_KEY, 'Accept':'application/json' } })
          .then(function(x){ return x.ok ? x.json() : null; }).then(function(r){ if(r) openResource(r); }).catch(function(){}); }
      })
      .catch(function(){ wrap.innerHTML=''; wrap.style.display='none'; if(empty) empty.style.display='block'; });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', run); else run();
})();

// ── Footer "Follow Us" links, driven by SuperAdmin → Social Media Links ──────
// Single source of truth = system_config social_* (same as the app Login/Sidebar),
// exposed via /public/login-page. Blank value = hide that platform. On any error
// the static footer markup is left untouched (graceful).
(function(){
  // platform → emoji label; order defines display order. "Follow Us" set only
  // (email/website are not "follow" links and stay out of this column).
  var META = {
    facebook:  '📘 Facebook',
    instagram: '📸 Instagram',
    linkedin:  '💼 LinkedIn',
    youtube:   '▶️ YouTube',
    google:    '🌐 Google',
    whatsapp:  '💬 WhatsApp'
  };
  function href(platform, val){
    val = String(val||'').trim();
    if(!val) return '';
    if(platform==='whatsapp' && !/^https?:/i.test(val)){
      var d = val.replace(/\D/g,''); return d ? 'https://wa.me/'+d : '';
    }
    return /^https?:/i.test(val) ? val : 'https://'+val;
  }
  function findFollowCol(){
    var cols = document.querySelectorAll('.footer-col');
    for(var i=0;i<cols.length;i++){
      var h = cols[i].querySelector('h5');
      if(h && h.textContent.trim().toLowerCase()==='follow us') return cols[i];
    }
    return null;
  }
  function run(){
    var col = findFollowCol(); if(!col) return;
    fetch(RRFINEAPP_API+'/public/login-page', { headers:{ 'Accept':'application/json' } })
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(d){
        var s = d && d.social; if(!s) return;   // no data → keep static links
        var links = Object.keys(META)
          .filter(function(p){ return s[p] && String(s[p]).trim(); })
          .map(function(p){ var u = href(p, s[p]); return u ? '<a href="'+u+'" target="_blank" rel="noopener">'+META[p]+'</a>' : ''; })
          .filter(Boolean);
        if(!links.length) return;   // nothing configured → keep static links
        col.innerHTML = '<h5>Follow Us</h5>' + links.join('');
      })
      .catch(function(){ /* keep static footer links */ });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', run); else run();
})();

// ── New-device first-open counter, records the first time the website is opened
// on a device (and bumps repeats). Same source as the app; shown in SuperAdmin.
(function(){
  try {
    var id = localStorage.getItem('rr_device_id');
    if(!id){ id = 'd_'+Math.random().toString(36).slice(2)+Date.now().toString(36); localStorage.setItem('rr_device_id', id); }
    fetch(RRFINEAPP_API+'/public/device-open', {
      method:'POST', headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ device_id:id, source:'website' })
    }).catch(function(){});
  } catch(e){ /* ignore */ }
})();

// ── Our Vision page, founder bio from SuperAdmin → Founder / Vision Bio ───────
// Same source as the app Vision page (system_config founder_*, via /public/login-page).
// Only overwrites a field when it is configured (non-blank); otherwise the static
// HTML text is kept. Runs only on the vision page (where #v-name exists).
(function(){
  function run(){
    if(!document.getElementById('v-name')) return;   // not the vision page
    fetch(RRFINEAPP_API+'/public/login-page', { headers:{ 'Accept':'application/json' } })
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(d){
        var f = d && d.founder; if(!f) return;
        [['name','v-name'],['role','v-role'],['subtitle','v-subtitle'],
         ['tagline','v-tagline'],['bio1','v-bio1'],['bio2','v-bio2']].forEach(function(pair){
          var val = f[pair[0]] && String(f[pair[0]]).trim();
          var el  = document.getElementById(pair[1]);
          if(val && el) el.textContent = val;
        });
        // Optional hero banner image (the founder's LinkedIn banner), with a dark overlay.
        if(f.banner && String(f.banner).trim()){
          var hero = document.getElementById('v-hero');
          if(hero){
            hero.style.backgroundImage = 'linear-gradient(rgba(4,19,10,.55),rgba(4,19,10,.66)), url('+f.banner+')';
            hero.style.backgroundSize = 'cover';
            hero.style.backgroundPosition = 'center';
          }
        }
      })
      .catch(function(){ /* keep static bio */ });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', run); else run();
})();

// -- Founder personal social links on the Vision page (#v-social) --
// One-time fetch (no observer/watcher) of the founder's FB/Insta/X/LinkedIn from
// SuperAdmin (founder_* via /public/login-page); shows only the ones filled in.
(function(){
  function run(){
    var sw = document.getElementById('v-social');
    if(!sw) return;
    try{
      fetch('https://fin.rrsindia.co.in/api/v1/public/login-page', { headers:{ 'Accept':'application/json' } })
        .then(function(r){ return r.ok ? r.json() : null; })
        .then(function(d){
          var f = d && d.founder; if(!f) return;
          var items = [['facebook','Facebook','👍'],['instagram','Instagram','📸'],['x','X','✖'],['linkedin','LinkedIn','💼']];
          var html = '';
          items.forEach(function(it){
            var u = f[it[0]] && String(f[it[0]]).trim();
            if(u) html += '<a href="'+u+'" target="_blank" rel="noopener" title="'+it[1]+'" style="display:inline-flex;align-items:center;gap:6px;font-size:.8rem;font-weight:600;color:var(--g4);text-decoration:none;padding:5px 12px;background:rgba(34,197,94,0.10);border:1px solid var(--border);border-radius:20px">'+it[2]+' '+it[1]+'</a>';
          });
          sw.innerHTML = html;
        })
        .catch(function(){});
    }catch(e){}
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
;/* ROVA_AVATAR_BLOCK — Rova avatar (SuperAdmin-configured, shared with the APP).
   Same config-driven avatar as the app's ⚡AI button. Paints her photo over the ⚡
   mark on: the chat header (.ai-ava), the promo AI logo pill (.ai-logo), and the
   floating button (.ai-fab) — ONLY when SuperAdmin has enabled it AND the image
   loads; otherwise the ⚡AI mark stays exactly as-is. Self-contained; can't break the page. */
(function(){
  return;  // DISABLED: the shared cloud Rova widget is the single Rova presence now — no
           // more painting her face onto the promo/nav pills (removed the redundant bottom icon).
  // eslint-disable-next-line no-unreachable
  var API='https://fin.rrsindia.co.in/api/v1', HOST='https://fin.rrsindia.co.in', src='', SCALE=1, mo=null;
  // Replace the ⚡ mark inside `el` with a round avatar image, once (idempotent via data-rova).
  function paint(el, px){
    if(!el || el.getAttribute('data-rova')==='1' || !src) return;
    var img=new Image();
    img.onload=function(){
      if(el.getAttribute('data-rova')==='1') return;
      img.style.cssText='border-radius:50%;object-fit:cover;vertical-align:middle;'+
        (px ? ('width:'+px+'px;height:'+px+'px;display:inline-block') : 'width:100%;height:100%;display:block');
      img.alt='Rova'; img.className='rova-live'; el.innerHTML=''; el.appendChild(img); el.setAttribute('data-rova','1');  // breathe like the app
    };
    img.alt='Rova'; img.src=src;
  }
  function apply(){
    if(!src) return;
    paint(document.querySelector('.ai-ava'));                                  // chat-panel avatar (fills its circle)
    paint(document.querySelector('.ai-logo .ai-bolt'), Math.round(14*SCALE));  // promo "⚡AI" pill → [avatar]AI
    // floating button: swap the ⚡ svg for a small avatar, keep the "AI" label
    var fab=document.querySelector('.ai-fab'), spark=fab&&fab.querySelector('.spark'), fpx=Math.round(16*SCALE);
    if(spark && fab.getAttribute('data-rova')!=='1'){
      var f=new Image();
      f.onload=function(){ if(fab.getAttribute('data-rova')==='1')return;
        f.style.cssText='width:'+fpx+'px;height:'+fpx+'px;border-radius:50%;object-fit:cover;display:inline-block;vertical-align:middle';
        f.alt='Rova'; f.className='rova-live'; spark.replaceWith(f); fab.setAttribute('data-rova','1'); };
      f.alt='Rova'; f.src=src;
    }
  }
  try{
    fetch(API+'/public/rova-avatar',{headers:{'Accept':'application/json'}})
      .then(function(r){return r.json();})
      .then(function(d){
        if(!d||!d.enabled||!d.avatar) return;
        var a=d.avatar; src=a.image_sm||a.image_md||a.image_lg; if(!src) return;
        if(src.indexOf('http')!==0) src=HOST+src;
        SCALE=(typeof d.scale==='number'&&d.scale>0)?d.scale:1;
        apply();
        // the pill/button are injected after load, so re-apply as the DOM changes (then stop)
        if(window.MutationObserver){ mo=new MutationObserver(apply); mo.observe(document.body,{childList:true,subtree:true}); setTimeout(function(){ if(mo) mo.disconnect(); }, 12000); }
      }).catch(function(){});
  }catch(e){}
})();

;/* RRS_WHATSAPP_BUTTON — floating WhatsApp chat button (business line 7719728045).
   Self-contained: injects one fixed button on every page, sits above the promo
   bar, opens wa.me with a friendly pre-filled message. Cannot break the page. */
(function(){
  var NUM='917719728045', TXT='Hi R.R. Sphere INDIA, I would like to know more';
  function place(a){ a.style.bottom = (document.querySelector('.promo-bar') ? 74 : 22) + 'px'; }
  function mount(){
    try{
      if(document.getElementById('waFab')) return;
      var a=document.createElement('a');
      a.id='waFab';
      a.href='https://wa.me/'+NUM+'?text='+encodeURIComponent(TXT);
      a.target='_blank'; a.rel='noopener';
      a.title='Chat with us on WhatsApp';
      a.setAttribute('aria-label','Chat with us on WhatsApp');
      a.innerHTML='<svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true"><path fill="#fff" d="M16 3C8.8 3 3 8.8 3 16c0 2.3.6 4.5 1.7 6.4L3 29l6.8-1.8C11.6 28.4 13.8 29 16 29c7.2 0 13-5.8 13-13S23.2 3 16 3zm0 23.6c-2 0-3.9-.5-5.6-1.5l-.4-.2-4 1.1 1.1-3.9-.3-.4C5.7 20 5.2 18 5.2 16 5.2 10 10 5.2 16 5.2S26.8 10 26.8 16 22 26.6 16 26.6zm6-7.9c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7.1c-.3-.2-1.4-.5-2.6-1.6-1-.9-1.6-2-1.8-2.3s0-.5.1-.7l.5-.6c.2-.2.2-.3.3-.5s0-.4 0-.6-.7-1.7-1-2.3c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.7s1.2 3.1 1.4 3.3c.2.2 2.4 3.7 5.8 5.1.8.4 1.5.6 2 .7.8.3 1.6.2 2.2.1.7-.1 2-.8 2.3-1.6.3-.8.3-1.5.2-1.6-.1-.2-.3-.3-.6-.4z"/></svg>';
      a.style.cssText='position:fixed;right:20px;z-index:995;width:54px;height:54px;border-radius:50%;background:#25D366;box-shadow:0 6px 20px rgba(0,0,0,.28);display:flex;align-items:center;justify-content:center;text-decoration:none;transition:transform .18s';
      place(a);
      a.onmouseenter=function(){ a.style.transform='scale(1.08)'; };
      a.onmouseleave=function(){ a.style.transform='scale(1)'; };
      document.body.appendChild(a);
      setTimeout(function(){ place(a); }, 900);   // promo bar mounts a moment later
    }catch(e){}
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
