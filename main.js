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
    alert('Network issue — please check your connection and try again.');
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

  const btn = document.querySelector('.enq-submit');
  const originalText = btn.textContent;
  btn.textContent = 'Sending…';
  btn.disabled = true;

  try {
    const res = await fetch(RRFINEAPP_API + '/public/enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'x-api-key': RRFINEAPP_PUBLIC_KEY },
      body: JSON.stringify({ name, phone: contact, email, business: biz, plan_interest: plan, message: msg })
    });
    const data = await res.json();
    if(res.ok && data.ok) {
      const s = document.getElementById('enq-success');
      if (s) { s.style.display = 'block'; s.innerHTML = `✅ Thank you! Your enquiry reference is ${data.ref_no}. Our team will get back to you shortly.` + SPAM_NOTE; }
      btn.style.display = 'none';
    } else {
      alert(data.error || 'Sorry, something went wrong sending your enquiry. Please try WhatsApp or call us.');
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
// Web3Forms access key (legacy — feedback now posts to the RRFinEApp API below)
const WEB3FORMS_KEY = 'c06fa8d4-b67d-4cc3-9982-ad202da2d532';
const IMGBB_KEY = '96a92f3973c9b79d3b83aa5d19cee3d0';

// ── RRFinEApp own support API (no 3rd-party for tickets/screenshots) ─────────
// Tickets submit straight into the RRFinEApp database (single source of truth)
// and screenshots are hosted on our own server. PUBLIC key is a submit-only,
// publishable token (same posture as the Web3Forms key above).
const RRFINEAPP_API        = 'https://fin.rrsindia.co.in/api/v1';
// Highlighted reminder appended to every form's success message — our confirmation
// email may land in Spam/Junk, so prompt the user to check there.
const SPAM_NOTE = '<div style="margin-top:12px;background:rgba(245,158,11,.12);border:1px solid rgba(245,158,11,.55);border-radius:10px;padding:10px 12px;color:#f59e0b;font-size:.85rem;font-weight:600;line-height:1.5">📬 <b>Please also check your Spam / Junk folder</b> for our confirmation email. If you find it there, mark it &ldquo;Not spam&rdquo; so our replies reach your inbox.</div>';
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
    alert('Network issue — please check your connection or use the WhatsApp option below.');
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

  // screenshot (optional) — validate size client-side (server re-checks at 5MB)
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
        subject: `${type} — ${area}`,
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
    alert('Network issue — please check your connection or use the WhatsApp option below.');
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
function odPlanPremium(){ const c=odSelCat(); const plan=c?c.code:null;
  return OD.feats.filter(f=>{ const m=(f.min_plan||'all'); return (m==='all'||m===plan); }); }

// Render the "included free" premium list + a separate display-only upcoming window.
function odRenderPremium(){
  const feat=document.getElementById('od-feat'); if(!feat) return;
  const list=odPlanPremium();
  const now=list.filter(f=>!f.coming_soon), soon=list.filter(f=>f.coming_soon);
  let html='';
  if(now.length){
    html += '<div class="od-incl"><div class="od-incl-h">✓ All premium features included FREE with your plan'+(odOfferVal()>0?(' — worth ₹'+odOfferVal().toLocaleString('en-IN')):'')+'</div>'+
      now.map(f=>'<div class="od-incl-row"><span>'+(f.icon||'✨')+' '+odEsc(f.name)+'</span><span class="od-free">FREE</span></div>'+
        (f.description?'<div class="od-incl-d">'+odEsc(f.description)+'</div>':'')).join('')+
      '<div class="od-incl-note">Auto-selected for you — activated after your first user login, within 48 hours.</div></div>';
  } else { html += '<p style="color:var(--muted)">Premium features are included with your plan.</p>'; }
  if(soon.length){
    html += '<div class="od-soon"><div class="od-soon-h">★ Upcoming — coming soon</div>'+
      soon.map(f=>'<div class="od-soon-row"><b>'+(f.icon||'✨')+' '+odEsc(f.name)+'</b>'+(f.description?'<span> — '+odEsc(f.description)+'</span>':'')+'</div>').join('')+
      '<div class="od-incl-note">Preview only — not part of this order. We’ll let you know when these launch.</div></div>';
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
  if(prem.length){ lines.push({label:'Premium features ('+prem.length+') — all included', qty:'', rate:0, amt:0, blank:true}); }
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
  el.innerHTML = 'Tentative total: ₹'+total.toLocaleString('en-IN')+' <span style="color:var(--muted);font-weight:400;font-size:.85rem">(all premium free)</span>';
}

// Billing is a fixed 1 year — show the auto end date from the chosen start date.
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
  if(c && comp){ const inclC=Math.max(1, c.incl_companies||1); comp.value=inclC; if(hint) hint.innerHTML='Plan includes <b style="color:var(--g4)">'+inclC+'</b> — add more if needed (extra charged per price list).'; }
  const ob=document.getElementById('od-offer'); if(ob){ ob.textContent='🎁 '+odOfferNote(); ob.style.display='block'; }
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
    cat.innerHTML = OD.cats.length ? OD.cats.map((c,i)=>
      '<label><input type="radio" name="od-cat" value="'+c.code+'"'+(i===0?' checked':'')+' onchange="odPlanChanged()"><span>'+odEsc(c.label)+(c.rate?(' — ₹'+Number(c.rate).toLocaleString('en-IN')+'/yr'):'')+' <em style="color:var(--muted);font-style:normal;font-size:.8rem">· '+(c.incl_companies||1)+' co / '+(c.incl_users||1)+' users included</em></span></label>'
    ).join('') : '<p style="color:#f87171">Could not load plans.</p>';
    // Offer banner (auto-selected free premium · worth ₹10,000 · activated within 48 hrs).
    const ob = document.getElementById('od-offer');
    if(ob && OD.note){ ob.textContent = '🎁 ' + OD.note; ob.style.display = 'block'; }
    odRenderPremium();
    odPlanChanged();   // set Users to the selected plan's included count + total
    // Auto, incremental account/tenant code.
    try {
      const cr = await fetch(RRFINEAPP_API + '/public/next-account-code', { headers: { 'x-api-key': RRFINEAPP_PUBLIC_KEY, 'Accept':'application/json' } });
      const cd = await cr.json().catch(()=>({})); const ce = document.getElementById('od-code');
      if(ce && cd.code) ce.value = cd.code;
    } catch(e){}
  } catch(e){ cat.innerHTML = '<p style="color:#f87171">Could not load plans — try again or use the <a href="enquire.html">enquiry form</a>.</p>'; }
}

