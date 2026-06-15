import sys

file_path = 'c:/Users/lenovo/Desktop/6s/gsfcu6s-android/gsfcu6s-android/app/src/main/assets/index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Update Level 2 (Sub-Zonal Head)
# Sidebar
szh_nav_old = '''<div class="sb-nav active" id="szh-nav-daily" onclick="switchSzhTab('daily')"><span class="ni"><i class="fa-solid fa-list-check"></i></span>Daily Checklist</div>
        <div class="sb-nav" id="szh-nav-history" onclick="switchSzhTab('history')"><span class="ni"><i class="fa-solid fa-clock-rotate-left"></i></span>History</div>
        <div class="sb-nav" id="szh-nav-concerns" onclick="switchSzhTab('concerns')"><span class="ni"><i class="fa-solid fa-triangle-exclamation"></i></span>Floor Concerns</div>'''

szh_nav_new = '''<div class="sb-nav active" id="szh-nav-daily" onclick="switchSzhTab('daily')"><span class="ni"><i class="fa-solid fa-list-check"></i></span>Daily Checklist</div>
        <div class="sb-nav" id="szh-nav-history" onclick="switchSzhTab('history')"><span class="ni"><i class="fa-solid fa-clock-rotate-left"></i></span>History</div>
        <div class="sb-nav" id="szh-nav-concerns" onclick="switchSzhTab('concerns')"><span class="ni"><i class="fa-solid fa-triangle-exclamation"></i></span>Floor Concerns</div>
        <div class="sb-nav" id="szh-nav-advisories" onclick="switchSzhTab('advisories')"><span class="ni"><i class="fa-solid fa-tower-broadcast"></i></span>Advisories</div>'''
content = content.replace(szh_nav_old, szh_nav_new)

# Add szh-tab-advisories
szh_tab_concerns_end = content.find('<!-- end of concerns tab -->')
if szh_tab_concerns_end == -1:
    szh_tab_concerns_end = content.find('</div>\n\n      </div>\n    </div>\n  </div>\n</div>\n<!-- ══════════════════════════════════════\n     LEVEL 3 — ZONAL HEAD')

szh_tab_advisories = '''
        <div id="szh-tab-advisories" style="display:none;">
          <div class="card">
            <div class="card-hdr"><div class="card-title"><div class="card-icon ci-maroon"><i class="fa-solid fa-tower-broadcast"></i></div>Advisories</div></div>
            <div id="szh-advisories-list"><p style="color:var(--muted);font-size:13px;">No advisories for your sub-zone.</p></div>
          </div>
        </div>
'''

content = content[:szh_tab_concerns_end] + szh_tab_advisories + content[szh_tab_concerns_end:]

# Update Level 3 (Zonal Head)
zh_nav_old = '''<div class="sb-nav active" id="zh-nav-dashboard" onclick="switchZhTab('dashboard')"><span class="ni"><i class="fa-solid fa-building"></i></span>Zone Dashboard</div>
        <div class="sb-nav" onclick="toggleSubZonalLogs()"><span class="ni"><i class="fa-solid fa-chart-bar"></i></span>Sub-Zonal Logs <i id="zh-szl-icon" class="fa-solid fa-chevron-down" style="float:right;margin-top:4px;font-size:12px;"></i></div>
        <div id="zh-subzone-list" style="display:none; padding-left:15px; margin-bottom:10px;"></div>
        <div class="sb-nav" id="zh-nav-remarks" onclick="switchZhTab('remarks')"><span class="ni"><i class="fa-solid fa-pen-to-square"></i></span>Commit Remarks</div>'''

zh_nav_new = '''<div class="sb-nav active" id="zh-nav-dashboard" onclick="switchZhTab('dashboard')"><span class="ni"><i class="fa-solid fa-building"></i></span>Zone Dashboard</div>
        <div class="sb-nav" onclick="toggleSubZonalLogs()"><span class="ni"><i class="fa-solid fa-chart-bar"></i></span>Sub-Zonal Logs <i id="zh-szl-icon" class="fa-solid fa-chevron-down" style="float:right;margin-top:4px;font-size:12px;"></i></div>
        <div id="zh-subzone-list" style="display:none; padding-left:15px; margin-bottom:10px;"></div>
        <div class="sb-nav" id="zh-nav-remarks" onclick="switchZhTab('remarks')"><span class="ni"><i class="fa-solid fa-pen-to-square"></i></span>Commit Remarks</div>
        <div class="sb-nav" id="zh-nav-advisories" onclick="switchZhTab('advisories')"><span class="ni"><i class="fa-solid fa-tower-broadcast"></i></span>Advisories</div>'''

content = content.replace(zh_nav_old, zh_nav_new)

# Add zh-tab-advisories
zh_tab_remarks_end = content.find('</div>\n\n      </div>\n    </div>\n  </div>\n</div>\n<!-- ══════════════════════════════════════\n     LEVEL 4')

zh_tab_advisories = '''
        <div id="zh-tab-advisories" style="display:none;">
          <div class="card">
            <div class="card-hdr"><div class="card-title"><div class="card-icon ci-maroon"><i class="fa-solid fa-tower-broadcast"></i></div>Advisories</div></div>
            <div id="zh-advisories-list"><p style="color:var(--muted);font-size:13px;">No advisories for your zone.</p></div>
          </div>
        </div>
'''

content = content[:zh_tab_remarks_end] + zh_tab_advisories + content[zh_tab_remarks_end:]

# Inject JS for replying to advisories
js_add = '''
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

function loadZhAdvisories() {
  const el = document.getElementById('zh-advisories-list');
  const z = ZONES.find(x => x.head === currentUser.id);
  if(!z || !db.advisories) {
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
  if(!sz || !db.advisories) {
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
'''

content = content.replace('function switchSzhTab(tab) {', js_add + '\nfunction __old_switchSzhTab(tab) {')
content = content.replace('function switchZhTab(tab, szId, szName) {', '\nfunction __old_switchZhTab(tab, szId, szName) {')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Advisories tabs added")
