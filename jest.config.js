module.exports = {
  preset: 'ts-jest',
  verbose: true,
  roots: ['<rootDir>/src'],
  testTimeout: 30000,
  globals: {
    'ts-jest': {
      diagnostics: {
        exclude: ['**'],
      },
    },
  }
}