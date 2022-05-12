import * as Markdown from 'markdown-it'
import { writeFile, readdir, copyFile } from 'fs/promises'
import * as ejs from 'ejs'
import * as path from 'path'
import * as config from '../config.json'
import * as tsConfig from '../tsconfig.json'
import { readContent, copyDir, cleanDir } from './helpers'
import { lstatSync } from 'fs'

// Constants
const __filename = tsConfig.compilerOptions.baseUrl
const __dirname = path.dirname(__filename)
const __dist = 'dist/'
const __docs = 'docs/'

async function build() {
  // Clean Dist
  await cleanDir(path.join(__dirname, __dist))

  // Copy CSS
  console.info('💾 Copying Files... 💾')
  copyFile(path.join(__dirname, '/styles/main.css'), path.join(__dirname, __dist, 'styles.css'))
  await copyDir(path.join(__dirname, '/static/'), path.join(__dirname, __dist, '/static/'))

  // Read markdown files from `docs` directory
  console.info('📖 Reading `docs` directory... 📖')
  const readDocs = await readdir('./docs/')
  const docs = await Promise.all(readDocs.map(async (doc) => {
    const __docDir = path.join(__dirname, __docs, doc)
    const isDir = lstatSync(__docDir).isDirectory()
    if (!isDir) {
      let html = await readContent(__docDir)
      if (path.extname(doc) === '.md') {
        return Markdown().render(html)
      }
      return html
    }
    let nestedDir = await readdir(__docDir)
    const nestedDocs = await Promise.all(nestedDir.map(async (doc) => {
      let html = await readContent(path.join(__docDir, doc))
      if (path.extname(doc) === '.md') {
        return Markdown().render(html)
      }
      return html
    }))
    return nestedDocs
  }))

  // Create Pages
  console.info('⚙️  Creating pages... ⚙️')
  const basePagination = readDocs.map((page, index) => {
    const __pageDir = path.join(__dirname, __docs, page)
    const isDir = lstatSync(__pageDir).isDirectory()
    if (!isDir) {
      const removedIndex = page.split('.')[0].replace(/([0-9][0-9]_)+/gm, '')
      const removedUnderscore = removedIndex.replace(/_/gm, ' ')
      return {
        name: removedUnderscore,
        href: `${index === 0 ? 'index' : removedIndex}.html`,
      }
    }
    console.log(__pageDir)
    return {}
    const removedIndex = page.split('.')[0].replace(/([0-9][0-9]_)+/gm, '')
    const removedUnderscore = removedIndex.replace(/_/gm, ' ')
    return {
      name: removedUnderscore,
      href: `${index === 0 ? 'index' : removedIndex}.html`,
    }
  })
  console.log(basePagination)
  return

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
  console.info(`📕 Pages built from \`docs\`:\n\t📝 ${pages.map(i => i.href).join('\n\t📝 ')}`)

  // Write to EJS and render to HTML
  console.info('🏁 Finishing building pages 🏁')
  docs.forEach((doc, index) => {
    const options = { ...config, doc, pages, nav: pages[index] }
    ejs.renderFile('./views/index.ejs', options, async (err, html) => {
      const { href } = pages[index]
      const compressedHtml = html.replace(/^\s+|\s+$|\n(?=((?!<\/pre).)*?(<pre|$))/sg, "")
      try {
        await writeFile(`./${__dist}/${href}`, `<!-- Generated Code | Do Not Edit -->${compressedHtml}`)
      } catch (e) {
        console.info(e)
      }
    })
  })
}

build()