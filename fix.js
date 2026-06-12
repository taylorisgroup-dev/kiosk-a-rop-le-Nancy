const fs = require('fs');
let html = fs.readFileSync('admin.html', 'utf8');
html = html.replace(/l\\\\'upload/g, "l\\'upload");
fs.writeFileSync('admin.html', html);
console.log('Fixed');
