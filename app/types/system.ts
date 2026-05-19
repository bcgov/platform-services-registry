import { Prisma, User } from '@/prisma/client';
import { SystemDecorate, TeamDecorate } from './doc-decorate';

export type SystemSimple = Prisma.SystemGetPayload<{
  include: {
    organization: true;
    teamLinks: true;
    privateCloudProductLinks: true;
    publicCloudProductLinks: true;
  };
}>;

export type LinkedSystemTeam = Prisma.TeamGetPayload<{
  include: {
    systemLinks: true;
  };
}>;

export type SystemDetail = Prisma.SystemGetPayload<{
  include: {
    organization: true;
    teamLinks: {
      include: {
        team: true;
      };
    };
    privateCloudProductLinks: {
      include: {
        privateCloudProduct: {
          include: {
            organization: true;
          };
        };
      };
    };
    publicCloudProductLinks: {
      include: {
        publicCloudProduct: {
          include: {
            organization: true;
          };
        };
      };
    };
  };
}>;

export type SystemSimpleDecorated = SystemSimple & SystemDecorate;
export type SystemDetailDecorated = SystemDetail & SystemDecorate;

export type TeamSimple = Prisma.TeamGetPayload<{
  include: {
    systemLinks: true;
    privateCloudProductLinks: true;
    publicCloudProductLinks: true;
  };
}>;

export type TeamDetail = Prisma.TeamGetPayload<{
  include: {
    systemLinks: {
      include: {
        system: {
          include: {
            organization: true;
          };
        };
      };
    };
    privateCloudProductLinks: {
      include: {
        privateCloudProduct: {
          include: {
            organization: true;
          };
        };
      };
    };
    publicCloudProductLinks: {
      include: {
        publicCloudProduct: {
          include: {
            organization: true;
          };
        };
      };
    };
  };
}>;

export type TeamDetailMember = TeamDetail['members'][number] & {
  user: User | null;
};

export type TeamSimpleDecorated = TeamSimple & TeamDecorate;
export type TeamDetailDecorated = Omit<TeamDetail, 'members'> & {
  members: TeamDetailMember[];
} & TeamDecorate;

export interface ProductAttachmentSummary {
  systems: SystemSimpleDecorated[];
  teams: TeamSimpleDecorated[];
}
