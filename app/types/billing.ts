import { Prisma } from '@prisma/client';
import { number } from 'zod';

export type BillingGetPayload = Prisma.BillingGetPayload<{
  include: {
    expenseAuthority: true;
    signedBy: true;
    approvedBy: true;
  };
}>;

export type BillingSearchResponseDataItem = Prisma.BillingGetPayload<{
  select: {
    id: true;
    accountCoding: true;
    licencePlate: true;
    signed: true;
    approved: true;
    createdAt: true;
    signedAt: true;
    approvedAt: true;
    updatedAt: true;
    approvedBy: {
      select: {
        firstName: true;
        lastName: true;
        email: true;
        jobTitle: true;
        image: true;
        ministry: true;
      };
    };
    expenseAuthority: {
      select: {
        firstName: true;
        lastName: true;
        email: true;
        jobTitle: true;
        image: true;
        ministry: true;
      };
    };
    signedBy: {
      select: {
        firstName: true;
        lastName: true;
        email: true;
        jobTitle: true;
        image: true;
        ministry: true;
      };
    };
  };
}>;

interface BillingSearchResponseMetadataItem {
  id: string;
  licencePlate: string;
  name: string;
  url: string;
  type: 'product' | 'request';
  context: string;
  billingId?: string | null;
}

export interface BillingSearchResponseMetadata {
  publicProducts: BillingSearchResponseMetadataItem[];
  publicRequests: BillingSearchResponseMetadataItem[];
}

export interface BillingSearchResponsePayload {
  data: BillingSearchResponseDataItem[];
  totalCount: number;
  metadata: BillingSearchResponseMetadata;
}
