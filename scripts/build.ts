import * as Markdown from 'markdown-it'
import { writeFile, readdir, copyFile } from 'fs/promises'
import * as ejs from 'ejs'
import * as path from 'path'
import * as config from '../config.json'
import * as tsConfig from '../tsconfig.json'
import { readContent, copyDir, cleanDir } from './helpers'

// Constants
const __filename = tsConfig.compilerOptions.baseUrl
const __dirname = path.dirname(__filename)
const __dist = 'dist/'

async function build() {
  // Clean Dist
  await cleanDir(path.join(__dirname, __dist))

  // Copy CSS
  console.log('💾 Copying Files... 💾')
  copyFile(path.join(__dirname, '/styles/main.css'), path.join(__dirname, __dist, 'styles.css'))
  await copyDir(path.join(__dirname, '/static/'), path.join(__dirname, __dist, '/static/'))

  // Read markdown files from `docs` directory
  console.log('📖 Reading `docs` directory... 📖')
  const readDocs = await readdir('./docs/')
  const docs = await Promise.all(readDocs.map(async (doc) => {
    const text = await readContent(`./docs/${doc}`)
    const html = Markdown().render(text)
    return html
  }))

  // Create Pages
  console.log('⚙️  Creating pages... ⚙️')
  const basePagination = readDocs.map((page, index) => {
    const removedIndex = page.split('.')[0].replace(/([0-9][0-9]_)+/gm, '')
    const removedUnderscore = removedIndex.replace(/_/gm, ' ')
    return {
      name: removedUnderscore,
      href: `${index === 0 ? 'index' : removedIndex}.html`,
    }
  })

  // Add pagination
  const pages = basePagination.map((page, index) => {
    const prev = index - 1 !== -1 ? { ...basePagination[index - 1] } : null
    const next = index + 1 < basePagination.length ? { ...basePagination[index + 1] } : null
    return {
      ...page,
      prev,
      next,
    }
  })
  console.log(`📕 Pages built from \`docs\`:\n\t📝 ${pages.map(i => i.href).join('\n\t📝 ')}`)

  // Write to EJS and render to HTML
  console.log('🏁 Finishing building pages 🏁')
  docs.forEach((doc, index) => {
    const options = { ...config, doc, pages, nav: pages[index] }
    ejs.renderFile('./views/index.ejs', options, async (err, html) => {
      const { href } = pages[index]
      const compressedHtml = html.replace(/^\s+|\s+$|\n(?=((?!<\/pre).)*?(<pre|$))/sg, "")
      try {
        await writeFile(`./${__dist}/${href}`, `<!-- Generated Code | Do Not Edit -->${compressedHtml}`)
      } catch (e) {
        console.log(e)
      }
    })
  })
}

build()