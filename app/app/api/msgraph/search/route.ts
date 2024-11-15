import _isString from 'lodash-es/isString';
import { string, z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { OkResponse } from '@/core/responses';
import { prepareUserData } from '@/services/db';
import { listUsersByEmail } from '@/services/msgraph';

const userSearchBodySchema = z.object({
  email: z.string().max(40),
});

export const POST = createApiHandler({
  roles: [GlobalRole.User],
  validations: { body: userSearchBodySchema },
})(async ({ session, body }) => {
  const { email } = body;
  if (email.length < 3) {
    return OkResponse({ data: [], totalCount: 0 });
  }

  const users = await listUsersByEmail(email);

  const dbUsers = await Promise.all(
    users.map(async (user) => {
      const data = await prepareUserData(user);
      // The upsert method returns { count: x } when updating data instead of the document.
      // Related issue: https://github.com/prisma/prisma/issues/10935
      await prisma.user.upsert({
        where: { email: data.email },
        update: data,
        create: data,
      });

      return prisma.user.findUnique({
        where: { email: data.email },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          upn: true,
          idir: true,
          officeLocation: true,
          jobTitle: true,
          image: true,
          ministry: true,
          archived: true,
          createdAt: true,
          updatedAt: true,
          lastSeen: true,
        },
      });
    }),
  );

  return OkResponse({ data: dbUsers, totalCount: users.length });
});
