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
      if(s){ s.style.display = 'block'; s.textContent = `✅ Thank you! Your message has been received (ref ${data.ref_no}). We'll get back to you shortly!`; }
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
  if(!name || !contact) { alert('Please fill in your name and phone/WhatsApp number.'); return; }
  const email = document.getElementById('enq-email').value.trim();
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
      if (s) { s.style.display = 'block'; s.textContent = `✅ Thank you! Your enquiry reference is ${data.ref_no}. Our team will get back to you shortly.`; }
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
const RRFINEAPP_PUBLIC_KEY = '2a524909821fa4cdd07b96a173a02603479a7deca1aa0ef0';

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

  try {
    const res = await fetch(RRFINEAPP_API + '/public/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'x-api-key': RRFINEAPP_PUBLIC_KEY },
      body: JSON.stringify({ name, business: biz, category: cat, rating: fbRating, recommend: fbRecommend || null, message: msg })
    });
    const data = await res.json();
    if(res.ok && data.ok) {
      const s = document.getElementById('fb-success');
      if (s) { s.style.display = 'block'; s.textContent = `🌟 Thank you for your feedback! Reference ${data.ref_no}.`; }
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
  if(!contact) { alert('Please enter your phone / WhatsApp number.'); return; }
  if(!area)    { alert('Please select which area of the app the issue is in.'); return; }
  if(!type)    { alert('Please select the type of issue.'); return; }
  if(!sevEl)   { alert('Please choose how serious the issue is.'); return; }
  if(!desc)    { alert('Please describe the problem.'); return; }

  const email    = document.getElementById('tk-email').value.trim();
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
        '</strong>. Please keep it to track your ticket. Our support team will get back to you soon. 🙏';
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
    '</select><input type="text" placeholder="User name (optional)"><button type="button" class="rm" onclick="this.parentNode.remove();odTotal()">✕</button></div>';
}
function odAddUser(role){ const box=document.getElementById('od-users'); if(box){ box.insertAdjacentHTML('beforeend', odUserRow(role||'dataentry')); odTotal(); } }

let OD = { cats:[], prices:[], feats:[], userRates:{} };   // loaded plan/feature/price data
function odFeatPrice(code){ const f = OD.feats.find(x=>x.code===code); return f?Number(f.rate)||0:0; }
function odUserRate(role){ return Number(OD.userRates[role])||0; }

// Build the full order breakdown: plan + selected features + users (by type).
function odBreakdown(){
  const lines = []; let total = 0;
  const cat = document.querySelector('input[name="od-cat"]:checked');
  if(cat){ const c = OD.cats.find(x=>x.code===cat.value); if(c){ const r=Number(c.rate)||0; lines.push({label:'Plan: '+c.label, qty:1, rate:r, amt:r}); total+=r; } }
  document.querySelectorAll('#od-feat input:checked').forEach(i=>{ const f=OD.feats.find(x=>x.code===i.value); const r=odFeatPrice(i.value); lines.push({label:'Feature: '+(f?f.name:i.value), qty:1, rate:r, amt:r}); total+=r; });
  const roleCount = {}; document.querySelectorAll('#od-users .od-user select').forEach(s=>{ roleCount[s.value]=(roleCount[s.value]||0)+1; });
  const roleLbl = {admin:'Admin',dataentry:'Data Entry',viewonly:'Viewer',auditor:'Auditor'};
  Object.entries(roleCount).forEach(([role,n])=>{ const r=odUserRate(role); const amt=r*n; lines.push({label:'User × '+n+' ('+(roleLbl[role]||role)+')', qty:n, rate:r, amt:amt}); total+=amt; });
  return { lines, total };
}
function odTotal(){
  const el = document.getElementById('od-total'); if(!el) return;
  const { total } = odBreakdown();
  el.innerHTML = 'Tentative total: ₹' + total.toLocaleString('en-IN') + ' <span style="color:var(--muted);font-weight:400;font-size:.85rem">(excl. taxes)</span>';
}

