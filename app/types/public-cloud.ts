import { Prisma, User, PublicCloudProductMember, Provider } from '@prisma/client';
import { PublicCloudProjectDecorate, PublicCloudRequestDecorate, PublicCloudBillingDecorate } from './doc-decorate';

export type ExtendedPublicCloudProductMember = PublicCloudProductMember & User;

interface ExtendedPublicCloudProductMembersData {
  members: ExtendedPublicCloudProductMember[];
}

export type PublicCloudProductSimple = Prisma.PublicCloudProjectGetPayload<{
  include: {
    projectOwner: true;
    primaryTechnicalLead: true;
    secondaryTechnicalLead: true;
    expenseAuthority: true;
    requests: {
      where: {
        active: true;
      };
    };
  };
}> & {
  activeRequest?: Prisma.PublicCloudRequestGetPayload<null> | null;
};

export type PublicCloudProductSimpleDecorated = PublicCloudProductSimple & PublicCloudProjectDecorate;

export type PublicCloudProductDetail = Prisma.PublicCloudProjectGetPayload<{
  include: {
    projectOwner: true;
    primaryTechnicalLead: true;
    secondaryTechnicalLead: true;
    expenseAuthority: true;
    requests: {
      where: {
        active: true;
      };
    };
  };
}> & {
  activeRequest?: Prisma.PublicCloudRequestGetPayload<null> | null;
};

type _PublicCloudProductDetail = Omit<PublicCloudProductDetail, 'members'> & ExtendedPublicCloudProductMembersData;

export type PublicCloudProductDetailDecorated = _PublicCloudProductDetail & PublicCloudProjectDecorate;

export type PublicCloudProductSearch = {
  docs: PublicCloudProductSimpleDecorated[];
  totalCount: number;
};

export type PublicCloudRequestDetail = Prisma.PublicCloudRequestGetPayload<{
  include: {
    decisionMaker: true;
    createdBy: true;
    project: {
      include: {
        projectOwner: true;
        primaryTechnicalLead: true;
        secondaryTechnicalLead: true;
        expenseAuthority: true;
      };
    };
    originalData: {
      include: {
        projectOwner: true;
        primaryTechnicalLead: true;
        secondaryTechnicalLead: true;
        expenseAuthority: true;
      };
    };
    requestData: {
      include: {
        projectOwner: true;
        primaryTechnicalLead: true;
        secondaryTechnicalLead: true;
        expenseAuthority: true;
      };
    };
    decisionData: {
      include: {
        projectOwner: true;
        primaryTechnicalLead: true;
        secondaryTechnicalLead: true;
        expenseAuthority: true;
      };
    };
  };
}>;

type ExtendedOriginalData =
  | (Omit<NonNullable<PublicCloudRequestDetail['originalData']>, 'members'> & ExtendedPublicCloudProductMembersData)
  | null;

type ExtendedRequestData = Omit<PublicCloudRequestDetail['requestData'], 'members'> &
  ExtendedPublicCloudProductMembersData;

type ExtendedDecisionData = Omit<PublicCloudRequestDetail['decisionData'], 'members'> &
  ExtendedPublicCloudProductMembersData;

type _PublicCloudRequestDetail = Omit<PublicCloudRequestDetail, 'originalData' | 'requestData' | 'decisionData'> & {
  originalData: ExtendedOriginalData;
  requestData: ExtendedRequestData;
  decisionData: ExtendedDecisionData;
};

export type PublicCloudRequestDetailDecorated = _PublicCloudRequestDetail & PublicCloudRequestDecorate;

export type PublicCloudRequestSimple = Prisma.PublicCloudRequestGetPayload<{
  include: {
    decisionMaker: true;
    createdBy: true;
    project: {
      include: {
        projectOwner: true;
        primaryTechnicalLead: true;
        secondaryTechnicalLead: true;
        expenseAuthority: true;
      };
    };
    decisionData: {
      include: {
        projectOwner: true;
        primaryTechnicalLead: true;
        secondaryTechnicalLead: true;
        expenseAuthority: true;
      };
    };
  };
}>;

export type PublicCloudRequestSimpleDecorated = PublicCloudRequestSimple & PublicCloudRequestDecorate;

export type PublicCloudRequestSearch = {
  docs: PublicCloudRequestSimpleDecorated[];
  totalCount: number;
};

export type PublicCloudBillingDetail = Prisma.PublicCloudBillingGetPayload<{
  include: {
    signedBy: true;
    approvedBy: true;
    expenseAuthority: true;
  };
}>;
export type PublicCloudBillingDetailDecorated = PublicCloudBillingDetail & PublicCloudBillingDecorate;
export type PublicCloudBillingSimple = Prisma.PublicCloudBillingGetPayload<{
  include: {
    signedBy: true;
    approvedBy: true;
    expenseAuthority: true;
  };
}>;
export type PublicCloudBillingSimpleDecorated = PublicCloudBillingSimple & PublicCloudBillingDecorate;
export interface PublicCloudBillingSearchResponseMetadataProduct {
  id: string;
  licencePlate: string;
  name: string;
  url: string;
  type: 'product' | 'request';
  provider: Provider;
}

export type PublicCloudBillingSearchResponseMetadataTask = Prisma.TaskGetPayload<{
  select: {
    id: true;
    type: true;
    data: true;
  };
}>;

export type PublicCloudBillingSearchResponseMetadata = {
  publicProducts: PublicCloudBillingSearchResponseMetadataProduct[];
  publicRequests: PublicCloudBillingSearchResponseMetadataProduct[];
  tasks: PublicCloudBillingSearchResponseMetadataTask[];
} | null;

export type PublicCloudBillingSearch = {
  data: PublicCloudBillingSimpleDecorated[];
  totalCount: number;
  metadata: PublicCloudBillingSearchResponseMetadata;
};
