import sys
import re

file_path = 'c:/Users/lenovo/Desktop/6s/gsfcu6s-android/gsfcu6s-android/app/src/main/assets/index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# I will replace the Zonal Head section using split
parts = content.split('<!-- ══════════════════════════════════════\n     LEVEL 4 — ADMIN / CORE COMMITTEE')
head = parts[0]
tail = parts[1]

# In head, find from LEVEL 3 to end
level3_start = head.find('<!-- ══════════════════════════════════════\n     LEVEL 3 — ZONAL HEAD')
if level3_start == -1:
    print("Level 3 start not found!")
    sys.exit(1)

zonal_html_old = head[level3_start:]

new_zonal_html = '''<!-- ══════════════════════════════════════
     LEVEL 3 — ZONAL HEAD
══════════════════════════════════════ -->
<div id="zonalScreen" class="screen">
  <div class="app-layout">
    <aside class="sidebar">
      <div class="sb-header">
        <div class="sb-logo-row"><div class="sb-icon"><img src="data:image/jpeg;base64,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" alt="GSFCU Logo" style="width:100%; height:100%; object-fit:contain; border-radius: inherit;"></div><div class="sb-brand"><h1>GSFC University</h1><p>6S Monitor</p></div></div>
        <div class="sb-divider"></div>
        <div class="sb-section-label">Zonal Head Panel</div>
        <div class="sb-nav active" id="zh-nav-dashboard" onclick="switchZhTab('dashboard')"><span class="ni"><i class="fa-solid fa-building"></i></span>Zone Dashboard</div>
        <div class="sb-nav" onclick="toggleSubZonalLogs()"><span class="ni"><i class="fa-solid fa-chart-bar"></i></span>Sub-Zonal Logs <i id="zh-szl-icon" class="fa-solid fa-chevron-down" style="float:right;margin-top:4px;font-size:12px;"></i></div>
        <div id="zh-subzone-list" style="display:none; padding-left:15px; margin-bottom:10px;"></div>
        <div class="sb-nav" id="zh-nav-remarks" onclick="switchZhTab('remarks')"><span class="ni"><i class="fa-solid fa-pen-to-square"></i></span>Commit Remarks</div>
      </div>
      <div class="sb-bottom">
        <div class="sb-user"><div class="sb-avatar"><i class="fa-solid fa-crosshairs"></i></div><div><div class="sb-uname" id="zh-uname">Zonal Head</div><div class="sb-urole" id="zh-urole">Level 3</div></div></div>
        <button class="btn-logout" onclick="logout()">← Sign Out</button>
      </div>
    </aside>

    <div class="main-area">
      <div class="top-bar">
        <div class="tb-breadcrumb">GSFCU 6S Monitor &rsaquo; <strong id="zh-zone-title-bar">Zone Dashboard</strong></div>
        <div class="tb-right"><span class="tb-badge tb-l3">Level 3 — Zonal Head</span></div>
      </div>
      <div class="pg">
        <div class="pg-header">
          <div class="pg-eyebrow"><div class="edot"></div>Zonal Head Panel</div>
          <h2 id="zh-zone-title">Zone Dashboard</h2>
          <p id="zh-zone-sub">Manage and review sub-zonal compliance for your zone</p>
        </div>
        <div class="gold-rule"></div>

        <div id="zh-tab-dashboard" style="display:block;">
          <div class="grid-3" style="margin-bottom:24px;">
            <div class="sc sc-green"><div class="sc-top"><div class="sc-ico"><i class="fa-solid fa-circle-check"></i></div></div><div class="sc-num" id="zh-green">3</div><div class="sc-lbl">Green Sub-Zones</div></div>
            <div class="sc sc-gold"><div class="sc-top"><div class="sc-ico"><i class="fa-solid fa-triangle-exclamation"></i></div></div><div class="sc-num" id="zh-yellow">1</div><div class="sc-lbl">Yellow Sub-Zones</div></div>
            <div class="sc sc-red"><div class="sc-top"><div class="sc-ico"><i class="fa-solid fa-circle-exclamation"></i></div></div><div class="sc-num" id="zh-red">0</div><div class="sc-lbl">Red Sub-Zones</div></div>
          </div>

          <div class="card" style="margin-bottom:20px;">
            <div class="card-hdr"><div class="card-title"><div class="card-icon ci-gold"><i class="fa-solid fa-triangle-exclamation"></i></div>Zone Concerns</div></div>
            <div id="zh-complaints"><p style="color:var(--muted);font-size:13px;">No complaints in this zone.</p></div>
          </div>
        </div>

        <div id="zh-tab-subzone" style="display:none;">
          <div class="card" style="margin-bottom:20px;">
            <div class="card-hdr"><div class="card-title"><div class="card-icon ci-maroon"><i class="fa-solid fa-building"></i></div>Sub-Zonal Progress Report</div></div>
            <div id="zh-sz-report"><p style="color:var(--muted);font-size:13px;">Select a sub-zone from the sidebar.</p></div>
          </div>
          <div class="card">
            <div class="card-hdr"><div class="card-title"><div class="card-icon ci-green"><i class="fa-solid fa-clipboard-check"></i></div>Compliance Submission History</div></div>
            <div id="zh-sz-history"><p style="color:var(--muted);font-size:13px;">Select a sub-zone from the sidebar.</p></div>
          </div>
        </div>

        <div id="zh-tab-remarks" style="display:none;">
          <div class="grid-2">
            <div>
              <div class="card" style="margin-bottom:20px;">
                <div class="card-hdr"><div class="card-title"><div class="card-icon ci-maroon"><i class="fa-solid fa-pen-to-square"></i></div>Commit Remarks</div></div>
                <div class="fg"><label>Sub-Zonal Head</label><select id="zh-remark-target"><option value="">— Select —</option></select></div>
                <div class="fg"><label>Remarks / Review</label><textarea id="zh-remark-text" placeholder="Write your review or commit remark for this sub-zonal head…"></textarea></div>
                <button class="btn-p" onclick="addRemark()">Submit Remark →</button>
              </div>
            </div>
            <div>
              <div class="card">
                <div class="card-hdr"><div class="card-title"><div class="card-icon ci-green"><i class="fa-solid fa-list-check"></i></div>Remarks History</div></div>
                <div id="zh-remark-history"><p style="color:var(--muted);font-size:13px;">No remarks committed yet.</p></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</div>
'''

