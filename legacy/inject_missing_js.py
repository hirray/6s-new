import sys
file_path = 'c:/Users/lenovo/Desktop/6s/gsfcu6s-android/gsfcu6s-android/app/src/main/assets/index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

missing_js = """
function doLogin() {
  const id = document.getElementById('loginId').value.trim().toLowerCase();
  const err = document.getElementById('loginErr');
  err.textContent = '';
  if (!id) {
    err.textContent = 'Please enter a valid Login ID';
    return;
  }
  
  if (id.startsWith('stu')) {
    login('student');
  } else if (id.startsWith('sz')) {
    login('subzonal');
  } else if (id.startsWith('zh')) {
    login('zonal');
  } else if (id.startsWith('admin')) {
    login('admin');
  } else {
    err.textContent = 'Invalid Login ID (try stu01, sz01, zh01, admin)';
  }
}

function triggerUpload() {
  showToast('Photo captured/uploaded via native bridge successfully');
}

function submitChecklist() {
  showToast('Checklist submitted successfully. Progress updated.');
}
</script>
"""

content = content.replace('</script>', missing_js)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Missing functions injected.")
