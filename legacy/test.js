
const ZONES = [
  {id:'1', name:'Admin Block', head:'zh1'},
  {id:'2', name:'Science Block', head:'zh2'},
  {id:'3', name:'Engineering Block', head:'zh3'},
  {id:'4', name:'Hostel A', head:'zh4'},
  {id:'5', name:'Hostel B', head:'zh5'},
  {id:'6', name:'Library', head:'zh6'},
  {id:'7', name:'Sports Complex', head:'zh7'},
  {id:'8', name:'Canteen', head:'zh8'}
];

const SZH = [
  // Dummy subzones for Zone 1
  {id:'szh1', name:'John Doe', floor:'Ground Floor', zone:'1'},
  {id:'szh2', name:'Jane Smith', floor:'First Floor', zone:'1'},
  // Dummy subzones for Zone 2
  {id:'szh3', name:'Alice Brown', floor:'Ground Floor', zone:'2'},
  {id:'szh4', name:'Bob White', floor:'First Floor', zone:'2'}
];

const db = {
  complaints: [],
  advisories: [],
  remarks: []
};

let currentUser = null;

function login(role) {
  document.getElementById('loginScreen').style.display = 'none';
  if(role === 'student') {
    currentUser = {role:'student', id:'s1', name:'Student A'};
    document.getElementById('studentScreen').style.display = 'block';
    refreshStu();
  } else if(role === 'subzonal') {
    currentUser = {role:'subzonal', id:'szh1', name:'John Doe'};
    document.getElementById('subzonalScreen').style.display = 'block';
    loadSZH();
  } else if(role === 'zonal') {
    currentUser = {role:'zonal', id:'zh1', name:'Zonal Head'};
    document.getElementById('zonalScreen').style.display = 'block';
    loadZH();
  } else if(role === 'admin') {
    currentUser = {role:'admin', id:'adm1', name:'Admin'};
    document.getElementById('adminScreen').style.display = 'block';
    loadAdmin();
  }
}

function logout() {
  document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
  document.getElementById('loginScreen').style.display = 'flex';
  currentUser = null;
}

function showToast(msg) {
  // simple dummy toast
  alert(msg);
}

function fmt(d) {
  if(!d) return '';
  return new Date(d).toLocaleString();
}

function bdg(color, text) {
  return `<span class="bdg bdg-${color}">${text}</span>`;
}

// Student logic
function refreshStu() {
  const list = document.getElementById('stu-my-complaints');
  if(!list) return;
  const mine = db.complaints.filter(c => c.author === currentUser.id);
  if(mine.length === 0) {
    list.innerHTML = '<p style="color:var(--muted);font-size:13px;">No concerns reported yet.</p>';
    return;
  }
  list.innerHTML = mine.map(c => {
    let html = `<div class="ci"><div class="ci-top"><span class="ci-ztag">${c.subzone}</span>${bdg(c.status==='Resolved'?'g':c.status==='In Progress'?'y':'r', c.status)}</div><div class="ci-desc">${c.desc}</div>`;
    if(c.remark) html += `<div class="ci-desc" style="color:var(--maroon);font-size:12px;margin-top:5px;"><b>Remark:</b> ${c.remark}</div>`;
    if(c.solvedPhoto) html += `<div style="margin-top:5px;"><img src="${c.solvedPhoto}" style="max-width:100px;border-radius:4px;"></div>`;
    html += `</div>`;
    return html;
  }).join('');
}

function submitComplaint() {
  const zone = document.getElementById('stu-zone').value;
  const subzone = document.getElementById('stu-subzone').value;
  const desc = document.getElementById('stu-desc').value;
  if(!zone || !subzone || !desc) {
    showToast('Please fill all fields');
    return;
  }
  db.complaints.unshift({
    id: 'C'+Date.now(),
    zone, subzone, desc,
    author: currentUser.id,
    ts: new Date(),
    status: 'Pending'
  });
  document.getElementById('stu-desc').value = '';
  showToast('Concern submitted successfully');
  refreshStu();
}

