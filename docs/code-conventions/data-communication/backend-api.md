# Backend API Endpoints

To ensure consistency and simplicity in building backend API endpoints, we use [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers){target="\_blank" rel="noopener noreferrer"} as the foundation, combined with a shared core wrapper that handles common logic such as role/permission-based access control and data validation.

## REST API Conventions

Although following strict RESTful URL conventions in the Next.js framework can be tedious, our team has agreed on a standardized approach to keep things as RESTful as possible. Each endpoint is structured to support typical CRUD operations along with common extensions:

- **CREATE**: Create a new resource
- **READ**: Retrieve a single resource
- **UPDATE**: Update an existing resource
- **DELETE**: Delete a resource
- **LIST**: Retrieve a list of resources
- **SEARCH**: Search resources with more flexible criteria beyond pagination

## Directory Structure

Our RESTful API endpoints are organized by database entities. For each entity:

- Use a pluralized directory name (e.g., `products`)
- Add a `route.ts` file for collection-level operations (`CREATE`, `LIST`, `SEARCH`)
- Add a `[id]/route.ts` file for resource-level operations (`READ`, `UPDATE`, `DELETE`)

## API Handler Wrapper

A shared core module (`createApiHandler`) encapsulates common backend logic, including:

- Role/permission-based privilege checks
- Request validation (path params, query params, and body)

This helps reduce boilerplate and ensure consistent enforcement of access control and data validation.

## Examples

### Collection-Level Operations (`/app/api/products/route.ts`)

```ts
import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import createOp from './_operations/create';
import listOp from './_operations/list';

// CREATE
export const POST = createApiHandler({
  roles: [GlobalRole.Admin],
  validations: {
    body: z.object({
      name: z.string(),
      age: z.number(),
    }),
  },
})(async ({ session, body }) => {
  return await createOp({ session, body });
});

// LIST
export const GET = createApiHandler({
  roles: [GlobalRole.User],
  validations: {
    queryParams: z.object({
      page: z.number(),
      pageSize: z.number(),
    }),
  },
})(async ({ session }) => {
  return await listOp({ session });
});
```

### Resource-Level Operations (`/app/api/products/[id]/route.ts`)

```ts
import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import readOp from '../_operations/read';
import updateOp from '../_operations/update';
import deleteOp from '../_operations/delete';

// READ
export const GET = createApiHandler({
  roles: [GlobalRole.User],
  validations: {
    pathParams: z.object({
      licencePlate: z.string(),
    }),
  },
})(async ({ session, pathParams }) => {
  return await readOp({ session, pathParams });
});

// UPDATE
export const PUT = createApiHandler({
  roles: [GlobalRole.Admin],
  validations: {
    pathParams: z.object({
      licencePlate: z.string(),
    }),
    body: z.object({
      name: z.string(),
      age: z.number(),
    }),
  },
})(async ({ session, pathParams, body }) => {
  return await updateOp({ session, pathParams, body });
});

// DELETE
export const DELETE = createApiHandler({
  roles: [GlobalRole.Admin],
  validations: {
    pathParams: z.object({
      licencePlate: z.string(),
    }),
  },
})(async ({ session, pathParams }) => {
  return await deleteOp({ session, pathParams });
});
```
