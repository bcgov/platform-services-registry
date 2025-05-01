import { readdir, stat, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { tailwindToCSS } from 'tw-to-css';
import { tailwindConfig } from '../emails/_components/tailwind';
import { replaceString, replaceClassNameToStyleObject } from '../utils/js/string';

const { twi, twj } = tailwindToCSS({
  config: tailwindConfig,
});

async function replaceClassMatches(filePath: string, styleCallback: (className: string) => Record<string, string>) {
  try {
    let fileContent = await readFile(filePath, 'utf-8');

    fileContent = replaceClassNameToStyleObject(fileContent, styleCallback);
    fileContent = replaceString(fileContent, '<Tailwind config={tailwindConfig}>', '');
    fileContent = replaceString(fileContent, '</Tailwind>', '');

    await writeFile(filePath, fileContent, 'utf-8');
  } catch (err) {
    console.error('Error replacing class matches:', err);
  }
}

async function iterateDirectories(directoryPath: string) {
  try {
    const files = await readdir(directoryPath);

    for (const file of files) {
      const fullPath = join(directoryPath, file);

      const fileStats = await stat(fullPath);

      if (fileStats.isDirectory()) {
        await iterateDirectories(fullPath);
      } else {
        console.log('File:', fullPath);
        await replaceClassMatches(fullPath, (className) => twj(className) as Record<string, string>);
      }
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

async function replaceTailwindClassToStyle(targetDirectory: string) {
  await iterateDirectories(targetDirectory);
}

replaceTailwindClassToStyle(join(__dirname, '../emails'));
