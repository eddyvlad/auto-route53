import * as fs from 'node:fs';
import * as crypto from 'node:crypto';
import * as path from 'node:path';
import * as dotenv from 'dotenv';

const args = process.argv.slice(2); // Skip first two elements (node, script path)
let writeToEnv = false;
let tokenLength = 32; // Default length

// Process command-line arguments
args.forEach((arg, index) => {
  if (arg === '-w') {
    writeToEnv = true;
  }

  if (arg === '-l') {
    // Check if a length was provided after -l
    const lengthArg = args[index + 1];
    if (lengthArg && !isNaN(Number(lengthArg))) {
      tokenLength = parseInt(lengthArg, 10);
    } else {
      console.error('Error: Invalid length provided for -l. Using default length of 32.');
    }
  }
});

const generateToken = (length: number): string => {
  return crypto.randomBytes(length).toString('hex');
};

const updateEnvFile = (newToken: string): void => {
  const envPath = path.resolve(__dirname, '../.env');
  let envConfig: Partial<NodeJS.ProcessEnv> = {};

  if (!fs.existsSync(envPath)) {
    // Create a new .env file
    fs.copyFileSync(`${envPath}.default`, envPath);
  }

  envConfig = dotenv.parse(fs.readFileSync(envPath, 'utf-8'));
  // Update the AUTH_TOKEN
  envConfig['AUTH_TOKEN'] = newToken;

  // Convert the updated configuration back to string
  const updatedEnv = Object.keys(envConfig)
    .map((key) => `${key}=${envConfig[key]}`)
    .join('\n');

  // Write the updated content back to .env file
  fs.writeFileSync(envPath, updatedEnv);
  console.log(`AUTH_TOKEN updated in .env file: ${newToken}`);
};

const secretToken = generateToken(tokenLength);

if (writeToEnv) {
  updateEnvFile(secretToken);
  console.log(`Generated secret token written to .env file`);
} else {
  console.log(`Generated secret token: ${secretToken}.
 If you want it to write to the .env file, add -w parameter to this command.
 If you want to set a custom length, add -l <number> to this command.`);
}
