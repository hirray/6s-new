const fs = require('fs');
const content = fs.readFileSync('c:/Users/lenovo/Desktop/web 6s/index.html', 'utf8');
const match = content.match(/<image href="data:image\/png;base64,([^"']+)"/);
if (match) {
    fs.writeFileSync('c:/Users/lenovo/Desktop/6s/assets/campus-map.png', Buffer.from(match[1], 'base64'));
    console.log('Extracted map image');
} else {
    console.log('Not found');
}
