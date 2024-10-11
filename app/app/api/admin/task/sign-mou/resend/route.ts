import { RequestType, TaskStatus, TaskType } from '@prisma/client';
import { render } from '@react-email/render';
import _sum from 'lodash-es/sum';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { OkResponse } from '@/core/responses';
import ExpenseAuthorityMou from '@/emails/_templates/public-cloud/ExpenseAuthorityMou';
import ExpenseAuthorityMouProduct from '@/emails/_templates/public-cloud/ExpenseAuthorityMouProduct';
import { sendEmail } from '@/services/ches/core';
import { publicCloudProductDetailInclude, publicCloudRequestDetailInclude } from '@/services/db';

const apiHandler = createApiHandler({
  roles: [GlobalRole.Admin],
});
export const GET = apiHandler(async () => {
  const unsignedBillings = await prisma.billing.findMany({ where: { signed: false } });

  const result = {
    unsignedBillings: 0,
    tasks: 0,
    products: 0,
    requests: 0,
  };

  for (const billing of unsignedBillings) {
    result.unsignedBillings += 1;

    const task = await prisma.task.findFirst({
      where: {
        type: TaskType.SIGN_MOU,
        status: TaskStatus.ASSIGNED,
        data: {
          equals: {
            licencePlate: billing.licencePlate,
          },
        },
      },
    });

    // Locate a task to determine its assignee
    if (task) {
      result.tasks += 1;

      const users = await prisma.user.findMany({ where: { id: { in: task.userIds } } });
      if (users.length === 0) continue;

      const product = await prisma.publicCloudProject.findFirst({
        where: { licencePlate: billing.licencePlate },
        include: publicCloudProductDetailInclude,
      });

      // Check if the request has already been approved as a product.
      if (product) {
        result.products += 1;

        const eaEmail = render(ExpenseAuthorityMouProduct({ product }), { pretty: false });
        await sendEmail({
          body: eaEmail,
          to: users.map((user) => user.email),
          subject: 'Expense Authority eMOU request',
        });
      } else {
        const request = await prisma.publicCloudRequest.findFirst({
          where: { type: RequestType.CREATE, licencePlate: billing.licencePlate },
          include: publicCloudRequestDetailInclude,
        });

        // If not, check if the request exists under the license plate.
        if (request) {
          result.requests += 1;

          const eaEmail = render(ExpenseAuthorityMou({ request }), { pretty: false });
          await sendEmail({
            body: eaEmail,
            to: users.map((user) => user.email),
            subject: 'Expense Authority eMOU request',
          });
        }
      }
    }
  }

  return OkResponse(result);
});
