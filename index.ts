import * as Markdown from 'markdown-it'
import { readFile, writeFile, readdir, copyFile, rm, mkdir, access } from 'fs/promises'
import * as ejs from 'ejs'
import * as path from 'path';
import * as config from './config.json'
import * as tsConfig from './tsconfig.json'
import { readContent, copyDir } from './utils'

// Constants
const __filename = tsConfig.compilerOptions.baseUrl;
const __dirname = path.dirname(__filename)
const __dist = 'dist/';

async function build() {
  try {
    await access(path.join(__dirname, __dist))
    await rm(path.join(__dirname, __dist), { recursive: true })
    await mkdir(path.join(__dirname, __dist))
  } catch (err) {
    await mkdir(path.join(__dirname, __dist))
  }

  // Copy CSS
  console.log('Copying Files...')
  copyFile(path.join(__dirname, '/styles/main.css'), path.join(__dirname, __dist, 'styles.css'));
  await copyDir(path.join(__dirname, '/static/'), path.join(__dirname, __dist, '/static/'));

  // Read Docs
  console.log('Reading Docs...')
  const readDocs = await readdir('./docs/')
  const docs = await Promise.all(readDocs.map(async (doc) => {
    const text = await readContent(`./docs/${doc}`)
    const html = Markdown().render(text)
    return html
  }))

  // Create Pages
  console.log('Creating pages...')
  const pagesX = readDocs.map((page, index) => {
    return {
      name: page.split('.')[0],
      href: `${page.split('.')[0] === config.index ? 'index' : page.split('.')[0]}.html`,
    }
  })

  // Add pagination
  const pages = pagesX.map((page, index) => {
    const prev = index - 1 !== -1 ? { ...pagesX[index - 1] } : null
    const next = index + 1 < pagesX.length ? { ...pagesX[index + 1] } : null
    return {
      ...page,
      prev,
      next,
    }
  })
  console.log(pages)

  // Write to EJS and render to HTML
  docs.forEach((doc, index) => {
    ejs.renderFile('./views/index.ejs', { ...config, doc, pages, nav: pages[index] }, async (err, str) => {
      const pageName = pages[index].name === config.index ? 'index' : pages[index].name;

      await writeFile(`./${__dist}/${pageName}.html`, `<!-- This is generated, do not edit -->\n${str}`)
    })
  })
}

build()