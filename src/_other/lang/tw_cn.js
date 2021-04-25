const path = require('path');
const fs = require('fs').promises;
const finder = require('findit2')(process.argv[2] || path.join(__dirname, '..', '..'));
const conv = require('chinese-conv');

console.log('start...');

const files = [];
finder.on('file', function (file) {
  if (path.basename(file) === 'zh_tw.js') {
    files.push(file);
  }
});

finder.on('end', async function() {
  console.log('start handle...');
  console.log(files);
  for (file of files) {
    const text = await fs.readFile(file, { encoding: 'utf8' });
    const data = conv.sify(text);
    console.log('handle: ' + file);
    await fs.writeFile(path.dirname(file) + '/' + 'zh_cn.js', data);
    console.log('...success');
  }
});