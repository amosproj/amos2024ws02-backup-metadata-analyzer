// @ts-expect-error https://thymikee.github.io/jest-preset-angular/docs/getting-started/test-environment
globalThis.ngJest = {
  testEnvironmentOptions: {
    errorOnUnknownElements: true,
    errorOnUnknownProperties: true,
  },
};
import 'jest-preset-angular/setup-jest';
import { baseURL } from './app/backups-overview/backups/backups/backups.component.spec';

// Füge globale Mocks hinzu, falls nötig
jest.mock('@clr/angular', () => {
  const original = jest.requireActual('@clr/angular');
  return {
    ...original,
    ClarityModule: class {
      static forRoot() {
        return {};
      }
    },
    CUSTOM_ELEMENTS_SCHEMA: {
      // This will allow any Clarity components to be used without explicit declaration
      name: 'CUSTOM_ELEMENTS_SCHEMA',
      // Add any specific behaviors you need to test
    },
  };
});

// Optional: Mock für amCharts
jest.mock('@amcharts/amcharts5', () => ({
  // Deine amCharts Mocks
}));
// // Optional: Mock für baseURL
// jest.mock('baseURL', () => ({
//   useValue: 'http://mock-base-url.com',
// }));
