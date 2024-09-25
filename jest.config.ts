import type { Config } from 'jest';
import { createDefaultPreset } from 'ts-jest';

export default async (): Promise<Config> => {
  return {
    preset: 'ts-jest',
    testEnvironment: 'node',
    verbose: true,
    transform: {
      ...createDefaultPreset().transform,
    },
    globalSetup: '<rootDir>/__tests__/setup-teardown/global.setup.ts',
    globalTeardown: '<rootDir>/__tests__/setup-teardown/global.teardown.ts',
  };
};
