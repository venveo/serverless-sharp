module.exports = {
  preset: 'ts-jest',
  verbose: true,
  roots: ['<rootDir>/src'],
  globals: {
    'ts-jest': {
      diagnostics: {
        exclude: ['**'],
      },
    },
  }
}