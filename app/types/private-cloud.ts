import { User, Prisma, PrivateCloudProductMember } from '@/prisma/client';
import {
  PrivateCloudProductDecorate,
  PrivateCloudRequestDecorate,
  PrivateCloudProductWebhookDecorate,
} from './doc-decorate';

export type ExtendedPrivateCloudProductMember = PrivateCloudProductMember & User;

interface ExtendedPrivateCloudProductMembersData {
  members: ExtendedPrivateCloudProductMember[];
}

export type PrivateCloudProductSimple = Prisma.PrivateCloudProductGetPayload<{
  include: {
    projectOwner: true;
    primaryTechnicalLead: true;
    secondaryTechnicalLead: true;
    requests: {
      where: {
        active: true;
      };
      include: {
        createdBy: true;
      };
    };
  };
}> & {
  activeRequest?: Prisma.PrivateCloudRequestGetPayload<{
    include: {
      createdBy: true;
    };
  }> | null;
};

export type PrivateCloudProductSimpleDecorated = PrivateCloudProductSimple & PrivateCloudProductDecorate;

export type PrivateCloudProductDetail = Prisma.PrivateCloudProductGetPayload<{
  include: {
    projectOwner: true;
    primaryTechnicalLead: true;
    secondaryTechnicalLead: true;
    requests: {
      where: {
        active: true;
      };
    };
  };
}> & {
  activeRequest?: Prisma.PrivateCloudRequestGetPayload<null> | null;
};

type _PrivateCloudProductDetail = Omit<PrivateCloudProductDetail, 'members'> & ExtendedPrivateCloudProductMembersData;

export type PrivateCloudProductDetailDecorated = _PrivateCloudProductDetail & PrivateCloudProductDecorate;

export type PrivateCloudProductSearch = {
  docs: PrivateCloudProductSimpleDecorated[];
  totalCount: number;
};

export type PrivateCloudRequestDetail = Prisma.PrivateCloudRequestGetPayload<{
  include: {
    decisionMaker: true;
    cancelledBy: true;
    createdBy: true;
    project: {
      include: {
        projectOwner: true;
        primaryTechnicalLead: true;
        secondaryTechnicalLead: true;
      };
    };
    originalData: {
      include: {
        projectOwner: true;
        primaryTechnicalLead: true;
        secondaryTechnicalLead: true;
      };
    };
    requestData: {
      include: {
        projectOwner: true;
        primaryTechnicalLead: true;
        secondaryTechnicalLead: true;
      };
    };
    decisionData: {
      include: {
        projectOwner: true;
        primaryTechnicalLead: true;
        secondaryTechnicalLead: true;
      };
    };
  };
}>;

type ExtendedOriginalData =
  | (Omit<NonNullable<PrivateCloudRequestDetail['originalData']>, 'members'> & ExtendedPrivateCloudProductMembersData)
  | null;

type ExtendedRequestData = Omit<PrivateCloudRequestDetail['requestData'], 'members'> &
  ExtendedPrivateCloudProductMembersData;

type ExtendedDecisionData = Omit<PrivateCloudRequestDetail['decisionData'], 'members'> &
  ExtendedPrivateCloudProductMembersData;

type _PrivateCloudRequestDetail = Omit<PrivateCloudRequestDetail, 'originalData' | 'requestData' | 'decisionData'> & {
  originalData: ExtendedOriginalData;
  requestData: ExtendedRequestData;
  decisionData: ExtendedDecisionData;
};

export type PrivateCloudRequestDetailDecorated = _PrivateCloudRequestDetail & PrivateCloudRequestDecorate;

export type PrivateCloudRequestSimple = Prisma.PrivateCloudRequestGetPayload<{
  include: {
    decisionMaker: true;
    cancelledBy: true;
    createdBy: true;
    project: {
      include: {
        projectOwner: true;
        primaryTechnicalLead: true;
        secondaryTechnicalLead: true;
      };
    };
    decisionData: {
      include: {
        projectOwner: true;
        primaryTechnicalLead: true;
        secondaryTechnicalLead: true;
      };
    };
  };
}>;

export type PrivateCloudRequestSimpleDecorated = PrivateCloudRequestSimple & PrivateCloudRequestDecorate;

export type PrivateCloudRequestSearch = {
  docs: PrivateCloudRequestSimpleDecorated[];
  totalCount: number;
};

export type PrivateCloudComment = Prisma.PrivateCloudCommentGetPayload<{
  include: {
    user: true;
  };
}>;

export type PrivateCloudProductWebhookDetail = Prisma.PrivateCloudProductWebhookGetPayload<object>;
export type PrivateCloudProductWebhookDetailDecorated = PrivateCloudProductWebhookDetail &
  PrivateCloudProductWebhookDecorate;
export type PrivateCloudProductWebhookSimple = Prisma.PrivateCloudProductWebhookGetPayload<object>;
export type PrivateCloudProductWebhookSimpleDecorated = PrivateCloudProductWebhookSimple &
  PrivateCloudProductWebhookDecorate;

export interface YearlyCostData {
  monthName: string;
  cpuCost: number;
  storageCost: number;
  totalCost: number;
}

export interface MonthlyProductCostData {
  product: {
    name: string;
    licencePlate: string;
  };
  cost: number;
}

export interface AdminMonthlyCostData {
  year: number;
  month: number;
  totalCount: number;
  totalCost: number;
  items: MonthlyProductCostData[];
}

export interface EnvironmentDetails {
  cpu: {
    value: number;
    cost: number;
  };
  storage: {
    value: number;
    cost: number;
  };
  subtotal: {
    cost: number;
  };
}

export enum CostPeriod {
  Monthly = 'Monthly',
  Quarterly = 'Quarterly',
  Yearly = 'Yearly',
}

export interface PeriodCostItem {
  startDate: Date;
  endDate: Date;
  minutes: number;
  cpuPricePerMinute: number;
  cpuPricePerYear: number;
  storagePricePerMinute: number;
  storagePricePerYear: number;
  isPast: boolean;
  isArchived: boolean;
  isProjected: boolean;
  unitPriceId?: string;
  development: EnvironmentDetails;
  test: EnvironmentDetails;
  production: EnvironmentDetails;
  tools: EnvironmentDetails;
  total: EnvironmentDetails;
}

export interface PeriodCosts {
  accountCoding: string;
  billingPeriod: string;
  currentTotal: number;
  estimatedGrandTotal: number;
  grandTotal: number;
  items: PeriodCostItem[];
  startDate: Date;
  progress: number;
  timeUnits: number[];
  timeDetails: {
    cpuCostsToDate: number[];
    cpuCostsToProjected: number[];
    cpuCosts: number[];
    storageCostsToDate: number[];
    storageCostsToProjected: number[];
    storageCosts: number[];
    cpuQuotasToDate: number[];
    cpuQuotasToProjected: number[];
    cpuQuotas: number[];
    storageQuotasToDate: number[];
    storageQuotasToProjected: number[];
    storageQuotas: number[];
    costsToDate: number[];
    costsToProjected: number[];
    costs: number[];
  };
}

export interface CostDetailTableDataRow {
  timeUnit: number;
  cpuCostToDate: number;
  cpuCostToProjected: number;
  cpuCost: number;
  storageCostToDate: number;
  storageCostToProjected: number;
  storageCost: number;
  cpuQuotaToDate: number;
  cpuQuotaToProjected: number;
  cpuQuota: number;
  storageQuotaToDate: number;
  storageQuotaToProjected: number;
  storageQuota: number;
  costToDate: number;
  costToProjected: number;
  cost: number;
}
