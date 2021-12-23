const path = require('path');
const fs = require('fs').promises;

const localesPath = path.join(__dirname, '..', '..', 'locales');

const finder = require('findit2')(process.argv[2] || path.join(localesPath, 'zh-TW'));
const conv = require('chinese-conv');

console.log('start...');

const files = [];
finder.on('file', function (file) {
  if (path.extname(file) === '.yaml') {
    files.push(file);
  }
});

finder.on('end', async function() {
  console.log('start handle...');
  console.log(files);
  for (file of files) {
    const text = await fs.readFile(file, { encoding: 'utf8' });
    const data = conv.sify(text);
    console.log(`[handle] ${file}`);
    const toPath = path.join(localesPath, 'zh-CN', path.basename(file));
    console.log(`  -> ${toPath}`);
    await fs.writeFile(toPath, data);
    console.log('...success');
  }
  console.log('Finished');
});