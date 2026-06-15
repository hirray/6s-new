import sys
import re

file_path = 'c:/Users/lenovo/Desktop/6s/gsfcu6s-android/gsfcu6s-android/app/src/main/assets/index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# I will replace the Master Dashboard section using split
parts = content.split('<!-- ══════════════════════════════════════\n     LEVEL 4 — ADMIN / CORE COMMITTEE')
if len(parts) < 2:
    print("Level 4 start not found!")
    sys.exit(1)

head = parts[0]
tail = parts[1]

# In tail, replace the sidebar menu
sb_old = '''<div class="sb-nav active"><span class="ni"><i class="fa-solid fa-map"></i></span>Master Dashboard</div>
        <div class="sb-nav"><span class="ni"><i class="fa-solid fa-users"></i></span>All Zones</div>
        <div class="sb-nav"><span class="ni"><i class="fa-solid fa-tower-broadcast"></i></span>Advisories</div>'''
sb_new = '''<div class="sb-nav active" id="adm-nav-dashboard" onclick="switchAdmTab('dashboard')"><span class="ni"><i class="fa-solid fa-map"></i></span>Master Dashboard</div>
        <div class="sb-nav" id="adm-nav-allzones" onclick="switchAdmTab('allzones')"><span class="ni"><i class="fa-solid fa-users"></i></span>All Zones (6S Analysis)</div>
        <div class="sb-nav" id="adm-nav-advisories" onclick="switchAdmTab('advisories')"><span class="ni"><i class="fa-solid fa-tower-broadcast"></i></span>Advisories</div>'''
tail = tail.replace(sb_old, sb_new)

# In tail, find the start of main-area content, right after `<div class="gold-rule"></div>`
gr_pos = tail.find('<div class="gold-rule"></div>')
if gr_pos == -1:
    print("gold-rule not found in tail!")
    sys.exit(1)

gr_pos += len('<div class="gold-rule"></div>')

# Find where the script starts: `<script>` or something? No, `</div>\n  </div>\n</div>\n\n<!-- ── JAVASCRIPT LOGIC ── -->`
end_pos = tail.find('<!-- ── JAVASCRIPT LOGIC ── -->')
if end_pos == -1:
    end_pos = tail.find('</script>')
    
# Wait, let's just do a string replacement for the grid-4 and campus map to put them in a tab
# Wait, it's easier to just rebuild the `tail`'s HTML part.

