#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import * as url from 'node:url';

import chalk from 'chalk';
import { program } from 'commander';
import { mkdirp } from 'mkdirp';
import prompts from 'prompts';
import readdir from 'recursive-readdir';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const { version } = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json')));

export function toValidPackageName(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/^[._]/, '')
    .replace(/[^a-z0-9~.-]+/g, '-');
}

console.log(`${chalk.gray(`[@ircam/create#v${version}]`)}`);

const templates = ['nobuild', 'esbuild'];

program
  .argument('[path]', 'Directory in which we should create the project')
  .option('-t, --template <string>', 'Template to use');

program.parse();

let { template } = program.opts();

if (template && !templates.includes(template)) {
  console.log(chalk.red(`> Invalid template "${template}", valid templates are: "${templates.join('", "')}", aborting...`));
  process.exit(1);
}

let targetDir;
if (program.processedArgs[0]) {
  targetDir = program.processedArgs[0];
} else {
  targetDir = '.';
}

if (targetDir === '.') {
  const result = await prompts([
    {
      type: 'text',
      name: 'dir',
      message: 'Where should we create your project?\n  (leave blank to use current directory)',
    },
  ]);

  if (result.dir) {
    targetDir = result.dir;
  }
}

const targetWorkingDir = path.isAbsolute(targetDir) ?
  targetDir : path.normalize(path.join(process.cwd(), targetDir));

if (fs.existsSync(targetWorkingDir) && fs.readdirSync(targetWorkingDir).length > 0) {
  console.log(chalk.red(`> "${targetDir}" directory exists and is not empty, aborting...`));
  process.exit(1);
}

if (!template) {
  const result = await prompts([
    {
      type: 'select',
      name: 'template',
      message: 'Pick a template',
      choices: templates.map(value => {
        return { value };
      }),
    }
  ]);

  template = result.template;
}

const templateDir = path.join(__dirname, 'templates', template);

const ignoreFiles = ['.DS_Store', 'Thumbs.db'];
const files = await readdir(templateDir, ignoreFiles);

await mkdirp(targetWorkingDir);

console.log('');
console.log(`> scaffolding app in:`, targetWorkingDir);
console.log(`> template:`, template);
console.log('');

for (let src of files) {
  const file = path.relative(templateDir, src);
  const dest = path.join(targetWorkingDir, file);

  await mkdirp(path.dirname(dest));

  switch (file) {
    case 'package.json': {
      const pkg = JSON.parse(fs.readFileSync(src));
      pkg.name = toValidPackageName(targetDir);

      fs.writeFileSync(dest, JSON.stringify(pkg, null, 2));
      break;
    }
    case 'README.md':
    case 'index.html':
    case 'main.js':
    case 'src/index.js': {
      let content = fs.readFileSync(src).toString();
      content = content.replace(/\[app_name\]/mg, targetDir);
      fs.writeFileSync(dest, content);
      break;
    }
    // just copy the file without modification
    default: {
      fs.copyFileSync(src, dest);
      break;
    }
  }
}

console.log(chalk.yellow('> your project is ready!'));
console.log('')
console.log(chalk.yellow('> next steps:'));

let i = 1;

const relative = path.relative(process.cwd(), targetWorkingDir);
if (relative !== '') {
  console.log(`  ${i++}: ${chalk.cyan(`cd ${relative}`)}`);
}

if (template === 'nobuild') {
  console.log(`  ${i++}: ${chalk.cyan('npx serve')}`);
  console.log('');
} else if (template === 'esbuild') {
  console.log(`  ${i++}: ${chalk.cyan('npm install')}`);
  console.log(`  ${i++}: ${chalk.cyan('npm run dev')}`);
  console.log('');
}

console.log(`- to close the dev server, press ${chalk.bold(chalk.cyan('Ctrl-C'))}`);
