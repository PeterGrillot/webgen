import { exec, execSync, spawn } from 'child_process'
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
    console.info('š¾ Copying Files... š¾')
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
  console.info('š Reading `pages` directory... š')
  const docFilesOrDirList = await readdir(pagesDir)
  const nestedDocsList = await createNestedDocsList(docFilesOrDirList, pagesDir)

  const flatPagination = flattenPagination(nestedDocsList)

  // Build out entire Document Structure
  const fullDocs = await createFullPagination(flatPagination, pagesDir)

  console.info(`š Pages built from \`pages\`:\n\tš ${fullDocs.map(i => i.href).join('\n\tš ')}`)

  // Write to EJS and render to HTML
  console.info('š Finish building pages š')
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
  console.info('š Done! š')
  if (process.env.IS_BUILD) {
    let buildRoot = config.root === '.' ? '' : config.root
    console.info(`š” Serving ${buildRoot} š”`)
    var exec = require('child_process').exec;
    var child = exec(`npx http-server -o ${buildRoot}`);
    child.stdout.on('data', (data: string) => {
      let message = data.match(/Available on:([\S\s]*)server/g)
      if (message) {
        console.log(`${message}`);
      }
    });
  }
}

build()