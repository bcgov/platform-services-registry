import { EntityOriginKind, Prisma, User } from '@/prisma/client';
import { SystemDecorate, TeamDecorate } from './doc-decorate';

type OriginDecorate = {
  originKind: EntityOriginKind;
  originLabel: string;
  originSummary: string;
};

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

export type SystemSimpleDecorated = SystemSimple & SystemDecorate & OriginDecorate;
export type SystemDetailDecorated = SystemDetail & SystemDecorate & OriginDecorate;

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

export type TeamSimpleDecorated = TeamSimple & TeamDecorate & OriginDecorate;
export type TeamDetailDecorated = Omit<TeamDetail, 'members'> & {
  members: TeamDetailMember[];
} & TeamDecorate &
  OriginDecorate;

export interface ProductAttachmentSummary {
  systems: SystemSimpleDecorated[];
  teams: TeamSimpleDecorated[];
}
