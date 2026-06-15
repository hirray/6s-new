import sys
import re

file_path = 'c:/Users/lenovo/Desktop/6s/gsfcu6s-android/gsfcu6s-android/app/src/main/assets/index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the subzonalScreen HTML
subzonal_html_old_pattern = r'<div id="subzonalScreen" class="screen">.*?</div>\s*</div>\s*</div>'
# Actually I can just find <div id="subzonalScreen" class="screen"> and replace up to LEVEL 3
# Wait, LEVEL 3 starts with <!-- ══════════════════════════════════════
#      LEVEL 3 — ZONAL HEAD

new_subzonal_html = '''<div id="subzonalScreen" class="screen">
  <div class="app-layout">
    <aside class="sidebar">
      <div class="sb-header">
        <div class="sb-logo-row"><div class="sb-icon"><img src="data:image/jpeg;base64,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" alt="GSFCU Logo" style="width:100%; height:100%; object-fit:contain; border-radius: inherit;"></div><div class="sb-brand"><h1>GSFC University</h1><p>6S Monitor</p></div></div>
        <div class="sb-divider"></div>
        <div class="sb-section-label">Sub-Zonal Panel</div>
        <div class="sb-nav active" onclick="switchSzhTab('daily')"><span class="ni"><i class="fa-solid fa-clipboard-check"></i></span>Daily Checklist</div>
        <div class="sb-nav" onclick="switchSzhTab('history')"><span class="ni"><i class="fa-solid fa-calendar-days"></i></span>History</div>
        <div class="sb-nav" onclick="switchSzhTab('floor')"><span class="ni"><i class="fa-solid fa-folder-open"></i></span>Floor Concerns</div>
      </div>
      <div class="sb-bottom">
        <div class="sb-user"><div class="sb-avatar"><i class="fa-solid fa-user-helmet-safety"></i></div><div><div class="sb-uname" id="szh-uname">Sub-Zonal Head</div><div class="sb-urole" id="szh-urole">Level 2</div></div></div>
        <button class="btn-logout" onclick="logout()">← Sign Out</button>
      </div>
    </aside>

    <div class="main-area">
      <div class="top-bar">
        <div class="tb-breadcrumb">GSFCU 6S Monitor &rsaquo; <strong id="szh-bc">Daily Inspection</strong></div>
        <div class="tb-right"><div id="szh-status-badge"></div><span class="tb-badge tb-l2">Level 2 — Sub-Zonal Head</span></div>
      </div>
      <div class="pg">
        <div class="pg-header">
          <div class="pg-eyebrow"><div class="edot"></div>Sub-Zonal Head Panel</div>
          <h2 id="szh-title">Daily Inspection</h2>
          <p id="szh-sub">Complete your daily 6S facility inspection and log timestamps</p>
        </div>
        <div class="gold-rule"></div>
        
        <div id="szh-tab-daily" style="display:block;">
          <div class="card">
            <div class="card-hdr"><div class="card-title"><div class="card-icon ci-maroon"><i class="fa-solid fa-clipboard-list"></i></div>Today's 6S Checklist</div></div>
            <div id="checklist-items"></div>
            <div style="margin-top:18px;display:flex;justify-content:space-between;align-items:center;">
              <button class="btn-p" onclick="submitChecklist()">Submit Inspection →</button>
              <span id="szh-progress-txt" style="font-size:12px;color:var(--muted);font-weight:600;"></span>
            </div>
            <div style="margin-top:12px;"><div style="font-size:11px;color:var(--muted);font-weight:600;margin-bottom:5px;">Completion Progress</div><div class="progress-bar"><div class="progress-fill" id="progress-fill" style="width:0%"></div></div></div>
          </div>
        </div>

        <div id="szh-tab-history" style="display:none;">
          <div class="card" style="margin-bottom:20px;">
            <div class="card-hdr"><div class="card-title"><div class="card-icon ci-gold"><i class="fa-solid fa-calendar-days"></i></div>All History</div></div>
            <table class="tbl"><thead><tr><th>Date</th><th>Submitted At</th><th>Status</th></tr></thead><tbody id="szh-history"></tbody></table>
          </div>
        </div>

        <div id="szh-tab-floor" style="display:none;">
          <div class="card" style="margin-bottom:20px;">
            <div class="card-hdr"><div class="card-title"><div class="card-icon ci-red"><i class="fa-solid fa-folder-open"></i></div>Pending Floor Concerns</div></div>
            <div id="szh-floor-pending"><p style="color:var(--muted);font-size:13px;">No pending concerns.</p></div>
          </div>
          <div class="card">
            <div class="card-hdr"><div class="card-title"><div class="card-icon ci-green"><i class="fa-solid fa-check-circle"></i></div>History of Concerns</div></div>
            <div id="szh-floor-history"><p style="color:var(--muted);font-size:13px;">No history.</p></div>
          </div>
        </div>

      </div>
    </div>
  </div>
</div>'''

