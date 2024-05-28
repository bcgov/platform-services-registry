import { Session } from 'next-auth';
import { PrivateCloudProjectService } from './private-cloud-project';
import { PrivateCloudProjectZapResultService } from './private-cloud-project-zap-result';
import { PrivateCloudRequestService } from './private-cloud-request';
import { PrivateCloudRequestedProjectService } from './private-cloud-requested-project';
import { PublicCloudProjectService } from './public-cloud-project';
import { PublicCloudRequestService } from './public-cloud-request';
import { PublicCloudRequestedProjectService } from './public-cloud-requested-project';
import { SecurityConfigService } from './security-config';
import { SonarScanResultService } from './sonar-scan-result';

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
