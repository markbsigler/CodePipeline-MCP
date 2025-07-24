module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'], // Match .test.ts files
  verbose: true,
  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,
  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',
  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts' // Exclude type definition files
  ],
  // Remove ESM-specific options for stable CommonJS Jest+ts-jest
  // Remove extensionsToTreatAsEsm and useESM
  transformIgnorePatterns: ['/node_modules/(?!(uuid|pino)/)'],
  moduleNameMapper: {
    '^(handlers|types|utils|models|services|middleware|routes|config|lib|db|constants|schemas|validators|controllers|mocks|fixtures|testUtils|__mocks__)/(.*)$': '<rootDir>/src/$1/$2',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
};