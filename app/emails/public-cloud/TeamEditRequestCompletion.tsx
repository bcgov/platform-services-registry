import * as React from 'react';
import { createSamplePublicCloudRequest } from '@/helpers/mock-resources/public-cloud-request';
import Template from '../_templates/public-cloud/TeamEditRequestCompletion';

export default function TeamEditRequestCompletion() {
  const sampleRequest = createSamplePublicCloudRequest();
  return <Template request={sampleRequest} />;
}
