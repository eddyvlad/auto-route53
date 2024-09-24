module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  globals: {
    'ts-jest': {
      tsconfig: {
        sourceMap: true,
      },
    },
  },
};