head = head[:level3_start] + new_zonal_html

# Inject Javascript
js_add = '''
function switchZhTab(tab, szId, szName) {
  document.getElementById('zh-tab-dashboard').style.display = 'none';
  document.getElementById('zh-tab-subzone').style.display = 'none';
  document.getElementById('zh-tab-remarks').style.display = 'none';
  
  document.querySelectorAll('.sb-nav').forEach(n => n.classList.remove('active'));
  
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
  
  // Dummy data for progress
  document.getElementById('zh-sz-report').innerHTML = `
    <div style="margin-bottom:10px;"><b>Sub-Zonal Head:</b> ${sz.name}</div>
    <div style="margin-bottom:10px;"><b>Area:</b> ${sz.floor}</div>
    <div style="margin-bottom:10px;"><b>Overall Status:</b> <span class="bdg bdg-g">Good</span></div>
    <div><b>Compliance Progress:</b> 85% Completed this week</div>
  `;
  
  // Dummy data for history
  document.getElementById('zh-sz-history').innerHTML = `
    <table class="tbl">
      <thead><tr><th>Date</th><th>Submitted At</th><th>Status</th></tr></thead>
      <tbody>
        <tr><td>Today</td><td>09:15 AM</td><td><span class="bdg bdg-g">Green</span></td></tr>
        <tr><td>Yesterday</td><td>09:30 AM</td><td><span class="bdg bdg-g">Green</span></td></tr>
        <tr><td>2 Days Ago</td><td>10:05 AM</td><td><span class="bdg bdg-y">Yellow</span></td></tr>
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
      <div class="ci-top">
        <span class="ci-ztag">${r.szName}</span>
      </div>
      <div class="ci-desc">${r.text}</div>
      <div class="ci-meta">Committed at: ${fmt(r.ts)} · By: ${r.author}</div>
    </div>
  `).join('');
}
'''

content = head + '<!-- ══════════════════════════════════════\n     LEVEL 4 — ADMIN / CORE COMMITTEE' + tail
content = content.replace('function loadZH(){', js_add + '\nfunction loadZH(){')

