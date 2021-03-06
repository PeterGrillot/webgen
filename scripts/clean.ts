import * as path from 'path';
import * as readline from 'readline';
import * as tsConfig from '../tsconfig.json'

import { cleanDir } from './helpers'

// Constants
const __filename = tsConfig.compilerOptions.baseUrl;
const __dirname = path.dirname(__filename)
const __dist = 'dist/';
const __pages = 'docs/';
const __static = 'static/';

function clean() {
  const prompt = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  prompt.question('⚠️  This action cannot be undone, are you sure? y/n\n', async (answer: string) => {
    if (answer === 'y' || answer === 'yes') {
      // Clear dist
      const distDir = path.join(__dirname, __dist);
      console.log('Clearing out `docs` directory')
      await cleanDir(distDir);

      // Clear docs
      const docsDir = path.join(__dirname, __pages);
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