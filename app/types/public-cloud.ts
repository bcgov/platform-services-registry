import { Prisma } from '@prisma/client';
import { PublicCloudProjectDecorate, PublicCloudRequestDecorate } from './doc-decorate';

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

export type PublicCloudProductDetailDecorated = PublicCloudProductDetail & PublicCloudProjectDecorate;

export type PublicCloudProductSearch = {
  docs: PublicCloudProductSimpleDecorated[];
  totalCount: number;
};

export type PublicCloudRequestDetail = Prisma.PublicCloudRequestGetPayload<{
  include: {
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

export type PublicCloudRequestDetailDecorated = PublicCloudRequestDetail & PublicCloudRequestDecorate;

export type PublicCloudRequestSimple = Prisma.PublicCloudRequestGetPayload<{
  include: {
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
