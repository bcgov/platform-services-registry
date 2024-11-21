import { Ministry, Cluster, User, Prisma, PrivateCloudProductMember } from '@prisma/client';
import { PrivateCloudProjectDecorate, PrivateCloudRequestDecorate } from './doc-decorate';

export type ExtendedPrivateCloudProductMember = PrivateCloudProductMember & User;

interface ExtendedPrivateCloudProductMembersData {
  members: ExtendedPrivateCloudProductMember[];
}

export type PrivateCloudProductSimple = Prisma.PrivateCloudProjectGetPayload<{
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

export type PrivateCloudProductSimpleDecorated = PrivateCloudProductSimple & PrivateCloudProjectDecorate;

export type PrivateCloudProductDetail = Prisma.PrivateCloudProjectGetPayload<{
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

export type PrivateCloudProductDetailDecorated = _PrivateCloudProductDetail & PrivateCloudProjectDecorate;

export type PrivateCloudProductSearch = {
  docs: PrivateCloudProductSimpleDecorated[];
  totalCount: number;
};

export type PrivateCloudRequestDetail = Prisma.PrivateCloudRequestGetPayload<{
  include: {
    decisionMaker: true;
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
