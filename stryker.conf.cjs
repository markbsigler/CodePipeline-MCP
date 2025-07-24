// Stryker mutation testing configuration
/**
 * @type {import('@stryker-mutator/api/core').StrykerOptions}
 */
module.exports = {
  mutate: ["src/**/*.ts", "!src/**/*.d.ts"],
  testRunner: "jest",
  jest: {
    projectType: "custom",
    config: require("./jest.config.cjs"),
  },
  reporters: ["html", "clear-text", "progress"],
  coverageAnalysis: "off",
  tsconfigFile: "tsconfig.json",
  thresholds: { high: 80, low: 60, break: 50 },
};
