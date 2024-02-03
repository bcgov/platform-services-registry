import { Session } from 'next-auth';

import { PrivateCloudProjectService } from './privateCloudProject';
import { PrivateCloudRequestService } from './privateCloudRequest';
import { PrivateCloudRequestedProjectService } from './privateCloudRequestedProject';
import { PublicCloudProjectService } from './publicCloudProject';
import { PublicCloudRequestService } from './publicCloudRequest';
import { PublicCloudRequestedProjectService } from './publicCloudRequestedProject';
import { PrivateCloudProjectZapResultService } from './privateCloudProjectZapResult';
import { SecurityConfigService } from './securityConfig';
import { SonarScanResultService } from './sonarScanResult';

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
    case 'SecurityConfig':
      return new SecurityConfigService(session);
    case 'SonarScanResult':
      return new SonarScanResultService(session);
    default:
      return null;
  }
}
