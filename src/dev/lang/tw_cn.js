import { sify } from 'chinese-conv'
import findit2 from 'findit2'
import fs from 'node:fs/promises'
import path from 'node:path'

const finder = findit2(process.argv[2] || path.join(import.meta.dirname, '..', '..'))

console.log('start...')

const files = []
finder.on('file', function (file) {
  if (path.basename(file) === 'zh_tw.js') {
    files.push(file)
  }
})

finder.on('end', async function () {
  console.log('start handle...')
  console.log(files)
  for (const file of files) {
    const text = await fs.readFile(file, { encoding: 'utf8' })
    const data = sify(text)
    console.log('handle: ' + file)
    await fs.writeFile(path.dirname(file) + '/' + 'zh_cn.js', data)
    console.log('...success')
  }
  console.log('Finished')
})