async function loadPlansFeatures(){
  const cat = document.getElementById('od-cat'), feat = document.getElementById('od-feat');
  if(!cat) return;
  const ub = document.getElementById('od-users'); if(ub && !ub.children.length){ ub.innerHTML = odUserRow('admin') + odUserRow('dataentry') + odUserRow('viewonly'); }
  try {
    const res = await fetch(RRFINEAPP_API + '/public/plans-features', { headers: { 'x-api-key': RRFINEAPP_PUBLIC_KEY, 'Accept':'application/json' } });
    const d = await res.json().catch(()=>({}));
    OD.cats = d.categories||[]; OD.prices = d.prices||[]; OD.feats = d.premiumFeatures||[]; OD.userRates = d.userRates||{};
    const cy = document.getElementById('od-country');
    if(cy && Array.isArray(d.countries) && d.countries.length){ cy.innerHTML = d.countries.map(c=>'<option value="'+c.code+'">'+c.label.replace(/</g,'&lt;')+'</option>').join(''); }
    // Broker dropdown — from the R.R.Sphere broker master.
    const bk = document.getElementById('od-broker');
    if(bk && Array.isArray(d.brokers)){ bk.innerHTML = '<option value="">— None —</option>' + d.brokers.map(b=>'<option value="'+b.name.replace(/"/g,'')+'">'+b.name.replace(/</g,'&lt;')+'</option>').join(''); }
    cat.innerHTML = OD.cats.length ? OD.cats.map((c,i)=>
      '<label><input type="radio" name="od-cat" value="'+c.code+'"'+(i===0?' checked':'')+' onchange="odTotal()"><span>'+c.label.replace(/</g,'&lt;')+(c.rate?(' — ₹'+Number(c.rate).toLocaleString('en-IN')):'')+'</span></label>'
    ).join('') : '<p style="color:#f87171">Could not load plans.</p>';
    // Premium features — grouped by category; ALL selectable; coming-soon LABELLED (still selectable).
    if(OD.feats.length){
      const groups = {};
      OD.feats.forEach(f=>{ const g=f.category||'General'; (groups[g]=groups[g]||[]).push(f); });
      feat.innerHTML = Object.keys(groups).map(g=>
        '<div style="grid-column:1/-1;color:var(--g4);font-family:\'Rajdhani\',sans-serif;font-weight:700;font-size:.95rem;margin:6px 0 2px">'+g.replace(/</g,'&lt;')+'</div>' +
        groups[g].map(f=>{
          const pr = odFeatPrice(f.code); const prTxt = pr ? (' — ₹'+pr.toLocaleString('en-IN')) : '';
          const cs = f.coming_soon ? ' <em style="color:#f59e0b">(coming soon)</em>' : '';
          return '<label><input type="checkbox" value="'+f.code+'" onchange="odTotal()">' +
            '<span><span class="ft">'+(f.icon||'✨')+' '+f.name.replace(/</g,'&lt;')+prTxt+cs+'</span>' +
            (f.description?'<span class="fd">'+f.description.replace(/</g,'&lt;')+'</span>':'')+'</span></label>';
        }).join('')
      ).join('');
    } else { feat.innerHTML = '<p style="color:var(--muted)">No premium features available right now.</p>'; }
    odTotal();
  } catch(e){ cat.innerHTML = '<p style="color:#f87171">Could not load plans — try again or use the <a href="enquire.html">enquiry form</a>.</p>'; }
}

// Print a DRAFT ORDER (before confirming) — Amazon-style order summary.
function printDraftOrder(){
  const v = id => (document.getElementById(id)?document.getElementById(id).value.trim():'');
  const cat = document.querySelector('input[name="od-cat"]:checked');
  if(!cat){ alert('Please choose a plan first.'); return; }
  const { lines, total } = odBreakdown();
  const esc = s => String(s||'').replace(/</g,'&lt;');
  const inr = n => '₹'+Number(n||0).toLocaleString('en-IN');
  const today = new Date().toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'});
  const addr = [v('od-add1'),v('od-add2'),[v('od-city'),v('od-pin')].filter(Boolean).join(' '),v('od-state')].filter(Boolean);
  const TL = {'1_week':'Within 1 week','2_weeks':'Within 2 weeks','1_month':'Within 1 month','flexible':'Flexible / no rush'};
  const tl = (document.querySelector('input[name="od-timeline"]:checked')||{}).value;
  const pr = (document.querySelector('input[name="od-priority"]:checked')||{}).value;
  const custom = v('od-custom');
  const itemRows = lines.map(l=>
    '<tr><td style="padding:12px 8px;border-bottom:1px solid #eee">'+esc(l.label)+
      '<div style="color:#565959;font-size:12px;margin-top:2px">Qty: '+l.qty+' &nbsp;·&nbsp; Unit ₹'+Number(l.rate).toLocaleString('en-IN')+'</div></td>'+
    '<td style="padding:12px 8px;border-bottom:1px solid #eee;text-align:right;white-space:nowrap;font-weight:600">'+inr(l.amt)+'</td></tr>').join('');
  const customBox = custom ?
    '<div class="card"><div class="card-h">🛠 Custom / additional requirement</div><div style="padding:12px 14px;font-size:13px">'+
      esc(custom)+'<div style="color:#565959;font-size:12px;margin-top:8px">⏱ Timeline: <b>'+esc(TL[tl]||'—')+'</b>'+(v('od-timeline-notes')?' ('+esc(v('od-timeline-notes'))+')':'')+
      ' &nbsp;·&nbsp; Priority: <b>'+(pr==='now'?'Need it now':pr==='next_update'?'Future update is fine':'—')+'</b></div></div></div>' : '';
  const html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Order Summary — RRFinEApp</title><style>'+
    '*{box-sizing:border-box}body{font-family:"Amazon Ember",Arial,Helvetica,sans-serif;color:#0F1111;background:#fff;max-width:760px;margin:0 auto;padding:0 14px 28px}'+
    '.top{background:#232F3E;color:#fff;border-radius:0 0 6px 6px;padding:14px 18px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px}'+
    '.brand{font-size:20px;font-weight:700}.brand span{color:#FF9900}.brand small{display:block;font-size:11px;color:#cfd6dd;font-weight:400}'+
    '.docttl{font-size:13px;color:#FF9900;font-weight:700;text-align:right}'+
    '.hdr{background:#F0F2F2;border:1px solid #D5D9D9;border-radius:8px;margin:16px 0;padding:12px 16px;display:flex;gap:28px;flex-wrap:wrap}'+
    '.hdr div .k{font-size:11px;color:#565959;text-transform:uppercase;letter-spacing:.3px}.hdr div .val{font-size:14px;font-weight:600;margin-top:2px}'+
    '.card{border:1px solid #D5D9D9;border-radius:8px;margin-bottom:14px;overflow:hidden}'+
    '.card-h{background:#F7F8F8;border-bottom:1px solid #D5D9D9;padding:9px 14px;font-size:13px;font-weight:700}'+
    '.two{display:flex;gap:14px;flex-wrap:wrap}.two .card{flex:1;min-width:240px}'+
    '.addr{padding:12px 14px;font-size:13px;line-height:1.55}'+
    'table{width:100%;border-collapse:collapse}'+
    '.totals{margin-top:6px;width:280px;margin-left:auto;font-size:13px}.totals td{padding:5px 8px}.totals .gt td{border-top:2px solid #0F1111;font-size:16px;font-weight:700;padding-top:8px}'+
    '.note{color:#565959;font-size:11px;margin-top:14px;line-height:1.5}'+
    '.btns{margin-top:16px;text-align:center}.pbtn{padding:9px 26px;background:#FFD814;border:1px solid #FCD200;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600}'+
    '@media print{.btns{display:none}.top{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body>'+
    '<div class="top"><div class="brand">R.R. Sphere <span>India</span><small>RRFinEApp · www.rrsindia.co.in</small></div>'+
      '<div class="docttl">DRAFT ORDER<br><span style="color:#cfd6dd;font-weight:400;font-size:11px">not a final invoice</span></div></div>'+
    '<div class="hdr">'+
      '<div><div class="k">Order placed</div><div class="val">'+today+'</div></div>'+
      '<div><div class="k">Plan</div><div class="val">'+esc(cat.parentElement.innerText.split('—')[0].trim()||cat.value)+'</div></div>'+
      '<div><div class="k">Tentative total</div><div class="val" style="color:#B12704">'+inr(total)+'</div></div>'+
    '</div>'+
    '<div class="two">'+
      '<div class="card"><div class="card-h">Account / Tenant</div><div class="addr"><b>'+esc(v('od-name'))+'</b> ('+esc(v('od-code'))+')'+
        (v('od-company')?'<br>'+esc(v('od-company')):'')+'<br>'+esc(addr.join(', '))+'</div></div>'+
      '<div class="card"><div class="card-h">Contact</div><div class="addr">'+esc(v('od-email'))+
        (v('od-phone')?'<br>📞 '+esc(v('od-phone')):'')+(v('od-gstin')?'<br>GSTIN: '+esc(v('od-gstin')):'')+
        (v('od-broker')?'<br>Broker: '+esc(v('od-broker')):'')+'</div></div>'+
    '</div>'+
    '<div class="card"><div class="card-h">Order details</div><table><tbody>'+itemRows+'</tbody></table>'+
      '<table class="totals"><tbody>'+
        '<tr><td>Items subtotal</td><td style="text-align:right">'+inr(total)+'</td></tr>'+
        '<tr><td>Taxes (GST)</td><td style="text-align:right;color:#565959">As applicable</td></tr>'+
        '<tr class="gt"><td>Order Total</td><td style="text-align:right;color:#B12704">'+inr(total)+'*</td></tr>'+
      '</tbody></table></div>'+
    customBox+
    '<p class="note">*Tentative — prices may change. Taxes (GST) extra as applicable. Final pricing, any discount and the GST tax invoice are confirmed by R.R. Sphere India after you place the order. This draft is for your reference only.</p>'+
    '<div class="btns"><button class="pbtn" onclick="window.print()">🖨 Print this order</button></div>'+
    '</body></html>';
  const w = window.open('', '_blank'); if(!w){ alert('Please allow popups to print the draft order.'); return; }
  w.document.write(html); w.document.close(); w.focus(); setTimeout(()=>w.print(), 350);
}

async function submitOrder(){
  const v = id => (document.getElementById(id)?document.getElementById(id).value.trim():'');
  const req = [['od-code','Account/Tenant Code'],['od-name','Account/Tenant Name'],['od-email','Email'],['od-add1','Address Line 1'],['od-city','City'],['od-pin','PIN'],['od-state','State']];
  for(const [id,lbl] of req){ if(!v(id)){ alert('Please fill: '+lbl); document.getElementById(id)?.focus(); return; } }
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v('od-email'))){ alert('Please enter a valid email.'); return; }
  const catEl = document.querySelector('input[name="od-cat"]:checked');
  if(!catEl){ alert('Please choose a plan (Tenant Category).'); return; }
  const premium = Array.from(document.querySelectorAll('#od-feat input:checked')).map(i=>i.value);
  const users = Array.from(document.querySelectorAll('#od-users .od-user')).map(r=>({ role:r.querySelector('select').value, name:r.querySelector('input').value.trim() }));
  if(users.length < 3){ alert('Add at least 3 users (1 Admin + 1 Data Entry + 1 Viewer).'); return; }
  if(!users.some(u=>u.role==='admin')){ alert('At least one Admin user is required.'); return; }
  if(!users.some(u=>u.role==='dataentry')){ alert('At least one Data Entry user is required.'); return; }
  if(!users.some(u=>u.role==='viewonly')){ alert('At least one Viewer (view-only) user is required.'); return; }

  const btn = document.querySelector('.od-submit'); const orig = btn.textContent; btn.textContent='Placing…'; btn.disabled=true;
  try {
    const res = await fetch(RRFINEAPP_API + '/public/submit-order', {
      method:'POST', headers:{ 'Content-Type':'application/json','Accept':'application/json','x-api-key':RRFINEAPP_PUBLIC_KEY },
      body: JSON.stringify({
        account_code: v('od-code'), customer_name: v('od-name'), customer_company: v('od-company'),
        num_companies: parseInt(v('od-companies'),10)||1,
        billing_period: v('od-billing'),
        customer_email: v('od-email'),
        customer_phone: v('od-phone'), country: v('od-country')||'IN', gstin: v('od-gstin'),
        address1: v('od-add1'), address2: v('od-add2'), city: v('od-city'), pin_code: v('od-pin'),
        state_code: v('od-state').slice(0,2).toUpperCase(), broker: v('od-broker'),
        tenant_category: catEl.value, premium_features: premium, users, notes: v('od-notes'),
        custom_requirement: v('od-custom'),
        dev_timeline: (document.querySelector('input[name="od-timeline"]:checked')||{}).value || '',
        dev_timeline_notes: v('od-timeline-notes'),
        dev_priority: (document.querySelector('input[name="od-priority"]:checked')||{}).value || ''
      })
    });
    const d = await res.json().catch(()=>({}));
    if(res.ok && d.ok){
      const s = document.getElementById('od-success');
      s.innerHTML = '✅ Order received! Your reference is <strong>'+d.order_no+'</strong>. Your order will be processed within 48 hours. We\'ll confirm pricing and send your invoice. Track your order on the <a href="portal.html">Customer Login</a> page.';
      s.style.display='block'; btn.style.display='none';
      odResetForm();
    } else { alert('Could not place the order.'+(d.error?'\n\nReason: '+d.error:'')); btn.textContent=orig; btn.disabled=false; }
  } catch(e){ alert('Network issue — please try again.'); btn.textContent=orig; btn.disabled=false; }
}
function odResetForm(){
  ['od-code','od-name','od-company','od-email','od-phone','od-gstin','od-add1','od-add2','od-city','od-pin','od-state','od-notes','od-custom','od-timeline-notes'].forEach(id=>{ const e=document.getElementById(id); if(e) e.value=''; });
  const comp=document.getElementById('od-companies'); if(comp) comp.value='1';
  const bp=document.getElementById('od-billing'); if(bp) bp.selectedIndex=0;
  const ub=document.getElementById('od-users'); if(ub) ub.innerHTML = odUserRow('admin')+odUserRow('dataentry')+odUserRow('viewonly');
  document.querySelectorAll('#od-feat input:checked, #od-cat input:checked').forEach(c=>{ c.checked=false; });
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