// Sub-zonal logic
function loadSZH() {
  switchSzhTab('daily');
  const myC = db.complaints.filter(c => c.subzone === SZH.find(x=>x.id===currentUser.id)?.floor);
  document.getElementById('szh-concerns').innerHTML = myC.map(c => `<div class="ci"><div class="ci-desc">${c.desc}</div>${c.status==='Pending'?`<button onclick="resolveConcernUI('${c.id}')">Resolve</button>`:''}</div>`).join('');
}

function switchSzhTab(tab) {
  document.getElementById('szh-tab-daily').style.display = 'none';
  document.getElementById('szh-tab-history').style.display = 'none';
  document.getElementById('szh-tab-concerns').style.display = 'none';
  document.getElementById('szh-tab-advisories').style.display = 'none';
  
  document.querySelectorAll('#subzonalScreen .sb-nav').forEach(n => n.classList.remove('active'));
  
  if (tab === 'daily') {
    document.getElementById('szh-tab-daily').style.display = 'block';
    document.getElementById('szh-nav-daily').classList.add('active');
  } else if (tab === 'history') {
    document.getElementById('szh-tab-history').style.display = 'block';
    document.getElementById('szh-nav-history').classList.add('active');
  } else if (tab === 'concerns') {
    document.getElementById('szh-tab-concerns').style.display = 'block';
    document.getElementById('szh-nav-concerns').classList.add('active');
  } else if (tab === 'advisories') {
    document.getElementById('szh-tab-advisories').style.display = 'block';
    document.getElementById('szh-nav-advisories').classList.add('active');
    loadSzhAdvisories();
  }
}

function resolveConcernUI(id) {
  // basic dummy
  const c = db.complaints.find(x=>x.id===id);
  if(c) {
    c.status = 'Resolved';
    c.remark = 'Resolved by SZH';
    c.solvedTs = new Date();
    showToast('Resolved');
    loadSZH();
  }
}

// Zonal logic
function loadZH() {
  switchZhTab('dashboard');
  const z = ZONES.find(x=>x.head===currentUser.id);
  if(!z) return;
  const mySZHs = SZH.filter(s=>s.zone===z.id);
  document.getElementById('zh-subzone-list').innerHTML = mySZHs.map(s=>`<div class="sb-nav" style="font-size:13px;padding:8px 12px;margin-bottom:2px;" onclick="switchZhTab('subzone', '${s.id}', '${s.floor}')"><span class="ni"><i class="fa-solid fa-arrow-right"></i></span>${s.floor}</div>`).join('');
  document.getElementById('zh-remark-target').innerHTML='<option value="">— Select —</option>'+mySZHs.map(s=>`<option value="${s.id}">${s.name} (${s.floor})</option>`).join('');
  
  const zc=db.complaints.filter(c=>c.zone===z.id);
  document.getElementById('zh-complaints').innerHTML=zc.length?zc.map(c=>{
     const subName = c.subzone || 'Unknown';
     const incharge = mySZHs.find(s=>s.floor===subName)?.name || 'Unknown';
     return `<div class="ci"><div class="ci-top"><span class="ci-ztag">${subName}</span>${bdg(c.status==='Resolved'?'g':'y',c.status)}</div><div class="ci-desc">${c.desc}</div><div class="ci-meta">Incharge: ${incharge} · Uploaded: ${fmt(c.ts)} · Action Taken: ${c.status==='Resolved'?fmt(c.solvedTs):'No'}</div></div>`;
  }).join(''):'<p style="color:var(--muted);font-size:13px;">No concerns raised in this zone.</p>';
}

