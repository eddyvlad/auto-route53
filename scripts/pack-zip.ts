import { execSync } from 'node:child_process';
import * as path from 'node:path';
import npmPackageJson from '../package.json';

const packageName = npmPackageJson.name;
const currentWorkingDirectory = process.cwd();
const unpackDirectory = path.join(currentWorkingDirectory, 'package');
const startTime = new Date().getTime();

function runCommand(command: string, options?: { cwd?: string }): void {
  try {
    console.info(`Executing: ${command}`);
    execSync(command, { stdio: 'inherit', ...options });
  } catch (error) {
    console.error(`Error while executing: ${command}`);
    throw error;
  }
}

function cleanUp(): void {
  try {
    console.info('Cleaning up...');
    runCommand(`rm -rf ${unpackDirectory}`);
    runCommand(`rm -f ${packageName}-*.tgz`);
  } catch (error) {
    console.error('Error during cleanup');
    throw error;
  }
}

function getElapsedTime(): string {
  return `[Elapsed: ${new Date().getTime() - startTime}ms]`;
}

try {
  console.info('Building');
  runCommand('npm run build');

  console.info(`Packing ${getElapsedTime()}`);
  runCommand('npm pack');

  console.info(`Unpacking ${getElapsedTime()}`);
  runCommand(`tar -xzf ${packageName}-*.tgz`);

  console.info(`Preparing ${getElapsedTime()}`);
  runCommand('mv dist/* ./', { cwd: unpackDirectory });
  runCommand('rm -rf ./dist', { cwd: unpackDirectory });
  runCommand('npm install --omit=dev', { cwd: unpackDirectory });

  console.info(`Zipping ${getElapsedTime()}`);
  runCommand('zip -r ../lambda-deployment.zip .', { cwd: unpackDirectory });

  cleanUp();

  console.info(`Done ${getElapsedTime()}`);
} catch (error) {
  console.error('Process failed.', error);
  cleanUp();
  process.exit(1);
}
