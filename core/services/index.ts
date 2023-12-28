import { Session } from 'next-auth';

import { PrivateCloudProjectService } from './privateCloudProject';
import { PrivateCloudRequestService } from './privateCloudRequest';
import { PrivateCloudRequestedProjectService } from './privateCloudRequestedProject';
import { PublicCloudProjectService } from './publicCloudProject';
import { PublicCloudRequestService } from './publicCloudRequest';
import { PublicCloudRequestedProjectService } from './publicCloudRequestedProject';
import { PrivateCloudProjectZapResultService } from './privateCloudProjectZapResult';

export function getService(model: string, session: Session) {
  switch (model) {
    case 'PrivateCloudProject':
      return new PrivateCloudProjectService(session);
    case 'PrivateCloudRequest':
      return new PrivateCloudRequestService(session);
    case 'PrivateCloudRequestedProject':
      return new PrivateCloudRequestedProjectService(session);
    case 'PublicCloudProject':
      return new PublicCloudProjectService(session);
    case 'PublicCloudRequest':
      return new PublicCloudRequestService(session);
    case 'PublicCloudRequestedProject':
      return new PublicCloudRequestedProjectService(session);
    case 'PrivateCloudProjectZapResult':
      return new PrivateCloudProjectZapResultService(session);
    default:
      return null;
  }
}
