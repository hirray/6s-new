import re
with open('c:/Users/lenovo/Desktop/6s/gsfcu6s-android/gsfcu6s-android/app/src/main/assets/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

script_start = text.rfind('<script>')
funcs_in_js = re.findall(r'function (\w+)\(', text[script_start:])
onclicks = re.findall(r'onclick=\"([a-zA-Z0-9_]+)\(', text)

print('Functions in HTML missing in JS:')
missing = set(onclicks) - set(funcs_in_js)
for m in missing:
    print(m)
