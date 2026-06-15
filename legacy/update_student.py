import sys
import re

file_path = 'c:/Users/lenovo/Desktop/6s/gsfcu6s-android/gsfcu6s-android/app/src/main/assets/index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove "my activity" from left panel
content = content.replace('<div class="sb-nav"><span class="ni"><i class="fa-solid fa-chart-line"></i></span>My Activity</div>', '')

# 2. Add subzone option in new concern
subzone_html = '''
            <div class="fg" id="stu-subzone-fg"><label>Sub-Zone *</label>
              <input type="text" id="stu-subzone" placeholder="Enter Sub-Zone" style="width:100%;padding:10px;border-radius:8px;border:1px solid #ccc;background:var(--cream2);font-family:inherit;">
            </div>
'''
content = content.replace('</select>\n            </div>\n            <div class="fg"><label>Concern Description *</label>', '</select>\n            </div>' + subzone_html + '\n            <div class="fg"><label>Concern Description *</label>')

# 3. Remove 3 sections
sc_html = '''<div class="grid-3" style="margin-bottom:24px;">
          <div class="sc sc-maroon"><div class="sc-top"><div class="sc-ico"><i class="fa-solid fa-clipboard-list"></i></div></div><div class="sc-num" id="stu-total">0</div><div class="sc-lbl">All concerns you've raised so far</div></div>
          <div class="sc sc-green"><div class="sc-top"><div class="sc-ico"><i class="fa-solid fa-circle-check"></i></div></div><div class="sc-num" id="stu-res">0</div><div class="sc-lbl">Concerns successfully addressed</div></div>
          <div class="sc sc-gold"><div class="sc-top"><div class="sc-ico"><i class="fa-solid fa-hourglass-half"></i></div></div><div class="sc-num" id="stu-pen">0</div><div class="sc-lbl">Pending Review</div></div>
        </div>'''
content = content.replace(sc_html, '')

# 4. Modify how complaints are rendered
refresh_stu = '''el.innerHTML=mine.map(c=>`<div class="ci"><div class="ci-top"><span class="ci-ztag">Zone ${c.zone} — ${c.zoneName}</span>${bdg(c.status==='Resolved'?'g':'y',c.status)}</div><div class="ci-desc">${c.desc}</div><div class="ci-meta">${c.hasPhoto?'[Photo] Photo attached · ':''}${fmt(c.ts)} · ${c.id}</div></div>`).join('');'''
new_refresh_stu = '''el.innerHTML=mine.map(c=>`<div class="ci"><div class="ci-top"><span class="ci-ztag">Zone ${c.zone} — ${c.zoneName} ${c.subzone ? '(' + c.subzone + ')' : ''}</span>${bdg(c.status==='Resolved'?'g':'y',c.status)}</div><div class="ci-desc">${c.desc}</div>${c.remark ? '<div class="ci-desc" style="margin-top:8px;padding:8px;background:var(--cream2);border-radius:4px;"><b>Zonal Head Remark:</b> ' + c.remark + '</div>' : ''}${c.solvedPhoto ? '<div style="margin-top:8px;"><img src="'+c.solvedPhoto+'" style="max-width:100%;border-radius:4px;"></div>' : ''}<div class="ci-meta">${c.hasPhoto?'[Photo] Photo attached · ':''}${fmt(c.ts)} · ${c.id}</div></div>`).join('');'''
content = content.replace(refresh_stu, new_refresh_stu)

# 5. Modify submit to include subzone
submit_comp = '''const c={id:'C'+Date.now(),studentId:currentUser.id,zone:parseInt(zone),zoneName:ZONES[parseInt(zone)-1].area,desc,hasPhoto:!!document.getElementById('stu-photo').files[0],ts:new Date(),status:'Pending'};'''
new_submit_comp = '''const subzone=document.getElementById('stu-subzone')?document.getElementById('stu-subzone').value:''; const c={id:'C'+Date.now(),studentId:currentUser.id,zone:parseInt(zone),zoneName:ZONES[parseInt(zone)-1].area,subzone,desc,hasPhoto:!!document.getElementById('stu-photo').files[0],ts:new Date(),status:'Pending'};'''
content = content.replace(submit_comp, new_submit_comp)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Student Panel Updated')
