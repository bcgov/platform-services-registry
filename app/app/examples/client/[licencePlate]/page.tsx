'use client';

import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const queryParamSchema = z.object({
  color: z.string(),
  age: z.preprocess(Number, z.number()),
});

const examplePage = createClientPage({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema, queryParams: queryParamSchema },
});
export default examplePage(({ pathParams, queryParams, session }) => {
  return (
    <ul>
      <li>
        Path Params:{' '}
        <pre>
          <code>{JSON.stringify(pathParams, null, 2)}</code>
        </pre>
      </li>
      <li>
        Query Params:{' '}
        <pre>
          <code>{JSON.stringify(queryParams, null, 2)}</code>
        </pre>
      </li>
      <li>
        Session:{' '}
        <pre>
          <code>{JSON.stringify(session, null, 2)}</code>
        </pre>
      </li>
    </ul>
  );
});