# Let's write a regex or string replacement.
new_main_area = '''

        <div id="adm-tab-dashboard" style="display:block;">
          <div class="grid-4" style="margin-bottom:28px;">
            <div class="sc sc-maroon"><div class="sc-top"><div class="sc-ico"><i class="fa-solid fa-map"></i></div></div><div class="sc-num" id="adm-zones">8</div><div class="sc-lbl">Total Zones</div></div>
            <div class="sc sc-green"><div class="sc-top"><div class="sc-ico"><i class="fa-solid fa-circle-check"></i></div></div><div class="sc-num" id="adm-green">5</div><div class="sc-lbl">Green Zones</div></div>
            <div class="sc sc-gold"><div class="sc-top"><div class="sc-ico"><i class="fa-solid fa-triangle-exclamation"></i></div></div><div class="sc-num" id="adm-yellow">2</div><div class="sc-lbl">Yellow Zones</div></div>
            <div class="sc sc-red"><div class="sc-top"><div class="sc-ico"><i class="fa-solid fa-circle-exclamation"></i></div></div><div class="sc-num" id="adm-red">1</div><div class="sc-lbl">Red Zones</div></div>
          </div>
          <div class="card">
            <div class="card-hdr">
              <div class="card-title"><div class="card-icon ci-maroon"><i class="fa-solid fa-map"></i></div>Live Campus Zone Map — Annexure I</div>
            </div>
            <p style="font-size:13px;color:var(--muted);margin-bottom:18px;">Hover over any zone number for detailed compliance data and progress breakdown.</p>
            <div id="campus-map-wrap">
              <!-- SVG map will be injected here by original code -->
            </div>
          </div>
        </div>

        <div id="adm-tab-allzones" style="display:none;">
          <div class="card" style="margin-bottom:20px;">
            <div class="card-hdr"><div class="card-title"><div class="card-icon ci-gold"><i class="fa-solid fa-chart-pie"></i></div>6S Methodology Compliance Analysis</div></div>
            <p style="font-size:13px;color:var(--muted);margin-bottom:15px;">Overall campus compliance broken down by the 6S pillars.</p>
            <div class="grid-3" style="gap:15px;">
              <div style="background:#f9f9f9;padding:15px;border-radius:8px;text-align:center;">
                <div style="font-size:24px;font-weight:700;color:var(--green);">88%</div>
                <div style="font-size:13px;font-weight:600;">1S - Sort (Seiri)</div>
              </div>
              <div style="background:#f9f9f9;padding:15px;border-radius:8px;text-align:center;">
                <div style="font-size:24px;font-weight:700;color:var(--yellow);">76%</div>
                <div style="font-size:13px;font-weight:600;">2S - Set in order (Seiton)</div>
              </div>
              <div style="background:#f9f9f9;padding:15px;border-radius:8px;text-align:center;">
                <div style="font-size:24px;font-weight:700;color:var(--green);">92%</div>
                <div style="font-size:13px;font-weight:600;">3S - Shine (Seiso)</div>
              </div>
              <div style="background:#f9f9f9;padding:15px;border-radius:8px;text-align:center;">
                <div style="font-size:24px;font-weight:700;color:var(--yellow);">71%</div>
                <div style="font-size:13px;font-weight:600;">4S - Standardize (Seiketsu)</div>
              </div>
              <div style="background:#f9f9f9;padding:15px;border-radius:8px;text-align:center;">
                <div style="font-size:24px;font-weight:700;color:var(--green);">85%</div>
                <div style="font-size:13px;font-weight:600;">5S - Sustain (Shitsuke)</div>
              </div>
              <div style="background:#f9f9f9;padding:15px;border-radius:8px;text-align:center;">
                <div style="font-size:24px;font-weight:700;color:var(--green);">95%</div>
                <div style="font-size:13px;font-weight:600;">6S - Safety</div>
              </div>
            </div>
          </div>
          
          <div class="card">
            <div class="card-hdr"><div class="card-title"><div class="card-icon ci-green"><i class="fa-solid fa-list-check"></i></div>Sub-Zonal Compliance Status</div></div>
            <table class="tbl">
              <thead><tr><th>Zone</th><th>Sub-Zone</th><th>Incharge</th><th>Status</th></tr></thead>
              <tbody id="adm-allzones-list"></tbody>
            </table>
          </div>
        </div>

        <div id="adm-tab-advisories" style="display:none;">
          <div class="grid-2">
            <div>
              <div class="card" style="margin-bottom:20px;">
                <div class="card-hdr"><div class="card-title"><div class="card-icon ci-maroon"><i class="fa-solid fa-tower-broadcast"></i></div>Publish Global Advisory</div></div>
                <div class="fg">
                  <label>Target Zone</label>
                  <select id="adv-target">
                    <option value="All Zones">All Zones (Campus-Wide)</option>
                  </select>
                </div>
                <div class="fg">
                  <label>Target Sub-Zone</label>
                  <select id="adv-subtarget">
                    <option value="All Sub-Zones">All Sub-Zones</option>
                  </select>
                </div>
                <div class="fg">
                  <label>Advisory Content</label>
                  <textarea id="adv-text" placeholder="Type advisory message here…"></textarea>
                </div>
                <button class="btn-p" onclick="publishAdvisory()">Publish Advisory →</button>
              </div>
            </div>
            <div>
              <div class="card">
                <div class="card-hdr"><div class="card-title"><div class="card-icon ci-gold"><i class="fa-solid fa-history"></i></div>Advisory History & Replies</div></div>
                <div id="adm-adv-history"><p style="color:var(--muted);font-size:13px;">No advisories published yet.</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
'''

# Wait, we need to extract the SVG map from tail before replacing.
svg_start = tail.find('<svg id="campus-svg"')
svg_end = tail.find('</svg>') + 6
svg_content = tail[svg_start:svg_end]

# Tooltip
tooltip_start = tail.find('<div id="zone-tooltip"')
tooltip_end = tail.find('</div>', tooltip_start) + 6
tooltip_content = tail[tooltip_start:tooltip_end]

new_main_area = new_main_area.replace('<!-- SVG map will be injected here by original code -->', svg_content + '\n            ' + tooltip_content)

# We replace from `<div class="grid-4"` to `</div>\n    </div>\n  </div>\n</div>`
grid4_start = tail.find('<div class="grid-4"')
admin_screen_end = tail.find('<!-- ── JAVASCRIPT LOGIC ── -->')
# We need to find the exact end of adminScreen. It's just before JAVASCRIPT LOGIC
admin_screen_html_end = tail.rfind('</div>', 0, admin_screen_end)
admin_screen_html_end = tail.rfind('</div>', 0, admin_screen_html_end)
admin_screen_html_end = tail.rfind('</div>', 0, admin_screen_html_end)
admin_screen_html_end = tail.rfind('</div>', 0, admin_screen_html_end)

tail_html = tail[:grid4_start] + new_main_area + tail[admin_screen_end:]
content = head + '<!-- ══════════════════════════════════════\n     LEVEL 4 — ADMIN / CORE COMMITTEE' + tail_html

# Now add Javascript for Master Dashboard
js_add = '''
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
'''

content = content.replace('function loadAdmin(){', js_add + '\nfunction loadAdmin(){')

# Update loadAdmin() to populate the target selects
loadadm_orig = '''document.getElementById('adv-target').innerHTML='<option value="All Zones">All Zones (Campus-Wide)</option>'+ZONES.map(z=>`<option value="${z.id}">Zone ${z.id} - ${z.name}</option>`).join('');'''

loadadm_new = '''
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
'''

content = content.replace(loadadm_orig, loadadm_new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Master Panel Updated")
