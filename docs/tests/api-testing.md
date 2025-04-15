# API Testing

We use `Jest` to test our application's API endpoints, focusing on access permissions and parameter validations.

## Steps to Add API Test Scripts

1. Add the corresponding API service methods to encapsulate endpoint information and structure in the `/app/services/api-test` directory.
   - The names and method arguments should ideally be similar to those in `/app/services/backend`.
2. Add the test script, such as `route.test.ts`, in the same directory as the API route file.
3. The test script should focus on the permission checks and parameter validations of the route itself. When using other endpoint methods from `/app/services/api-test`, only check the status codes to prevent the test script from becoming overly bloated with excessive validations; concentrate on the route tests for each test script.
