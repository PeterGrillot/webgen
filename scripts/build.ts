import * as Markdown from 'markdown-it'
import { writeFile, readdir, copyFile, mkdir } from 'fs/promises'
import * as ejs from 'ejs'
import * as path from 'path'
import * as config from '../config.json'
import * as tsConfig from '../tsconfig.json'
import { readContent, copyDir, cleanDir, removeIndex, removeUnderscore, createBasePagination, flattenPagination, buildPages } from './helpers'
import { lstatSync } from 'fs'

// Constants
const __filename = tsConfig.compilerOptions.baseUrl
const __dirname = path.dirname(__filename)
const __dist = 'dist/'
const __docs = 'docs/'
const __views = 'views/'

async function build() {
  // Clean Dist
  await cleanDir(path.join(__dirname, __dist))

  // Copy CSS
  console.info('💾 Copying Files... 💾')
  copyFile(path.join(__dirname, '/styles/main.css'), path.join(__dirname, __dist, 'styles.css'))
  await copyDir(path.join(__dirname, '/static/'), path.join(__dirname, __dist, '/static/'))

  // Read markdown files from `docs` directory
  console.info('📖 Reading `docs` directory... 📖')
  const docFilesOrDirList = await readdir(path.join(__dirname, __docs))
  console.log(docFilesOrDirList)
  const nestedPagination = await Promise.all(docFilesOrDirList.map(async (docFilesOrDir) => {
    const __docDir = path.join(__dirname, __docs, docFilesOrDir)
    const isDir = lstatSync(__docDir).isDirectory()
    if (!isDir) {
      return docFilesOrDir
    }
    // if doc is a nested directory
    let nestedDir = await readdir(__docDir)
    const nestedFileNames = nestedDir.map((doc) => {
      return doc
    })
    return {
      [docFilesOrDir]: nestedFileNames
    }
  }));
  console.log(nestedPagination);

  const flatDocsObj = await Promise.all(nestedPagination.reduce(async (a, k) => {
    return a;
  }, {}))
  // const docHTMLOrNestedHTML = await Promise.all(docFilesOrDirList.map(async (doc) => {
  //   const __docDir = path.join(__dirname, __docs, doc)
  //   const isDir = lstatSync(__docDir).isDirectory()
  //   // If doc is file
  //   if (!isDir) {
  //     try {
  //       let html = await readContent(__docDir)
  //       if (path.extname(doc) === '.md') {
  //         return Markdown().render(html)
  //       }
  //       return html
  //     } catch (e) {
  //       console.error(e)
  //     }
  //   }
  //   // if doc is a nested directory
  //   let nestedDir = await readdir(__docDir)
  //   const nestedDocs = await Promise.all(nestedDir.map(async (doc) => {
  //     try {
  //       let html = await readContent(path.join(__docDir, doc))
  //       if (path.extname(doc) === '.md') {
  //         return Markdown().render(html)
  //       }
  //       return html
  //     } catch (e) {
  //       console.error(e)
  //     }
  //   }))
  //   return { [doc]: nestedDocs }
  // }))

  // // Create Base Pagination, this includes nested directories
  // console.info('⚙️  Creating pages... ⚙️')

  // const pageDir = path.join(__dirname, __docs)
  // const basePagination = await createBasePagination(docFilesOrDirList, pageDir)
  // const flatPagination = flattenPagination(basePagination);
  // console.log(flatPagination, docHTMLOrNestedHTML)
  // return

  // // Add prev / next to flattened pagination
  // const pages = flatPagination.map((page, index) => {
  //   const next = index + 1 < flatPagination.length ? { ...flatPagination[index + 1] } : null
  //   const prev = index - 1 !== -1 ? { ...flatPagination[index - 1] } : null
  //   return {
  //     ...page,
  //     prev,
  //     next,
  //   }
  // })
  // console.info(`📕 Pages built from \`docs\`:\n\t📝 ${pages.map(i => i.href).join('\n\t📝 ')}`)

  // // Write to EJS and render to HTML
  // console.info('🏁 Finish building pages 🏁')
  // const template = path.join(__dirname, __views, 'index.ejs')
  // docHTMLOrNestedHTML.forEach(async (doc, index) => {
  //   const baseOptions = {
  //     ...config,
  //     pages,
  //     nav: basePagination
  //   }
  //   if (typeof doc === 'object' && doc !== null) {
  //     for (const key in doc) {
  //       await mkdir(path.join(__dirname, __dist, removeIndex(key)))
  //       doc[key].forEach(async (element, i) => {
  //         const options = { ...baseOptions, doc: element, flatNav: pages[index + i] }
  //         const { href } = pages[index + i]
  //         const target = path.join(__dirname, __dist, href)
  //         await buildPages(template, options, target)
  //       });
  //     }
  //   } else {
  //     const options = { ...baseOptions, doc, flatNav: pages[index] }
  //     // TODO: Need to skip di
  //     const { href } = pages[index]
  //     const target = path.join(__dirname, __dist, href)
  //     await buildPages(template, options, target)
  //   }
  // })
  // console.info('🎉 Done! 🎉')
}

build()