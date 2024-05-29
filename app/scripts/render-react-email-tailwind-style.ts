import { readdir, stat, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { tailwindToCSS } from 'tw-to-css';
import { tailwindConfig } from '../emails/_components/tailwind';

const { twi, twj } = tailwindToCSS({
  config: tailwindConfig,
});

function replaceString(input: string, searchString: string, replacementString: string) {
  const escapedSearchString = searchString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escapedSearchString, 'g');
  return input.replace(regex, replacementString);
}

function replaceClassName(input: string, styleCallback: (className: string) => object) {
  const regex = /className\s*=\s*"([^"]*)"/g;

  return input.replace(regex, (match, className) => {
    const styleObject = styleCallback(className);
    return `style={${JSON.stringify(styleObject)}}`;
  });
}

async function replaceClassMatches(filePath: string, styleCallback: (className: string) => object) {
  try {
    let fileContent = await readFile(filePath, 'utf-8');

    fileContent = replaceClassName(fileContent, styleCallback);
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
        await replaceClassMatches(fullPath, (className) => {
          return twj(className);
        });
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
