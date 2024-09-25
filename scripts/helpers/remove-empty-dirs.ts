import * as fs from 'node:fs';
import * as path from 'node:path';

export const removeEmptyDirs = (dir: string): void => {
  const files = fs.readdirSync(dir);
  if (files.length === 0) {
    fs.rmdirSync(dir);
  } else {
    files.forEach((file) => {
      const filePath = path.join(dir, file);
      if (fs.lstatSync(filePath).isDirectory()) {
        removeEmptyDirs(filePath);
      }
    });
  }
};
