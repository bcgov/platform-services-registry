import * as React from 'react';
import { createSamplePrivateCloudRequest } from '@/helpers/mock-resources/private-cloud-request';
import { PrivateCloudRequestDetailDecorated } from '@/types/private-cloud';
import Template from '../_templates/private-cloud/TeamEditRequestCompletion';

export default function TeamEditRequestCompletion() {
  const sampleRequest = createSamplePrivateCloudRequest();
  return <Template request={sampleRequest as PrivateCloudRequestDetailDecorated} />;
}