// Print a professional GREEN order summary (DRAFT, or FINAL when an order_no is given).
function printDraftOrder(orderNo){
  const v = id => (document.getElementById(id)?document.getElementById(id).value.trim():'');
  const cat = document.querySelector('input[name="od-cat"]:checked');
  if(!cat){ alert('Please choose a plan first.'); return; }
  const { lines, total, inclC, inclU } = odBreakdown();
  const c = odSelCat();
  const esc = odEsc;
  const inr = n => '₹'+Number(n||0).toLocaleString('en-IN');
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
  const usersCard = odUsers.length ? '<div class="card"><div class="card-h">Users ('+odUsers.length+')</div><table><thead><tr><th>Name</th><th>Login (email / mobile)</th><th style="text-align:right">Role</th></tr></thead><tbody>'+odUsers.map(u=>'<tr><td style="padding:8px 10px;border-bottom:1px solid #e5e7eb">'+esc(u.name||'—')+'</td><td style="padding:8px 10px;border-bottom:1px solid #e5e7eb">'+esc(u.login||'—')+'</td><td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;text-align:right">'+esc(u.role)+'</td></tr>').join('')+'</tbody></table></div>' : '';
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
      esc(custom)+'<div style="color:#6b7280;font-size:12px;margin-top:8px">⏱ Timeline: <b>'+esc(TL[tl]||'—')+'</b>'+(v('od-timeline-notes')?' ('+esc(v('od-timeline-notes'))+')':'')+
      ' &nbsp;·&nbsp; Priority: <b>'+(pri==='now'?'Need it now':pri==='next_update'?'Future update is fine':'—')+'</b></div></div></div>' : '';
  const docTitle = orderNo ? 'ORDER CONFIRMATION' : 'DRAFT ORDER';
  const html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>'+docTitle+' — RRFinEApp</title><style>'+
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
    '@media print{.btns{display:none}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body>'+
    '<div class="doc">'+
      '<div class="hd"><div class="hd-l"><div class="nm">'+esc((OD.company&&OD.company.name)||'R.R. Sphere INDIA')+'</div>'+
        ((OD.company&&OD.company.address)?'<div class="ad">'+esc(OD.company.address)+'</div>':'')+
        ((OD.company&&OD.company.state_pin)?'<div class="ad">'+esc(OD.company.state_pin)+'</div>':'')+
        ((OD.company&&(OD.company.phone||OD.company.email))?'<div class="ad">'+(OD.company.phone?'Ph: '+esc(OD.company.phone):'')+((OD.company.phone&&OD.company.email)?' &nbsp;·&nbsp; ':'')+(OD.company.email?'Email: '+esc(OD.company.email):'')+'</div>':'')+
        '</div>'+
        '<div class="hd-r"><div class="tt">'+docTitle+'</div><div class="rf">'+(orderNo?('Ref: '+esc(orderNo)):'Not a final invoice')+'<br>'+today+'</div></div></div>'+
      '<div class="offer">🎁 '+esc(odOfferNote())+'</div>'+
      '<div class="two"><div><div class="sec-h">Account / Tenant (Bill To)</div><div class="row"><b>'+esc(v('od-name'))+'</b> ('+esc(v('od-code'))+')'+(v('od-company')?'<br>'+esc(v('od-company')):'')+'<br>'+esc(addr.join(', '))+'<br>'+esc(v('od-email'))+(v('od-phone')?' · Ph: '+esc(v('od-phone')):'')+'</div></div>'+
        '<div><div class="sec-h">Order Details</div><div class="row"><b>Plan:</b> '+esc(c?c.label:cat.value)+'<br><b>Billing:</b> '+esc(period)+'<br><b>Companies:</b> '+numC+' (incl '+inclC+') &nbsp; <b>Users:</b> '+nUsers+' (incl '+inclU+')</div></div></div>'+
      '<div class="band">Premium features included</div><div class="pad">'+(premNames.length?esc(premNames.join(', ')):'—')+'</div>'+
      (odUsers.length?'<div class="band">Users ('+odUsers.length+')</div><table><thead><tr><th>Name</th><th>Login (email / mobile)</th><th style="text-align:center">Role</th></tr></thead><tbody>'+odUsers.map(u=>'<tr><td>'+esc(u.name||'—')+'</td><td>'+esc(u.login||'—')+'</td><td style="text-align:center">'+esc(u.role)+'</td></tr>').join('')+'</tbody></table>':'')+
      '<div class="band">Order details</div><table><thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Amount</th></tr></thead><tbody>'+itemRows+
        '<tr class="tot"><td colspan="2" style="text-align:right">Subtotal</td><td style="text-align:right">'+(total?inr(total):'')+'</td></tr>'+
        '<tr class="tot"><td colspan="2" style="text-align:right;font-size:10pt">Order Total</td><td style="text-align:right;font-size:10pt">'+(total?inr(total)+'*':'')+'</td></tr></tbody></table>'+
      (OD.terms?'<div class="band">Terms &amp; Conditions</div><div class="pad" style="white-space:pre-wrap;font-size:8.5pt">'+esc(OD.terms)+'</div>':'')+
      (custom?'<div class="band">Custom / additional requirement</div><div class="pad">'+esc(custom)+'</div>':'')+
      '<div class="pad" style="font-size:8pt;color:#444;border-bottom:none">*Tentative — prices may change. Final pricing and any discount are confirmed by R.R. Sphere India after you place the order.</div>'+
      '<div class="ft"><span>'+esc(OD.footer||'RRFinEApp | R.R. Sphere INDIA | https://rrsindia.co.in | https://fin.rrsindia.co.in')+'</span><span class="r">This is a computer generated '+(orderNo?'order':'draft order')+'.</span></div>'+
    '</div>'+
    '<div class="btns"><button class="pbtn" onclick="window.print()">🖨 Print this order</button></div>'+
    '</body></html>';
  const w = window.open('', '_blank'); if(!w){ alert('Please allow popups to print the order.'); return; }
  w.document.write(html); w.document.close(); w.focus(); setTimeout(()=>w.print(), 350);
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
    if(!u.login){ alert('Enter an email or mobile (login) for each user — this is their username.'); return; }
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
      s.innerHTML = '✅ Order received! Your reference is <strong>'+d.order_no+'</strong>. Your account will be opened and you’ll be <b>live within 48 hours</b> — we’ll confirm pricing and send your invoice. <b>All premium features are included free</b>'+(odOfferVal()>0?(' (worth ₹'+odOfferVal().toLocaleString('en-IN')+')'):'')+'. '+
        '<button type="button" class="btn-outline" style="margin-top:8px;font-size:.82rem;padding:6px 14px" onclick="printDraftOrder(\''+String(d.order_no).replace(/[^A-Za-z0-9\-]/g,'')+'\')">🖨 Print your order</button><br>Track it on the <a href="portal.html">Customer Login</a> page.' + SPAM_NOTE;
      s.style.display='block'; btn.style.display='none';
    } else { alert('Could not place the order.'+(d.error?'\n\nReason: '+d.error:'')); btn.textContent=orig; btn.disabled=false; }
  } catch(e){ alert('Network issue — please try again.'); btn.textContent=orig; btn.disabled=false; }
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
      '<p style="color:var(--muted);font-size:.82rem;margin-bottom:10px">' + list.length + ' ticket(s) for ' + email.replace(/</g,'&lt;') + ' — click one to see replies.</p>' +
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
    box.innerHTML = '<p style="color:#f87171">Network issue — please try again.</p>';
  }
}

