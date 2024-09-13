import * as React from 'react';
import { createSamplePrivateCloudRequest } from '@/helpers/mock-resources/private-cloud-request';
import Template from '../_templates/private-cloud/RequestRejection';

export default function RequestRejection() {
  const sampleRequest = createSamplePrivateCloudRequest();
  return <Template request={sampleRequest} currentData={sampleRequest.decisionData} />;
}
