# API Testing

We use `Jest` to test our application's API endpoints, focusing on access permissions and parameter validations.

## Steps to Add API Test Scripts

1. Add the corresponding API service methods to encapsulate endpoint information and structure in the `/app/services/api-test` directory.
    - The names and method arguments should ideally be similar to those in `/app/services/backend`.
2. Add the test script, such as `route.test.ts`, in the same directory as the API route file.
3. The test script should focus on the permission checks and parameter validations of the route itself. When using other endpoint methods from `/app/services/api-test`, only check the status codes to prevent the test script from becoming overly bloated with excessive validations; concentrate on the route tests for each test script.

# UI Unit Tests

For UI tests add the following as the first line of the test file:

```node
/** @jest-environment jsdom */
```

The above comment is required to use jsdom environment for UI tests. The api unit tests are run in a node environment. Jsdom can't be set as the default environment in `jest.config.mjs` as that would break the api tests. So, declare the jsdom environment in the UI test files.

# Running Tests Locally

Run all tests:

```shell
pnpm --dir app test
```

Run specific test:

```shell
 pnpm --dir app test path/to/MyTest.test.tsx
```
