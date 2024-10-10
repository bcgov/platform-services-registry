import { privateCloudProductModel } from './private-cloud-product';
import { privateCloudProductZapResultModel } from './private-cloud-project-zap-result';
import { privateCloudRequestModel } from './private-cloud-request';
import { publicCloudProductModel } from './public-cloud-product';
import { publicCloudRequestModel } from './public-cloud-request';
import { securityConfigModel } from './security-config';
import { sonarScanResultModel } from './sonar-scan-result';
import { userModel } from './user';

export const models = {
  privateCloudProduct: privateCloudProductModel,
  privateCloudRequest: privateCloudRequestModel,
  publicCloudProduct: publicCloudProductModel,
  publicCloudRequest: publicCloudRequestModel,
  privateCloudProductZapResult: privateCloudProductZapResultModel,
  securityConfig: securityConfigModel,
  sonarScanResult: sonarScanResultModel,
  user: userModel,
};