# Update loadZH to populate subzone list and concerns
loadzh_orig = '''const mySZHs=SZH.filter(s=>s.zone===z.id);
  document.getElementById('zh-remark-target').innerHTML='<option value="">— Select —</option>'+mySZHs.map(s=>`<option value="${s.id}">${s.name} (${s.floor})</option>`).join('');
  const sts=['green','yellow','green'];
  document.getElementById('zh-sublogs').innerHTML=mySZHs.map((s,i)=>{const st=sts[i%sts.length];const t=new Date();t.setHours(9,Math.floor(Math.random()*50),0);return`<tr><td style="color:var(--dark);font-weight:600;">${s.floor}</td><td>${s.name}</td><td style="color:var(--muted);">${t.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</td><td>${bdg(st==='green'?'g':st==='yellow'?'y':'r',st.charAt(0).toUpperCase()+st.slice(1))}</td><td><button class="btn-gold" onclick="approveLog('${s.id}')">Approve</button></td></tr>`;}).join('');
  const zc=db.complaints.filter(c=>c.zone===z.id);
  document.getElementById('zh-complaints').innerHTML=zc.length?zc.map(c=>`<div class="ci"><div class="ci-top"><span class="ci-ztag">Zone ${c.zone}</span></div><div class="ci-desc">${c.desc}</div><div class="ci-meta">${fmt(c.ts)}</div></div>`).join(''):'<p style="color:var(--muted);font-size:13px;">No concerns raised in this zone.</p>';
  document.getElementById('zh-approval-list').innerHTML=mySZHs.map((s,i)=>{const days=[1,5,9][i%3];const st=days<=7?'g':days<=10?'y':'r';return`<div class="ap-item"><div><div class="ai-name">${s.name}</div><div class="ai-sub">Reviewed ${days} day(s) ago</div></div>${bdg(st,days<=7?'Green':days<=10?'Yellow':'Red')}</div>`;}).join('');'''

loadzh_new = '''const mySZHs=SZH.filter(s=>s.zone===z.id);
  document.getElementById('zh-subzone-list').innerHTML = mySZHs.map(s=>`<div class="sb-nav" style="font-size:13px;padding:8px 12px;margin-bottom:2px;" onclick="switchZhTab('subzone', '${s.id}', '${s.floor}')"><span class="ni"><i class="fa-solid fa-arrow-right"></i></span>${s.floor}</div>`).join('');
  document.getElementById('zh-remark-target').innerHTML='<option value="">— Select —</option>'+mySZHs.map(s=>`<option value="${s.id}">${s.name} (${s.floor})</option>`).join('');
  
  const zc=db.complaints.filter(c=>c.zone===z.id);
  document.getElementById('zh-complaints').innerHTML=zc.length?zc.map(c=>{
     const subName = c.subzone || 'Unknown';
     const incharge = mySZHs.find(s=>s.floor===subName)?.name || 'Unknown';
     return `<div class="ci"><div class="ci-top"><span class="ci-ztag">${subName}</span>${bdg(c.status==='Resolved'?'g':'y',c.status)}</div><div class="ci-desc">${c.desc}</div><div class="ci-meta">Incharge: ${incharge} · Uploaded: ${fmt(c.ts)} · Action Taken: ${c.status==='Resolved'?fmt(c.solvedTs):'No'}</div></div>`;
  }).join(''):'<p style="color:var(--muted);font-size:13px;">No concerns raised in this zone.</p>';'''

content = content.replace(loadzh_orig, loadzh_new)

# Update addRemark to save to db.remarks
addremark_orig = '''function addRemark(){const sel=document.getElementById('zh-remark-target').value;const txt=document.getElementById('zh-remark-text').value.trim();if(!sel){showToast('Please select a Sub-Zonal Head.');return;}if(!txt){showToast('Please enter your review remarks.');return;}showToast('Remark submitted successfully.');document.getElementById('zh-remark-target').value='';document.getElementById('zh-remark-text').value='';}'''

addremark_new = '''function addRemark(){const sel=document.getElementById('zh-remark-target').value;const txt=document.getElementById('zh-remark-text').value.trim();if(!sel){showToast('Please select a Sub-Zonal Head.');return;}if(!txt){showToast('Please enter your review remarks.');return;}
  if(!db.remarks) db.remarks = [];
  const sz = SZH.find(s=>s.id===sel);
  db.remarks.unshift({id:'R'+Date.now(), szId:sz.id, szName:sz.floor, text:txt, ts:new Date(), author:currentUser.name});
  showToast('Remark submitted successfully.');document.getElementById('zh-remark-target').value='';document.getElementById('zh-remark-text').value='';
  loadRemarksHistory();
}'''

content = content.replace(addremark_orig, addremark_new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Zonal Panel Updated")
