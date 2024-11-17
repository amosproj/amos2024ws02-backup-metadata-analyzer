export default {
	displayName: "metadata-analyzer-frontend",
	preset: "../../jest.preset.cjs",
	setupFilesAfterEnv: ["<rootDir>/src/test-setup.ts"],
	coverageDirectory: "../../coverage/apps/frontend",
	transform: {
		"^.+\\.(ts|mjs|js|html)$": [
			"jest-preset-angular",
			{
				tsconfig: "<rootDir>/tsconfig.spec.json",
				stringifyContentPathRegex: "\\.(html|svg)$",
			},
		],
	},
	transformIgnorePatterns: ["node_modules/(?!.*\\.mjs$)"],
	snapshotSerializers: [
		"jest-preset-angular/build/serializers/no-ng-attributes",
		"jest-preset-angular/build/serializers/ng-snapshot",
		"jest-preset-angular/build/serializers/html-comment",
	],
	moduleNameMapper: {
		'@clr/angular': '<rootDir>/../../node_modules/@clr/angular',
		'@amcharts/amcharts5': '<rootDir>/../../node_modules/@amcharts/amcharts5'
	  }
};
