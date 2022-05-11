
import { PathLike } from "fs";
import { readFile, mkdir, readdir, copyFile, rm, access } from "fs/promises";
import * as path from "path";

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
  await mkdir(dest, { recursive: true });
  let entries = await readdir(src, { withFileTypes: true });

  try {

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
