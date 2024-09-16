import * as React from 'react';
import { createSamplePrivateCloudRequest } from '@/helpers/mock-resources/private-cloud-request';
import Template from '../_templates/private-cloud/TeamCreateRequestApproval';

export default function TeamCreateRequestApproval() {
  const sampleRequest = createSamplePrivateCloudRequest();
  return <Template request={sampleRequest} />;
}