function switchZhTab(tab, szId, szName) {
  document.getElementById('zh-tab-dashboard').style.display = 'none';
  document.getElementById('zh-tab-subzone').style.display = 'none';
  document.getElementById('zh-tab-remarks').style.display = 'none';
  document.getElementById('zh-tab-advisories').style.display = 'none';
  
  document.querySelectorAll('#zonalScreen .sb-nav').forEach(n => n.classList.remove('active'));
  
  if (tab === 'dashboard') {
    document.getElementById('zh-tab-dashboard').style.display = 'block';
    document.getElementById('zh-zone-title-bar').textContent = 'Zone Dashboard';
    document.getElementById('zh-zone-title').textContent = 'Zone Dashboard';
    document.getElementById('zh-nav-dashboard').classList.add('active');
  } else if (tab === 'subzone') {
    document.getElementById('zh-tab-subzone').style.display = 'block';
    document.getElementById('zh-zone-title-bar').textContent = 'Sub-Zone: ' + szName;
    document.getElementById('zh-zone-title').textContent = 'Sub-Zone: ' + szName;
    loadSzReport(szId);
  } else if (tab === 'remarks') {
    document.getElementById('zh-tab-remarks').style.display = 'block';
    document.getElementById('zh-zone-title-bar').textContent = 'Commit Remarks';
    document.getElementById('zh-zone-title').textContent = 'Commit Remarks';
    document.getElementById('zh-nav-remarks').classList.add('active');
    loadRemarksHistory();
  } else if (tab === 'advisories') {
    document.getElementById('zh-tab-advisories').style.display = 'block';
    document.getElementById('zh-zone-title-bar').textContent = 'Advisories';
    document.getElementById('zh-zone-title').textContent = 'Advisories';
    document.getElementById('zh-nav-advisories').classList.add('active');
    loadZhAdvisories();
  }
}

function toggleSubZonalLogs() {
  const el = document.getElementById('zh-subzone-list');
  const icon = document.getElementById('zh-szl-icon');
  if (el.style.display === 'none') {
    el.style.display = 'block';
    icon.classList.remove('fa-chevron-down');
    icon.classList.add('fa-chevron-up');
  } else {
    el.style.display = 'none';
    icon.classList.remove('fa-chevron-up');
    icon.classList.add('fa-chevron-down');
  }
}

function loadSzReport(szId) {
  const sz = SZH.find(s => s.id === szId);
  if (!sz) return;
  document.getElementById('zh-sz-report').innerHTML = `
    <div style="margin-bottom:10px;"><b>Sub-Zonal Head:</b> ${sz.name}</div>
    <div style="margin-bottom:10px;"><b>Area:</b> ${sz.floor}</div>
    <div style="margin-bottom:10px;"><b>Overall Status:</b> <span class="bdg bdg-g">Good</span></div>
    <div><b>Compliance Progress:</b> 85% Completed this week</div>
  `;
  document.getElementById('zh-sz-history').innerHTML = `
    <table class="tbl">
      <thead><tr><th>Date</th><th>Submitted At</th><th>Status</th></tr></thead>
      <tbody>
        <tr><td>Today</td><td>09:15 AM</td><td><span class="bdg bdg-g">Green</span></td></tr>
        <tr><td>Yesterday</td><td>09:30 AM</td><td><span class="bdg bdg-g">Green</span></td></tr>
      </tbody>
    </table>
  `;
}

function loadRemarksHistory() {
  const el = document.getElementById('zh-remark-history');
  if (!db.remarks || db.remarks.length === 0) {
    el.innerHTML = '<p style="color:var(--muted);font-size:13px;">No remarks committed yet.</p>';
    return;
  }
  el.innerHTML = db.remarks.map(r => `
    <div class="ci">
      <div class="ci-top"><span class="ci-ztag">${r.szName}</span></div>
      <div class="ci-desc">${r.text}</div>
      <div class="ci-meta">Committed at: ${fmt(r.ts)} · By: ${r.author}</div>
    </div>
  `).join('');
}

function addRemark(){
  const sel=document.getElementById('zh-remark-target').value;
  const txt=document.getElementById('zh-remark-text').value.trim();
  if(!sel){showToast('Please select a Sub-Zonal Head.');return;}
  if(!txt){showToast('Please enter your review remarks.');return;}
  if(!db.remarks) db.remarks = [];
  const sz = SZH.find(s=>s.id===sel);
  db.remarks.unshift({id:'R'+Date.now(), szId:sz.id, szName:sz.floor, text:txt, ts:new Date(), author:currentUser.name});
  showToast('Remark submitted successfully.');
  document.getElementById('zh-remark-target').value='';
  document.getElementById('zh-remark-text').value='';
  loadRemarksHistory();
}

