import { privateCloudProductModel } from './private-cloud-product';
import { privateCloudProductWebhookModel } from './private-cloud-product-webhook';
import { privateCloudProductZapResultModel } from './private-cloud-project-zap-result';
import { privateCloudRequestModel } from './private-cloud-request';
import { publicCloudBillingModel } from './public-cloud-billing';
import { publicCloudProductModel } from './public-cloud-product';
import { publicCloudRequestModel } from './public-cloud-request';
import { securityConfigModel } from './security-config';
import { sonarScanResultModel } from './sonar-scan-result';
import { userModel } from './user';

export const models = {
  privateCloudProduct: privateCloudProductModel,
  privateCloudRequest: privateCloudRequestModel,
  privateCloudProductWebhook: privateCloudProductWebhookModel,
  publicCloudProduct: publicCloudProductModel,
  publicCloudRequest: publicCloudRequestModel,
  publicCloudBilling: publicCloudBillingModel,
  privateCloudProductZapResult: privateCloudProductZapResultModel,
  securityConfig: securityConfigModel,
  sonarScanResult: sonarScanResultModel,
  user: userModel,
};
