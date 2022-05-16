
import { lstatSync, PathLike } from 'fs';
import { readFile, mkdir, readdir, copyFile, rm, access, writeFile } from 'fs/promises';
import * as path from 'path';
import * as ejs from 'ejs';
import * as Markdown from 'markdown-it'
import { FilePagination, FullDocument, NestedPagination, UnknownObject } from '../types';

/**
 * Overloads readFile from fs with utf-8
 *
 * @param {PathLike} argPath
 * @return {Promise<string>} content as string 
 */
async function readContent(argPath: PathLike): Promise<string> {
  return await readFile(argPath, 'utf8')
}

/**
 * Removes `extension` from string
 *
 * @param {string} filename
 * @return {string} text without extension; e.g. `.html`
 */
function getFilename(filename: string): string {
  return filename.split('.')[0]
}

/**
 * Replace `extension` with HTML
 *
 * @param {string} filename
 * @return {string} text with extension; e.g. `.html`
 */
function replaceExtensionWithHTML(filename: string): string {
  return `${getFilename(filename)}.html`
}

/**
 * Replaces  `_` with ` ` from string
 *
 * @param {string} text
 * @return {string} text with space as underscore
 */
function getNameFromHref(href: string): string {
  return getFilename(href.replace(/([0-9][0-9]_)+/gm, '').replace(/_/gm, ' ')
  )
}

/**
 * Creates href for `dist` by removing index and replacing extension `html`
 *
 * @param {string} text
 * @return {string} text with space as underscore
 */
function getDistHrefFromDocHref(href: string, isNested?: boolean): string {
  if (href.slice(0, 2) === '01' && !isNested) {
    return 'index.html'
  }
  return replaceExtensionWithHTML(href.replace(/([0-9][0-9]_)+/gm, ''))
}

/* Exported Functions */
/**
 * Cleans out a directory
 *
 * @export
 * @param {string} path
 */
export async function cleanDir(path: string) {
  try {
    await access(path)
    await rm(path, { recursive: true })
    await mkdir(path)
  } catch (err) {
    await mkdir(path)
  }
}

/**
 * Reads and Writes contents of source dir to dest
 *
 * @export
 * @param {string} src
 * @param {string} dest
 */
export async function copyDir(src: string, dest: string) {
  try {
    await mkdir(dest, { recursive: true });
    let entries = await readdir(src, { withFileTypes: true });
    for (let entry of entries) {
      let srcPath = path.join(src, entry.name);
      let destPath = path.join(dest, entry.name);

      entry.isDirectory() ?
        await copyDir(srcPath, destPath) :
        await copyFile(srcPath, destPath);
    }
  } catch (mkDirError) {
    console.error('mkdir', mkDirError)
  }
}

/**
 * Removes  `01_` from string
 *
 * @export
 * @param {string} text
 * @return {string} text without number and underscore
 */
export function removeIndex(text: string): string {
  return text.replace(/([0-9][0-9]_)+/gm, '')
}

/**
 * Takes nested pagination and flattens out so one can iterate though all pages
 * Used in footer for prev / next navigation 
 *
 * @export
 * @param {NestedPagination} nestedDocsList
 * @return {Array<FilePagination>} flattened navigation for next / prev
 */
export function flattenPagination(
  nestedDocsList: NestedPagination
): Array<FilePagination> {
  const nav = nestedDocsList.map(i => {
    if (typeof i === 'object') {
      const dirName = Object.keys(i)[0]
      return {
        dir: getNameFromHref(dirName),
        nested: i[dirName].map(n => {
          return {
            name: getNameFromHref(n),
            href: `${removeIndex(dirName)}/${getDistHrefFromDocHref(n, true)}`
          }
        })
      }
    }
    return {
      name: getNameFromHref(i),
      href: getDistHrefFromDocHref(i)
    }
  })
  return nestedDocsList.reduce((a, v) => {
    if (typeof v === 'object') {
      for (var prop in v) {
        const flat = v[prop].reduce((na, nv) => {
          const href = `${prop}/${nv}`
          const name = getNameFromHref(href)
          na = [
            ...na, {
              nav,
              href,
              name,
              isNested: true
            }
          ]
          return na
        }, [])
        a = [...a, ...flat]
        break;
      }
    }
    if (typeof v === 'string') {
      const name = getNameFromHref(v)
      a = [
        ...a, {
          nav,
          href: v,
          name,
          isNested: false
        }
      ]
    }
    return a
  }, [])
}

/**
 *
 *
 * @export
 * @param {Array<string>} docList
 * @param {string} docsDir
 * @return {*}  {Promise<NestedPagination>}
 */
export function createNestedDocsList(docList: Array<string>, docsDir: string): Promise<NestedPagination> {
  return Promise.all(docList.map(async (docFilesOrDir) => {
    const fileOrDirPath = path.join(docsDir, docFilesOrDir)
    const isDir = lstatSync(fileOrDirPath).isDirectory()
    if (!isDir) {
      return docFilesOrDir
    }
    // if doc is a nested directory
    let nestedDir = await readdir(fileOrDirPath)
    const nestedFileNames = nestedDir.map((doc) => {
      return doc
    })
    return {
      [docFilesOrDir]: nestedFileNames
    }
  }));
}

/**
 * Creates a map of files and nested directories.  
 * Used for navs that need to be aware of nested files.
 *
 * @export
 * @param {Array<FilePagination>} flatPagination array of filenames or nested directories
 * @param {string} docsDir
 * @return {Array<FullDocument>} pagination with nested directories
 */
export function createFullPagination(
  flatPagination: Array<FilePagination>,
  docsDir: string
): Promise<Array<FullDocument>> {
  return Promise.all(flatPagination.map(async (doc, index) => {
    const { href, isNested } = doc
    const next = index + 1 < flatPagination.length ? { ...flatPagination[index + 1] } : null
    let prev = index - 1 !== -1 ? { ...flatPagination[index - 1] } : null
    let readHref = getDistHrefFromDocHref(href, isNested)
    try {
      let html = await readContent(path.join(docsDir, href))
      if (path.extname(href) === '.md') {
        html = Markdown().render(html)
      }
      if (index === 1) {
        prev = { ...prev, href: 'index.html' }
      }
      return {
        ...doc,
        html,
        next: next ? { ...next, href: replaceExtensionWithHTML(removeIndex(next.href)) } : null,
        prev: prev ? { ...prev, href: replaceExtensionWithHTML(removeIndex(prev.href)) } : null,
        href: readHref
      }
    } catch (e) {
      console.error(e)
    }
  }))
}

/**
 *
 *
 * @export
 * @param {string} templatePath ejs templatePath location
 * @param {UnknownObject} options Options for ejs
 * @param {string} target
 */
export async function buildPages(templatePath: string, options: UnknownObject & { doc: string }, target: string) {
  await ejs.renderFile(templatePath, options, async (renderError, html) => {
    if (renderError) {
      console.error('renderFile', renderError)
      return
    }
    const compressedHtml = html.replace(/^\s+|\s+$|\n(?=((?!<\/pre).)*?(<pre|$))/sg, '')
    try {
      await writeFile(target, `<!-- Generated Code | Do Not Edit -->${compressedHtml}`)
    } catch (writeError) {
      console.error('writeFile', writeError)
    }
  })
}