// Open one ticket (called from a list row).
async function trkOpen(no, email) {
  document.getElementById('trk-no').value = no;
  const box = document.getElementById('trk-result');
  box.innerHTML = '<p style="color:var(--muted)">Loading…</p>';
  try { await trkRenderOne(no, email, box); } catch(e) { box.innerHTML = '<p style="color:#f87171">Network issue — please try again.</p>'; }
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
    {k:['issue','problem','bug','error','not working','complaint','broken','crash','stuck','hang','wrong','fix','trouble','help me','support','report'],
     a:"Sorry you're facing trouble! 🛠️ You can report the issue directly to our support team and we'll look into it fast.<br><br>👉 <a href='support.html'>Report an Issue</a>"},
    {k:['coaching','tuition','class','study','student','maths','math','school','child','kid','board'],
     a:"R.R. Coaching Classes offers expert tuition from Nursery to Class 10 — all boards & subjects 📚 — including our signature 'Maths Made Easy' program!<br><br>👉 <a href='coaching.html'>Learn about coaching</a>"},
    {k:['service','software','development','website','ai solution','what do you do','consulting','erp','data analytics'],
     a:"We offer custom software development, AI-powered solutions, cloud & DevOps, data analytics, IT training and ERP integrations 💻<br><br>👉 <a href='services.html'>Explore our services</a>"},
    {k:['contact','call','phone','email','reach','talk','number','whatsapp','address','location','where'],
     a:"Reach us anytime! 📞<br>📧 <a href='mailto:rrsindia@yahoo.co.in'>rrsindia@yahoo.co.in</a><br>📍 Amritsar, Punjab, <span class='in-hl'>India</span>"},
    {k:['hi','hello','hey','namaste','good morning','good evening','hii','helo','hlo'],
     a:"Hello! 👋 I'm the AI Assistant. I can help with RRFinEApp features, pricing, demos, GST, coaching classes and more. What would you like to know?"},
    {k:['thank','thanks','thx','great','nice','okay','cool','good'],
     a:"You're welcome! 😊 Anything else I can help with? You can also <a href='enquire.html'>send an enquiry</a> anytime."},
    {k:['who are you','your name','what are you','are you human','bot','robot'],
     a:"I'm the AI Assistant — here to help you learn about R.R. Sphere India, RRFinEApp and our coaching classes. Ask me anything!"},
    {k:['company','rr sphere','who','experience','about you','about us','history'],
     a:"R.R. Sphere India is an IT & Learning company with 30+ years of expertise (since 1995), based in Amritsar 🇮🇳. We build cloud software, AI solutions and run coaching classes.<br><br>👉 <a href='about.html'>About us</a>"}
  ];
  const FALLBACK = "I'm not totally sure about that one 🤔 — but our team would love to help!<br><br>👉 <a href='enquire.html'>send an enquiry</a> and we'll get right back to you.";
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
    // Default position: just to the RIGHT of the "R.R. Sphere India" logo (its old
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

