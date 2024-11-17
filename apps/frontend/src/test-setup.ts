// @ts-expect-error https://thymikee.github.io/jest-preset-angular/docs/getting-started/test-environment
globalThis.ngJest = {
  testEnvironmentOptions: {
    errorOnUnknownElements: true,
    errorOnUnknownProperties: true,
  },
};
import 'jest-preset-angular/setup-jest';

// Füge globale Mocks hinzu, falls nötig
jest.mock('@clr/angular', () => ({
  ClarityModule: class { },
  // Weitere Clarity-Komponenten die du mockst
}));

// Optional: Mock für amCharts
jest.mock('@amcharts/amcharts5', () => ({
  // Deine amCharts Mocks
}));

