import { Prisma, User, PublicCloudProductMember } from '@prisma/client';
import { PublicCloudProjectDecorate, PublicCloudRequestDecorate } from './doc-decorate';

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
    billing: {
      include: {
        expenseAuthority: true;
        signedBy: true;
        approvedBy: true;
      };
    };
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
        billing: true;
      };
    };
    originalData: {
      include: {
        projectOwner: true;
        primaryTechnicalLead: true;
        secondaryTechnicalLead: true;
        expenseAuthority: true;
        billing: true;
      };
    };
    requestData: {
      include: {
        projectOwner: true;
        primaryTechnicalLead: true;
        secondaryTechnicalLead: true;
        expenseAuthority: true;
        billing: true;
      };
    };
    decisionData: {
      include: {
        projectOwner: true;
        primaryTechnicalLead: true;
        secondaryTechnicalLead: true;
        expenseAuthority: true;
        billing: {
          include: {
            expenseAuthority: true;
            signedBy: true;
            approvedBy: true;
          };
        };
      };
    };
  };
}>;

type ExtendedOriginalData =
  | (Omit<NonNullable<PublicCloudRequestDetail['originalData']>, 'members'> & ExtendedPublicCloudProductMembersData)
  | null;

type ExtendedRequestData =
  | (Omit<PublicCloudRequestDetail['requestData'], 'members'> & ExtendedPublicCloudProductMembersData)
  | null;

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
        billing: true;
      };
    };
    decisionData: {
      include: {
        projectOwner: true;
        primaryTechnicalLead: true;
        secondaryTechnicalLead: true;
        expenseAuthority: true;
        billing: true;
      };
    };
  };
}>;

export type PublicCloudRequestSimpleDecorated = PublicCloudRequestSimple & PublicCloudRequestDecorate;

export type PublicCloudRequestSearch = {
  docs: PublicCloudRequestSimpleDecorated[];
  totalCount: number;
};
