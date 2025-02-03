/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        diagnostics: { ignoreCodes: [1343] },
        astTransformers: {
          before: [
            {
              path: 'ts-jest-mock-import-meta',
              options: {
                metaObjectReplacement: {
                  url: ({ fileName }) => `file://${fileName}`,
                },
              },
            },
          ],
        },
      },
    ],
  },
  testEnvironment: 'node',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  verbose: true,
};