// Admin logic
function loadAdmin() {
  switchAdmTab('dashboard');
  const zoneSel = document.getElementById('adv-target');
  zoneSel.innerHTML='<option value="All Zones">All Zones (Campus-Wide)</option>'+ZONES.map(z=>`<option value="${z.id}">Zone ${z.id} - ${z.name}</option>`).join('');
  
  zoneSel.addEventListener('change', function() {
    const subSel = document.getElementById('adv-subtarget');
    if(this.value === 'All Zones') {
      subSel.innerHTML = '<option value="All Sub-Zones">All Sub-Zones</option>';
    } else {
      const subs = SZH.filter(s => s.zone === this.value);
      subSel.innerHTML = '<option value="All Sub-Zones">All Sub-Zones in Zone</option>' + subs.map(s => `<option value="${s.floor}">${s.floor} (${s.name})</option>`).join('');
    }
  });
}

function switchAdmTab(tab) {
  document.getElementById('adm-tab-dashboard').style.display = 'none';
  document.getElementById('adm-tab-allzones').style.display = 'none';
  document.getElementById('adm-tab-advisories').style.display = 'none';
  
  document.querySelectorAll('#adminScreen .sb-nav').forEach(n => n.classList.remove('active'));
  
  if (tab === 'dashboard') {
    document.getElementById('adm-tab-dashboard').style.display = 'block';
    document.getElementById('adm-nav-dashboard').classList.add('active');
  } else if (tab === 'allzones') {
    document.getElementById('adm-tab-allzones').style.display = 'block';
    document.getElementById('adm-nav-allzones').classList.add('active');
    loadAllZones();
  } else if (tab === 'advisories') {
    document.getElementById('adm-tab-advisories').style.display = 'block';
    document.getElementById('adm-nav-advisories').classList.add('active');
    loadAdvHistory();
  }
}

function loadAllZones() {
  const html = SZH.map(s => {
    const z = ZONES.find(x=>x.id===s.zone);
    return `<tr><td>${z?z.name:'Unknown'}</td><td>${s.floor}</td><td>${s.name}</td><td><span class="bdg bdg-g">Green</span></td></tr>`;
  }).join('');
  document.getElementById('adm-allzones-list').innerHTML = html;
}

function loadAdvHistory() {
  const el = document.getElementById('adm-adv-history');
  if (!db.advisories || db.advisories.length === 0) {
    el.innerHTML = '<p style="color:var(--muted);font-size:13px;">No advisories published yet.</p>';
    return;
  }
  
  el.innerHTML = db.advisories.map(a => `
    <div class="ci">
      <div class="ci-top">
        <span class="ci-ztag">Zone: ${a.zone}</span> <span class="ci-ztag" style="background:var(--gold);color:#000;">Sub: ${a.subzone}</span>
      </div>
      <div class="ci-desc"><b>Advisory:</b> ${a.text}</div>
      <div class="ci-meta">Published: ${fmt(a.ts)} · By: ${a.author}</div>
      ${a.replies ? a.replies.map(r => `<div style="margin-top:8px;padding-top:8px;border-top:1px dashed #ccc;font-size:12px;"><b style="color:var(--maroon)">Reply from ${r.author}:</b> ${r.text} <span style="color:var(--muted)">(${fmt(r.ts)})</span></div>`).join('') : ''}
    </div>
  `).join('');
}

function publishAdvisory() {
  const zone = document.getElementById('adv-target').value;
  const subzone = document.getElementById('adv-subtarget').value;
  const text = document.getElementById('adv-text').value.trim();
  if(!text) { showToast('Please enter advisory content'); return; }
  
  if(!db.advisories) db.advisories = [];
  db.advisories.unshift({
    id: 'A' + Date.now(),
    zone: zone,
    subzone: subzone,
    text: text,
    ts: new Date(),
    author: currentUser.name,
    replies: []
  });
  
  showToast('Advisory Published & Notifications Sent');
  document.getElementById('adv-text').value = '';
  loadAdvHistory();
}

