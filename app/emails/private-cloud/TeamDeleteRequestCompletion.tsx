import * as React from 'react';
import { createSamplePrivateCloudRequest } from '@/helpers/mock-resources/private-cloud-request';
import Template from '../_templates/private-cloud/TeamDeleteRequestCompletion';

export default function TeamDeleteRequestCompletion() {
  const sampleRequest = createSamplePrivateCloudRequest();
  return <Template request={sampleRequest} />;
}