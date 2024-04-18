import { z } from 'zod';
import createServerPage from '@/core/server-page';
import prisma from '@/core/prisma';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const queryParamSchema = z.object({
  color: z.string(),
  age: z.preprocess(Number, z.number()),
});

const examplePage = createServerPage({
  roles: ['user'],
  validations: { pathParams: pathParamSchema, queryParams: queryParamSchema },
});
export default examplePage(async ({ pathParams, queryParams, session }) => {
  const sessionUser = await prisma.user.findFirst({ where: { email: session?.userEmail ?? '' } });

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
      <li>
        Session User:{' '}
        <pre>
          <code>{JSON.stringify(sessionUser, null, 2)}</code>
        </pre>
      </li>
    </ul>
  );
});
