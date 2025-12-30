import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { OkResponse } from '@/core/responses';
import { prepareUserData } from '@/services/db';
import { listUsersByEmail } from '@/services/msgraph';
import { SearchedUser } from '@/types/user';

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

  const processedUsers = await listUsersByEmail(email);

  const dbUsers: (SearchedUser | null)[] = await Promise.all(
    processedUsers.map(async (user) => {
      const data = await prepareUserData(user);
      // The upsert method returns { count: x } when updating data instead of the document.
      // Related issue: https://github.com/prisma/prisma/issues/10935
      if (data.idir && data.upn && data.idirGuid) {
        await prisma.user.upsert({
          where: { idirGuid: data.idirGuid },
          update: data,
          create: data,
        });

        return prisma.user.findUnique({
          where: { idirGuid: data.idirGuid },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            upn: true,
            idir: true,
            idirGuid: true,
            isGuidValid: true,
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
      }

      const now = new Date();
      return {
        ...data,
        id: data.providerUserId,
        archived: false,
        createdAt: now,
        updatedAt: now,
        lastSeen: null,
      };
    }),
  );

  return OkResponse({ data: dbUsers, totalCount: dbUsers.length });
});
