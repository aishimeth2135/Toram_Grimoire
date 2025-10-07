import conv from 'chinese-conv'
import findit2 from 'findit2'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const localesPath = path.join(__dirname, '..', '..', 'locales')
const finder = findit2(process.argv[2] || path.join(localesPath, 'zh-TW'))

console.log('-- [Start] --')

const files = []
finder.on('file', function (file) {
  if (path.extname(file) === '.yaml') {
    files.push(file)
  }
})

finder.on('end', async function () {
  console.log('-- [List] --')
  for (const file of files) {
    console.log(`- ${path.basename(file)}`)
  }
  console.log('-- [Start handle] --')
  for (const file of files) {
    const text = await fs.readFile(file, { encoding: 'utf8' })
    const data = conv.sify(text)
    const fileName = path.basename(file)
    console.log(`[handle] ${fileName}`)
    const toPath = path.join(localesPath, 'zh-CN', path.basename(file))
    await fs.writeFile(toPath, data)
    console.log('-> Done')
  }
  console.log('-- [Finished] --')
})
