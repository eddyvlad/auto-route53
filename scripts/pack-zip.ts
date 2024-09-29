import { execSync } from 'node:child_process';
import * as path from 'node:path';
import npmPackageJson from '../package.json';
import { ConsoleLogger } from '../src/services/console-logger';
import { DEPLOYMENT_ZIP_NAME } from './constants/shared.constants';
import { removeEmptyDirs } from './helpers/remove-empty-dirs';
import { deleteFile } from './helpers/delete-file';

const logger = new ConsoleLogger('pack-zip');
const packageName = npmPackageJson.name;
const currentWorkingDirectory = process.cwd();
const unpackDirectory = path.join(currentWorkingDirectory, 'package');
const startTime = new Date().getTime();

const runCommand = (command: string, options?: { cwd?: string }): void => {
  try {
    logger.info(`Executing: ${command}`);
    execSync(command, { stdio: 'inherit', ...options });
  } catch (error) {
    logger.error(`Error while executing: ${command}`);
    throw error;
  }
};

const cleanUp = (): void => {
  try {
    logger.info('Cleaning up...');
    runCommand(`rm -rf ${unpackDirectory}`);
    runCommand(`rm -f ${packageName}-*.tgz`);
  } catch (error) {
    logger.error('Error during cleanup');
    throw error;
  }
};

const getElapsedTime = (): string => `[Elapsed: ${new Date().getTime() - startTime}ms]`;

const cleanArtifacts = (): void => {
  try {
    logger.info('Cleaning up artifacts...');

    // Remove package-lock.json
    const packageLockPath = path.join(unpackDirectory, 'package-lock.json');
    deleteFile(packageLockPath);
    logger.info('Removed package-lock.json');

    // Remove *.map files
    const mapFiles = execSync(`find ${unpackDirectory} -name "*.map"`, { encoding: 'utf8' }).split('\n');
    mapFiles.forEach((mapFile) => {
      if (mapFile.trim()) {
        deleteFile(mapFile);
        logger.info(`Removed: ${mapFile}`);
      }
    });

    // Remove empty directories in the unpack directory
    removeEmptyDirs(unpackDirectory);
    logger.info('Removed empty directories');
  } catch (error) {
    logger.error('Error during artifact cleanup:', error);
    throw error;
  }
};

try {
  logger.info('Building');
  runCommand('npm run build');

  logger.info(`Packing ${getElapsedTime()}`);
  runCommand('npm pack');

  logger.info(`Unpacking ${getElapsedTime()}`);
  runCommand(`tar -xzf ${packageName}-*.tgz`);

  logger.info(`Preparing ${getElapsedTime()}`);
  runCommand('mv dist/* ./', { cwd: unpackDirectory });
  runCommand('rm -rf ./dist', { cwd: unpackDirectory });
  runCommand('npm install --omit=dev', { cwd: unpackDirectory });

  cleanArtifacts();

  logger.info(`Zipping ${getElapsedTime()}`);
  runCommand(`zip -r ../${DEPLOYMENT_ZIP_NAME} .`, { cwd: unpackDirectory });

  cleanUp();

  logger.info(`Done ${getElapsedTime()}`);
} catch (error) {
  logger.error('Process failed.', error);
  cleanUp();
  process.exit(1);
}
