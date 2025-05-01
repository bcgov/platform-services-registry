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
    };
  };
}> & {
  activeRequest?: Prisma.PrivateCloudRequestGetPayload<null> | null;
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
  month: number;
  cpuCost: number;
  storageCost: number;
  totalCost: number;
}

export interface YearlyCostDataWithMonthName {
  month: string;
  cpuCost: number;
  storageCost: number;
  totalCost: number;
}
