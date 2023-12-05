import { Prisma, PrismaClient, $Enums } from '@prisma/client';
import { Session } from 'next-auth';

import { PrivateCloudProjectService } from './privateCloudProject';
import { PrivateCloudRequestService } from './privateCloudRequest';
import { PrivateCloudRequestedProjectService } from './privateCloudRequestedProject';
import { PublicCloudProjectService } from './publicCloudProject';
import { PublicCloudRequestService } from './publicCloudRequest';
import { PublicCloudRequestedProjectService } from './publicCloudRequestedProject';

export function getService(model: string, client: PrismaClient, session: Session) {
  switch (model) {
    case 'PrivateCloudProject':
      return new PrivateCloudProjectService(client, session);
    case 'PrivateCloudRequest':
      return new PrivateCloudRequestService(client, session);
    case 'PrivateCloudRequestedProject':
      return new PrivateCloudRequestedProjectService(client, session);
    case 'PublicCloudProject':
      return new PublicCloudProjectService(client, session);
    case 'PublicCloudRequest':
      return new PublicCloudRequestService(client, session);
    case 'PublicCloudRequestedProject':
      return new PublicCloudRequestedProjectService(client, session);
    default:
      return null;
  }
}
