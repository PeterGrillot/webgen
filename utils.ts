import { PathLike } from "fs";
import { readFile, mkdir, readdir, copyFile } from "fs/promises";
import * as path from "path";


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

  for (let entry of entries) {
    console.log(src, entry.name, path.join(src, entry.name))
    let srcPath = path.join(src, entry.name);
    let destPath = path.join(dest, entry.name);

    entry.isDirectory() ?
      await copyDir(srcPath, destPath) :
      await copyFile(srcPath, destPath);
  }
}


/**
 * Overloads readFile from fs with utf-8
 *
 * @export
 * @param {PathLike} argPath
 * @return {*} 
 */
export async function readContent(argPath: PathLike) {
  return await readFile(argPath, 'utf8')
}