function loadZhAdvisories() {
  const el = document.getElementById('zh-advisories-list');
  const z = ZONES.find(x => x.head === currentUser.id);
  if(!z || !db.advisories || db.advisories.length === 0) {
    el.innerHTML = '<p style="color:var(--muted);font-size:13px;">No advisories published yet.</p>';
    return;
  }
  const myAdv = db.advisories.filter(a => a.zone === 'All Zones' || a.zone === z.id);
  
  if(myAdv.length === 0) {
    el.innerHTML = '<p style="color:var(--muted);font-size:13px;">No advisories published yet.</p>';
    return;
  }
  
  el.innerHTML = myAdv.map(a => `
    <div class="ci">
      <div class="ci-top">
        <span class="ci-ztag">Target: ${a.zone} ${a.subzone !== 'All Sub-Zones' ? '('+a.subzone+')' : ''}</span>
      </div>
      <div class="ci-desc"><b>Advisory:</b> ${a.text}</div>
      <div class="ci-meta">Published: ${fmt(a.ts)} · By: ${a.author}</div>
      ${a.replies ? a.replies.map(r => `<div style="margin-top:8px;padding-top:8px;border-top:1px dashed #ccc;font-size:12px;"><b style="color:var(--maroon)">${r.author}:</b> ${r.text} <span style="color:var(--muted)">(${fmt(r.ts)})</span></div>`).join('') : ''}
      <div style="margin-top:10px;">
        <input type="text" id="reply-zh-${a.id}" placeholder="Type your reply..." style="padding:6px;font-size:12px;border:1px solid #ccc;border-radius:4px;width:70%;">
        <button class="btn-gold" style="padding:6px 12px;font-size:12px;" onclick="replyAdvisory('${a.id}', 'reply-zh-${a.id}')">Reply</button>
      </div>
    </div>
  `).join('');
}

function loadSzhAdvisories() {
  const el = document.getElementById('szh-advisories-list');
  const sz = SZH.find(x => x.id === currentUser.id);
  if(!sz || !db.advisories || db.advisories.length === 0) {
    el.innerHTML = '<p style="color:var(--muted);font-size:13px;">No advisories published yet.</p>';
    return;
  }
  
  const z = ZONES.find(x => x.id === sz.zone);
  const myAdv = db.advisories.filter(a => 
    (a.zone === 'All Zones' || a.zone === z.id) &&
    (a.subzone === 'All Sub-Zones' || a.subzone === 'All Sub-Zones in Zone' || a.subzone === sz.floor)
  );
  
  if(myAdv.length === 0) {
    el.innerHTML = '<p style="color:var(--muted);font-size:13px;">No advisories published yet.</p>';
    return;
  }
  
  el.innerHTML = myAdv.map(a => `
    <div class="ci">
      <div class="ci-top">
        <span class="ci-ztag">Target: ${a.zone} ${a.subzone !== 'All Sub-Zones' ? '('+a.subzone+')' : ''}</span>
      </div>
      <div class="ci-desc"><b>Advisory:</b> ${a.text}</div>
      <div class="ci-meta">Published: ${fmt(a.ts)} · By: ${a.author}</div>
      ${a.replies ? a.replies.map(r => `<div style="margin-top:8px;padding-top:8px;border-top:1px dashed #ccc;font-size:12px;"><b style="color:var(--maroon)">${r.author}:</b> ${r.text} <span style="color:var(--muted)">(${fmt(r.ts)})</span></div>`).join('') : ''}
      <div style="margin-top:10px;">
        <input type="text" id="reply-szh-${a.id}" placeholder="Type your reply..." style="padding:6px;font-size:12px;border:1px solid #ccc;border-radius:4px;width:70%;">
        <button class="btn-gold" style="padding:6px 12px;font-size:12px;" onclick="replyAdvisory('${a.id}', 'reply-szh-${a.id}')">Reply</button>
      </div>
    </div>
  `).join('');
}

function replyAdvisory(advId, inputId) {
  const text = document.getElementById(inputId).value.trim();
  if(!text) {
    showToast('Please enter a reply');
    return;
  }
  const adv = db.advisories.find(a => a.id === advId);
  if(adv) {
    if(!adv.replies) adv.replies = [];
    adv.replies.push({
      author: currentUser.name,
      text: text,
      ts: new Date()
    });
    showToast('Reply added successfully');
    // Refresh current view
    if(currentUser.role === 'subzonal') loadSzhAdvisories();
    else if(currentUser.role === 'zonal') loadZhAdvisories();
    else if(currentUser.role === 'admin') loadAdvHistory();
  }
}