// ════════════ Render every whole-word "India" as larger "INDIA" ════════════
(function(){
  var SKIP = {SCRIPT:1, STYLE:1, NOSCRIPT:1, TEXTAREA:1, INPUT:1};
  var RE = /India(?![A-Za-z])/gi;   // whole word, any case — never matches "Indian"

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
          lbl.textContent += ' — too large (max 5MB)';
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
// the whole website. Dismissible per session.
(function(){
  function esc(s){ return String(s==null?'':s).replace(/[<>&]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;'}[c];}); }
  function render(a){
    if(!a || sessionStorage.getItem('promoDismiss_'+a.id)) return;
    var bar = document.createElement('div');
    bar.style.cssText = 'position:relative;z-index:50;padding:10px 42px 10px 18px;text-align:center;font-size:.9rem;font-weight:600;line-height:1.5;'+
      'background:'+(a.bg_color||'linear-gradient(90deg,#f59e0b,#16a34a)')+';color:'+(a.text_color||'#ffffff')+';box-shadow:0 2px 8px rgba(0,0,0,.2)';
    bar.innerHTML = (a.emoji?a.emoji+' ':'')+(a.tag?'<b style="text-transform:uppercase;letter-spacing:.5px">'+esc(a.tag)+'</b> · ':'')+
      '<b>'+esc(a.title||'')+'</b>'+(a.body?' — '+esc(a.body):'');
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

// ── finapp.html — live pricing plans from the SuperAdmin price list ──────────
// Renders the plan cards from /public/plans-features (no hardcoded prices). If the
// list is empty or the request fails, the static "Coming Soon" fallback stays.
(function initFinappPricing(){
  function run(){
    var wrap = document.getElementById('finapp-pricing');
    if (!wrap) return;                                   // not the finapp page
    var fallback = document.getElementById('pricing-fallback');
    var inr = function(n){ return '₹' + (Number(n)||0).toLocaleString('en-IN'); };
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
            ? '<div style="margin-top:10px;font-size:.78rem;color:var(--g4);font-weight:600">★ Premium features free — worth ' + inr(p.free_value) + '</div>'
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
