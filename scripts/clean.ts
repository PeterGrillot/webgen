import * as Markdown from 'markdown-it'
import { readFile, writeFile, readdir, copyFile, rm, mkdir, access } from 'fs/promises'
import * as ejs from 'ejs'
import * as path from 'path';
import * as config from '../config.json'
import * as tsConfig from '../tsconfig.json'

import { cleanDir, prompt } from './helpers'

// Constants
const __filename = tsConfig.compilerOptions.baseUrl;
const __dirname = path.dirname(__filename)
const __dist = 'dist/';
const __docs = 'docs/';
const __static = 'static/';

function clean() {
  prompt.question('⚠️  This action cannot be undone, are you sure? y/n\n', async (answer: string) => {
    if (answer === 'y' || answer === 'yes') {
      // Clear dist
      const distDir = path.join(__dirname, __dist);
      console.log('Clearing out `docs` directory')
      await cleanDir(distDir);

      // Clear docs
      const docsDir = path.join(__dirname, __docs);
      console.log('Clearing out `docs` directory')
      await cleanDir(docsDir);

      // Clear 
      const staticDir = path.join(__dirname, __static);
      console.log('Clearing out `static` directory')
      await cleanDir(staticDir);
    } else {
      console.warn('aborting...')

    }
    process.exit(0)
  })


}

clean()