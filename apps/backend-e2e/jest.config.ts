export default {
	displayName: "metadata-analyzer-backend-e2e",
	preset: "../../jest.preset.cjs",
	globalSetup: "<rootDir>/src/support/global-setup.ts",
	globalTeardown: "<rootDir>/src/support/global-teardown.ts",
	setupFiles: ["<rootDir>/src/support/test-setup.ts"],
	testEnvironment: "node",
	transform: {
		"^.+\\.[tj]s$": [
			"ts-jest",
			{
				tsconfig: "<rootDir>/tsconfig.spec.json",
			},
		],
	},
	moduleFileExtensions: ["ts", "js", "html"],
	coverageDirectory: "../../coverage/metadata-analyzer-backend-e2e",
};
