import * as React from 'react';
import { createSamplePrivateCloudRequest } from '@/helpers/mock-resources/private-cloud-request';
import Template from '../_templates/private-cloud/DeleteRequestApproval';

export default function DeleteRequestApproval() {
  const sampleRequest = createSamplePrivateCloudRequest();
  return <Template request={sampleRequest} />;
}
