const fs = require('fs');

const html = fs.readFileSync('c:\\Users\\lenovo\\Desktop\\web 6s\\index.html', 'utf8');
const match = html.match(/<image href="data:image\/png;base64,([^"]+)"/);

if (match && match[1]) {
  const base64Data = match[1];
  fs.writeFileSync('d:\\6s\\assets\\live-map.png', base64Data, 'base64');
  console.log('Map successfully extracted to live-map.png');
} else {
  console.log('Could not find base64 image in index.html');
}
