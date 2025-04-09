import {
  AccountCoding,
  DecisionStatus,
  Prisma,
  ProjectStatus,
  RequestType,
  TaskStatus,
  TaskType,
} from '@prisma/client';
import _isBoolean from 'lodash-es/isBoolean';
import _isEqual from 'lodash-es/isEqual';
import _isNumber from 'lodash-es/isNumber';
import _uniq from 'lodash-es/uniq';
import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { splitAccountCodingString } from '@/helpers/billing';
import { parsePaginationParams } from '@/helpers/pagination';
import {
  PublicCloudBillingDetail,
  PublicCloudBillingDetailDecorated,
  PublicCloudBillingSearch,
  PublicCloudProductDetail,
  PublicCloudProductDetailDecorated,
  PublicCloudRequestDetail,
  PublicCloudRequestDetailDecorated,
} from '@/types/public-cloud';
import { PublicCloudBillingSearchBody } from '@/validation-schemas';
import {
  publicCloudBillingDetailInclude,
  publicCloudProductDetailInclude,
  publicCloudRequestDetailInclude,
} from './includes';
import { models } from './models';
import { tasks } from './tasks';

const defaultSortKey = 'createdAt';

export type SearchPublicCloudBillingSProps = PublicCloudBillingSearchBody & {
  session: Session;
  skip?: number;
  take?: number;
};

