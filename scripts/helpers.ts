
import { lstatSync, PathLike } from 'fs';
import { readFile, mkdir, readdir, copyFile, rm, access, writeFile } from 'fs/promises';
import * as path from 'path';
import * as ejs from 'ejs';
import { FilePagination, NestedPagination, UnknownObject } from '..';

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
  } catch (e) {
    console.error(e)
  }
}

/**
 * Overloads readFile from fs with utf-8
 *
 * @export
 * @param {PathLike} argPath
 * @return {Promise<string>} content as string 
 */
export async function readContent(argPath: PathLike): Promise<string> {
  return await readFile(argPath, 'utf8')
}

/**
 * Removes  `01_` from string
 *
 * @export
 * @param {string} text
 * @return {string} text without number and underscore
 */
export const removeIndex = (text: string): string => {
  return text.replace(/([0-9][0-9]_)+/gm, '')
}

/**
 * Replaces  `_` with ` ` from string
 *
 * @export
 * @param {string} text
 * @return {string} text with space as underscore
 */
export const removeUnderscore = (text: string): string => {
  return text.replace(/_/gm, ' ')
}


/**
 * Creates a map of files and nested directories.  
 * Used for navs that need to be aware of nested files.
 *
 * @export
 * @param {Array<string>} readDocs array of filenames or nested directories
 * @param {string} __docs
 * @return {Array<NestedPagination>} pagination with nested directories
 */
export function createBasePagination(readDocs: Array<string>, pageDir: string): Promise<NestedPagination> {
  return Promise.all(readDocs.map(async (page, index) => {
    const __pageDir = path.join(pageDir, page)
    const isDir = lstatSync(__pageDir).isDirectory()
    const pageHref = removeIndex(page.split('.')[0])
    if (!isDir) {
      const pageName = removeUnderscore(pageHref)
      return {
        name: pageName,
        href: `${index === 0 ? 'index' : pageHref}.html`,
      }
    }
    const nestedPages = await readdir(path.join(__pageDir))
    return {
      dir: removeIndex(pageHref),
      nested: nestedPages.map(nestedPage => {
        const nestedPageHref = removeIndex(nestedPage.split('.')[0])
        const nestedPageName = removeUnderscore(nestedPageHref)
        return {
          name: nestedPageName,
          href: `${removeIndex(pageHref)}/${index === 0 ? 'index' : nestedPageHref}.html`,
        }
      })
    }
  }))
}
/**
 * Takes nested pagination and flattens out so one can iterate though all pages
 * Used in footer for prev / next navigation 
 *
 * @export
 * @param {NestedPagination} basePagination
 * @return {Array<FilePagination>} flattened navigation for next / prev
 */
export function flattenPagination(basePagination: NestedPagination): Array<FilePagination> {
  return basePagination.reduce((a, k) => {
    if ('dir' in k) {
      a = [...a, ...k.nested]
    } else {

      a = [...a, k]
    }
    return a
  }, [])
}

export async function buildPages(template: string, options: UnknownObject, target: string) {
  await ejs.renderFile(template, options, async (err, html) => {
    const compressedHtml = html.replace(/^\s+|\s+$|\n(?=((?!<\/pre).)*?(<pre|$))/sg, '')
    try {
      await writeFile(target, `<!-- Generated Code | Do Not Edit -->${compressedHtml}`)
    } catch (e) {
      console.info(e)
    }
  })
}