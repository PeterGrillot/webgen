import { exec } from 'child_process'
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
const __dist = config.root === '.' ? '' : config.root
const __pages = 'pages/'
const __views = 'views/'
const pagesDir = path.join(__dirname, __pages)
const distDir = path.join(__dirname, __dist)

async function build() {
  // Clean Dist
  if (config.root !== '.') {
    await cleanDir(path.join(distDir))
    console.info('💾 Copying Files... 💾')
    await copyDir(path.join(__dirname, '/styles/'), path.join(distDir, '/styles/'))
    await copyDir(path.join(__dirname, '/static/'), path.join(distDir, '/static/'))

  }

  // Copy CSS and Static Files
  // Add any preprocess stuff here!
  // series([
  //   () => exec('tsc dir/index.ts -o static/index.js'),
  //   () => exec('postcss --use autoprefixer -o styles/main.css static/*.css')
  //  ]); 

  // Read markdown files from `pages` directory
  console.info('📖 Reading `pages` directory... 📖')
  const docFilesOrDirList = await readdir(pagesDir)
  const nestedDocsList = await createNestedDocsList(docFilesOrDirList, pagesDir)

  const flatPagination = flattenPagination(nestedDocsList)

  // Build out entire Document Structure
  const fullDocs = await createFullPagination(flatPagination, pagesDir)

  console.info(`📕 Pages built from \`pages\`:\n\t📝 ${fullDocs.map(i => i.href).join('\n\t📝 ')}`)

  // Write to EJS and render to HTML
  console.info('🏁 Finish building pages 🏁')
  const template = path.join(__dirname, __views, 'index.ejs')
  fullDocs.forEach(async (doc, index) => {
    const { href, html, isNested, ...rest } = doc
    const baseOptions = {
      ...config,
      href,
      isNested,
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
  if (process.env.IS_BUILD) {
    let buildRoot = config.root === '.' ? '' : config.root
    exec(`npx http-server -s ${buildRoot}`)
    console.info(`📡 Serving at http://localhost:8080/${buildRoot} 📡`)
  }
}

build()