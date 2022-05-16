import { readdir, copyFile, mkdir } from 'fs/promises'
import * as path from 'path'
import * as config from '../config.json'
import * as tsConfig from '../tsconfig.json'
import {
  cleanDir,
  copyDir,
  removeIndex,
  flattenPagination,
  createNestedDocsList,
  createFullPagination,
  buildPages,
} from './helpers'

// Constants
const __filename = tsConfig.compilerOptions.baseUrl
const __dirname = path.dirname(__filename)
const __dist = 'dist/'
const __docs = 'docs/'
const __views = 'views/'
const docsDir = path.join(__dirname, __docs)
const distDir = path.join(__dirname, __dist)

async function build() {
  // Clean Dist
  await cleanDir(path.join(distDir))

  // Copy CSS
  console.info('💾 Copying Files... 💾')
  copyFile(path.join(__dirname, '/styles/main.css'), path.join(distDir, 'styles.css'))
  await copyDir(path.join(__dirname, '/static/'), path.join(distDir, '/static/'))

  // Read markdown files from `docs` directory
  console.info('📖 Reading `docs` directory... 📖')
  const docFilesOrDirList = await readdir(docsDir)
  const nestedDocsList = await createNestedDocsList(docFilesOrDirList, docsDir)

  const flatPagination = flattenPagination(nestedDocsList)

  // Build out entire Document Structure
  const fullDocs = await createFullPagination(flatPagination, docsDir)

  console.info(`📕 Pages built from \`docs\`:\n\t📝 ${fullDocs.map(i => i.href).join('\n\t📝 ')}`)

  // Write to EJS and render to HTML
  console.info('🏁 Finish building pages 🏁')
  const template = path.join(__dirname, __views, 'index.ejs')
  fullDocs.forEach(async (doc, index) => {
    const { href, html, isNested, ...rest } = doc
    const baseOptions = {
      ...config,
      ...rest,
      doc: html
    }
    const target = path.join(distDir, href)
    if (isNested) {
      const subDir = removeIndex(href.split('/')[0])
      try {
        await mkdir(path.join(distDir, subDir))
      } catch (_e) {
        // Expect `mkdir exists` error
      }
      await buildPages(template, baseOptions, target)
    } else {
      await buildPages(template, baseOptions, target)
    }
  })
  console.info('🎉 Done! 🎉')
}

build()