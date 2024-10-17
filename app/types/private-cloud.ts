import { Ministry, Cluster, ProjectStatus, Prisma } from '@prisma/client';
import { PrivateCloudProjectDecorate, PrivateCloudRequestDecorate } from './doc-decorate';

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

export type PrivateCloudProductDetailDecorated = PrivateCloudProductDetail & PrivateCloudProjectDecorate;

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

export type PrivateCloudRequestDetailDecorated = PrivateCloudRequestDetail & PrivateCloudRequestDecorate;

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
