import { readdir, stat, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { tailwindToCSS } from 'tw-to-css';
import { tailwindConfig } from '../emails/_components/tailwind';

const { twi, twj } = tailwindToCSS({
  config: tailwindConfig,
});

async function replaceClassMatches(filePath: string, styleCallback: (className: string) => object) {
  try {
    let fileContent = await readFile(filePath, 'utf-8');

    const regex = /className\s*=\s*"([^"]*)"/g;

    fileContent = fileContent.replace(regex, (match, className) => {
      const styleObject = styleCallback(className);
      return `style={${JSON.stringify(styleObject)}}`;
    });

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

export async function replaceTailwindClassToStyle(targetDirectory: string) {
  await iterateDirectories(targetDirectory);
}
