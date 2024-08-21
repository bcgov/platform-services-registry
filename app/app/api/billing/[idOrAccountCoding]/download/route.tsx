import { Prisma } from '@prisma/client';
import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { PdfResponse } from '@/core/responses';
import { WeasyPrint } from '@/services/weasyprint/client';

const Test = () => {
  return <div>test html</div>;
};

const pathParamSchema = z.object({
  idOrAccountCoding: z.string(),
});

const apiHandler = createApiHandler({
  // roles: ['user'],
  // validations: { pathParams: pathParamSchema },
});

const weasyClient = new WeasyPrint();

export const GET = apiHandler(async ({ pathParams, session }) => {
  const ReactDOMServer = (await import('react-dom/server')).default;
  // const { idOrAccountCoding } = pathParams;
  const html = ReactDOMServer.renderToStaticMarkup(<Test />);
  const buff = await weasyClient.generatePdf({ html });

  // const count = await prisma.billing.count({
  //   where: { OR: [{ id: idOrAccountCoding }, { accountCoding: idOrAccountCoding }] },
  // });

  return PdfResponse(buff);
});