export async function searchPublicCloudBillings({
  session,
  skip,
  take,
  search = '',
  page,
  pageSize,
  licencePlate,
  signed,
  approved,
  sortKey = defaultSortKey,
  sortOrder = Prisma.SortOrder.desc,
}: SearchPublicCloudBillingSProps) {
  if (!_isNumber(skip) && !_isNumber(take) && page && pageSize) {
    ({ skip, take } = parsePaginationParams(page, pageSize, 10));
  }
  const where: Prisma.PublicCloudBillingWhereInput = {};
  const orderBy = { [sortKey || defaultSortKey]: Prisma.SortOrder[sortOrder] };

  search = search.trim();

  if (search) {
    const billingSearchFilter: Prisma.StringFilter<'PublicCloudBilling'> = {
      contains: search,
      mode: Prisma.QueryMode.insensitive,
    };

    const userSearchFilter: Prisma.StringFilter<'User'> = {
      contains: search,
      mode: Prisma.QueryMode.insensitive,
    };

    const accountCodingSegments = splitAccountCodingString(search);

    where.OR = [
      { expenseAuthority: { firstName: userSearchFilter } },
      { expenseAuthority: { firstName: userSearchFilter } },
      { expenseAuthority: { lastName: userSearchFilter } },
      { signedBy: { email: userSearchFilter } },
      { signedBy: { lastName: userSearchFilter } },
      { signedBy: { email: userSearchFilter } },
      { approvedBy: { firstName: userSearchFilter } },
      { approvedBy: { lastName: userSearchFilter } },
      { approvedBy: { email: userSearchFilter } },
      { licencePlate: billingSearchFilter },
    ];

    if (accountCodingSegments) {
      where.OR?.push({
        accountCoding: {
          equals: {
            cc: accountCodingSegments[0],
            rc: accountCodingSegments[1],
            sl: accountCodingSegments[2],
            stob: accountCodingSegments[3],
            pc: accountCodingSegments[4],
          },
        },
      });
    }

    const [products, requests] = await Promise.all([
      prisma.publicCloudProduct.findMany({
        where: {
          name: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        select: { licencePlate: true },
      }),
      prisma.publicCloudRequest.findMany({
        where: {
          type: RequestType.CREATE,
          decisionData: {
            name: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        },
        select: { licencePlate: true },
      }),
    ]);

    const licencePlates = _uniq([
      ...products.map(({ licencePlate }) => licencePlate),
      ...requests.map(({ licencePlate }) => licencePlate),
    ]);

    if (licencePlates.length > 0) {
      where.OR?.push({ licencePlate: { in: licencePlates } });
    }
  }

  if (licencePlate) {
    where.licencePlate = licencePlate;
  }

  if (_isBoolean(signed)) {
    where.signed = signed;
  }

  if (_isBoolean(approved)) {
    where.approved = approved;
  }

  const { data, totalCount } = await models.publicCloudBilling.list(
    {
      where,
      skip,
      take,
      orderBy,
      includeCount: true,
    },
    session,
  );

  return { data, totalCount } as PublicCloudBillingSearch;
}

export async function getPublicCloudBillingResources({
  billingId,
  licencePlate,
  complete,
  session,
}: {
  billingId?: string;
  licencePlate?: string;
  complete: boolean;
  session: Session;
}) {
  const result: {
    billing: PublicCloudBillingDetail | null;
    billingDecorated: PublicCloudBillingDetailDecorated | null;
    product: PublicCloudProductDetail | null;
    productDecorated: PublicCloudProductDetailDecorated | null;
    request: PublicCloudRequestDetail | null;
    requestDecorated: PublicCloudRequestDetailDecorated | null;
  } = {
    billing: null,
    billingDecorated: null,
    product: null,
    productDecorated: null,
    request: null,
    requestDecorated: null,
  };

  if (!billingId && !licencePlate) {
    return result;
  }

  const billing = await prisma.publicCloudBilling.findFirst({
    where: billingId ? { approved: complete, id: billingId } : { approved: complete, licencePlate },
    include: publicCloudBillingDetailInclude,
    orderBy: { createdAt: Prisma.SortOrder.desc },
  });

  if (!billing || (licencePlate && billing.licencePlate !== licencePlate)) {
    return result;
  }

  result.billing = billing;
  result.billingDecorated = await models.publicCloudBilling.decorate(billing, session, true);

  const [product, request] = await Promise.all([
    prisma.publicCloudProduct.findFirst({
      where: { licencePlate: billing.licencePlate, status: ProjectStatus.ACTIVE },
      include: publicCloudProductDetailInclude,
      orderBy: { createdAt: Prisma.SortOrder.desc },
    }),
    prisma.publicCloudRequest.findFirst({
      where: { licencePlate: billing.licencePlate, type: RequestType.CREATE, decisionStatus: DecisionStatus.PENDING },
      include: publicCloudRequestDetailInclude,
      orderBy: { createdAt: Prisma.SortOrder.desc },
    }),
  ]);

  result.product = product;
  result.request = request;
  if (product) result.productDecorated = await models.publicCloudProduct.decorate(product, session, true);
  if (request) result.requestDecorated = await models.publicCloudRequest.decorate(request, session, true);

  return result;
}

export async function upsertPublicCloudBillings({
  product,
  request,
  accountCoding,
  expenseAuthorityId,
  session,
}: {
  product?: PublicCloudProductDetailDecorated | null;
  request?: PublicCloudRequestDetailDecorated | null;
  accountCoding?: AccountCoding;
  expenseAuthorityId?: string;
  session: Session;
}) {
  let licencePlate = '';
  if (product) {
    licencePlate = product.licencePlate;
  } else if (request) {
    licencePlate = request.decisionData.licencePlate;
  } else {
    return;
  }

  if (!accountCoding && !expenseAuthorityId) {
    return null;
  }

  await Promise.all([
    prisma.publicCloudBilling.deleteMany({ where: { licencePlate, OR: [{ signed: false }, { approved: false }] } }),
    prisma.task.deleteMany({
      where: {
        type: { in: [TaskType.SIGN_PUBLIC_CLOUD_MOU, TaskType.REVIEW_PUBLIC_CLOUD_MOU] },
        status: TaskStatus.ASSIGNED,
        data: {
          equals: {
            licencePlate,
          },
        },
      },
    }),
  ]);

  const billing = await prisma.publicCloudBilling.findFirst({
    where: { licencePlate },
    orderBy: { createdAt: Prisma.SortOrder.desc },
    skip: 0,
    take: 1,
  });

  let newOneRequired = false;

  if (!billing) {
    newOneRequired = true;
  } else {
    if (!accountCoding) accountCoding = billing.accountCoding;
    else if (!expenseAuthorityId) expenseAuthorityId = billing.expenseAuthorityId;

    if (!_isEqual(billing.accountCoding, accountCoding) || !_isEqual(billing.expenseAuthorityId, expenseAuthorityId)) {
      newOneRequired = true;
    }
  }

  const proms: any = [];

  if (newOneRequired && accountCoding && expenseAuthorityId) {
    const billing = await prisma.publicCloudBilling.create({
      data: {
        accountCoding,
        licencePlate,
        expenseAuthority: { connect: { id: expenseAuthorityId } },
      },
      include: publicCloudBillingDetailInclude,
    });
    const billingDecorated = await models.publicCloudBilling.decorate(billing, session, true);
    proms.push(tasks.create(TaskType.SIGN_PUBLIC_CLOUD_MOU, { product, request, billing: billingDecorated }));
  }

  if (proms.length > 0) await Promise.all(proms);
}
