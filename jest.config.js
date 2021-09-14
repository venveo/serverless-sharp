

function project(displayName, testMatch) {
  return {

    transform: {
      '^.+\\.ts?$': 'ts-jest',
    },
    moduleNameMapper: {

    },

    displayName,
    testMatch,
    collectCoverageFrom: [
      'packages/**/*.ts',
      '!**/dist/**',
      '!**/node_modules/**',
      '!**/build/**',
      '!**/stack.ts',
      '!**/cdk.out/**',
      '!**/test/**',
      '!**/node_modules/**',
      '!**/coverage/**'
    ],
    coveragePathIgnorePatterns: [
      '/node_modules/',
      '/build/',
      '/dist/',
      '/coverage/'

    ],
    transformIgnorePatterns: [
      '/node_modules/',
      '/build/',
      '/dist/',
    ],
    watchPathIgnorePatterns: [
      '/node_modules/',
      '/build/',
      '/dist/',
      '/coverage/',
    ],
    coverageProvider: 'v8',
  }
}

module.exports = {
  // preset: 'ts-jest',
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.test.json',
    }
  },
  testEnvironment: 'node',
  // rootDir: './',
  // testRegex: '(/__tests__/.*|(\\.|/)(test))\\.tsx?$',
  testMatch: [

  ],

  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  projects: [
    project('all', [
      '<rootDir>/packages/**/*.test.ts'
    ]),

    // project('cdk', [
    // 	'<rootDir>/packages/app/lib/conductor/**/*.test.ts'
    // ]),

  ],

  modulePathIgnorePatterns: [

    '/dist/',
    '/build/'
  ],
  modulePaths: [
    'node_modules',
    '<rootDir>/test/'
  ],
  verbose: true,
  collectCoverage: false,


}
