import re

file_path = 'c:/Users/lenovo/Desktop/6s/gsfcu6s-android/gsfcu6s-android/app/src/main/assets/index.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Let's find function loadSZH() and replace it entirely
def replace_func(func_name, new_code, content):
    pattern = r'function\s+' + func_name + r'\s*\([^)]*\)\s*\{'
    match = re.search(pattern, content)
    if not match:
        return content
    
    start_idx = match.start()
    brace_count = 0
    in_string = False
    string_char = ''
    i = start_idx
    
    # Fast forward to the first brace
    while i < len(content) and content[i] != '{':
        i += 1
    
    brace_count = 1
    i += 1
    
    while i < len(content) and brace_count > 0:
        c = content[i]
        
        if in_string:
            if c == string_char and content[i-1] != '\\':
                in_string = False
        else:
            if c in '"\'`':
                in_string = True
                string_char = c
            elif c == '{':
                brace_count += 1
            elif c == '}':
                brace_count -= 1
                
        i += 1
        
    end_idx = i
    
    return content[:start_idx] + new_code + content[end_idx:]

new_loadSZH = """function loadSZH() {
  switchSzhTab('daily');
  const myC = db.complaints.filter(c => c.subzone === SZH.find(x=>x.id===currentUser.id)?.floor);
  const pending = myC.filter(c=>c.status==='Pending');
  const history = myC.filter(c=>c.status==='Resolved');
  
  let pEl = document.getElementById('szh-floor-pending');
  if(pEl) pEl.innerHTML = pending.length ? pending.map(c=>`<div class="ci"><div class="ci-desc">${c.desc}</div><div class="ci-meta">${fmt(c.ts)}</div><button class="btn-p" style="margin-top:10px;" onclick="resolveConcernUI('${c.id}')">Resolve & Add Comment</button></div>`).join('') : '<p style="color:var(--muted);font-size:13px;">No pending concerns.</p>';
  
  let hEl = document.getElementById('szh-floor-history');
  if(hEl) hEl.innerHTML = history.length ? history.map(c=>`<div class="ci"><div class="ci-desc">${c.desc}</div><div class="ci-meta">Solved at: ${fmt(c.solvedTs||c.ts)} - Remark: ${c.remark||'None'}</div>${c.solvedPhoto ? '<img src="'+c.solvedPhoto+'" style="max-height:100px;margin-top:5px;border-radius:4px;">' : ''}</div>`).join('') : '<p style="color:var(--muted);font-size:13px;">No history.</p>';
}"""

content = replace_func('loadSZH', new_loadSZH, content)

# Remove the old switchSzhTab if there are duplicates
# Actually, the python injected switchSzhTab might be somewhere else, or the old one is there
content = replace_func('switchSzhTab', '', content)

new_switchSzhTab = """function switchSzhTab(tab) {
  let tabs = ['daily', 'history', 'floor'];
  tabs.forEach(t => {
    let el = document.getElementById('szh-tab-' + t);
    if(el) el.style.display = 'none';
  });
  
  let activeTab = document.getElementById('szh-tab-' + tab);
  if(activeTab) activeTab.style.display = 'block';
  
  let titles = {'daily': 'Daily Inspection', 'history': 'History', 'floor': 'Floor Concerns'};
  let bc = document.getElementById('szh-bc');
  let tEl = document.getElementById('szh-title');
  if(bc) bc.textContent = titles[tab];
  if(tEl) tEl.textContent = titles[tab];
  
  // Remove active from all nav items and add to current
  document.querySelectorAll('#subzonalScreen .sb-nav').forEach(n => {
    n.classList.remove('active');
    if (n.getAttribute('onclick') && n.getAttribute('onclick').includes("'" + tab + "'")) {
        n.classList.add('active');
    }
  });
}"""

# Inject new switchSzhTab after loadSZH
content = content.replace(new_loadSZH, new_loadSZH + "\\n\\n" + new_switchSzhTab)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed JS for Sub-Zonal screen")