parts = content.split('<!-- ══════════════════════════════════════\n     LEVEL 3 — ZONAL HEAD')
head = parts[0]
tail = parts[1]

# Find the start of the active subzonalScreen
head = re.sub(r'<div id="subzonalScreen" class="screen">.*', new_subzonal_html, head, flags=re.DOTALL)

content = head + '<!-- ══════════════════════════════════════\n     LEVEL 3 — ZONAL HEAD' + tail

# Inject JS for Subzonal functionality
js_add = '''
function switchSzhTab(tab) {
  document.getElementById('szh-tab-daily').style.display = 'none';
  document.getElementById('szh-tab-history').style.display = 'none';
  document.getElementById('szh-tab-floor').style.display = 'none';
  document.getElementById('szh-tab-' + tab).style.display = 'block';
  
  let titles = {'daily': 'Daily Inspection', 'history': 'History', 'floor': 'Floor Concerns'};
  document.getElementById('szh-bc').textContent = titles[tab];
  document.getElementById('szh-title').textContent = titles[tab];
}

function resolveConcernUI(cid) {
  const remark = prompt("Enter remark for solving the concern:");
  if(remark === null) return;
  const photoInput = document.createElement('input');
  photoInput.type = 'file';
  photoInput.accept = 'image/*';
  photoInput.onchange = e => {
    const file = e.target.files[0];
    if(file) {
      const reader = new FileReader();
      reader.onload = e2 => {
        completeConcern(cid, remark, e2.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      completeConcern(cid, remark, null);
    }
  };
  if(confirm("Do you want to upload a photo of the solved concern?")) {
    photoInput.click();
  } else {
    completeConcern(cid, remark, null);
  }
}

function completeConcern(cid, remark, photo) {
  const c = db.complaints.find(x => x.id === cid);
  if(c) {
    c.status = 'Resolved';
    c.remark = remark;
    c.solvedPhoto = photo;
    c.solvedTs = new Date();
    showToast('Concern marked as resolved.');
    loadSZH();
  }
}
'''

content = content.replace('function updProg(){', js_add + '\nfunction updProg(){')

loadszh_orig = '''const zc=db.complaints.filter(c=>c.zone===s.zone);
  document.getElementById('szh-floor-complaints').innerHTML=zc.length?zc.map(c=>`<div class="ci"><div class="ci-desc">${c.desc}</div><div class="ci-meta">${fmt(c.ts)}</div></div>`).join(''):'<p style="color:var(--muted);font-size:13px;">No complaints in your zone yet.</p>';'''

loadszh_new = '''const zc=db.complaints.filter(c=>c.zone===s.zone);
  const pending = zc.filter(c=>c.status==='Pending');
  const history = zc.filter(c=>c.status==='Resolved');
  document.getElementById('szh-floor-pending').innerHTML=pending.length?pending.map(c=>`<div class="ci"><div class="ci-desc">${c.desc}</div><div class="ci-meta">${fmt(c.ts)}</div><button class="btn-p" style="margin-top:10px;" onclick="resolveConcernUI('${c.id}')">Resolve & Add Comment</button></div>`).join(''):'<p style="color:var(--muted);font-size:13px;">No pending concerns.</p>';
  document.getElementById('szh-floor-history').innerHTML=history.length?history.map(c=>`<div class="ci"><div class="ci-desc">${c.desc}</div><div class="ci-meta">Solved at: ${fmt(c.solvedTs||c.ts)} - Remark: ${c.remark||'None'}</div>${c.solvedPhoto ? '<img src="'+c.solvedPhoto+'" style="max-height:100px;margin-top:5px;border-radius:4px;">' : ''}</div>`).join(''):'<p style="color:var(--muted);font-size:13px;">No history.</p>';'''

content = content.replace(loadszh_orig, loadszh_new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Sub-Zonal Panel Updated")
