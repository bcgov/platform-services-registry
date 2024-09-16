import * as React from 'react';
import { createSamplePublicCloudRequest } from '@/helpers/mock-resources/public-cloud-request';
import Template from '../_templates/public-cloud/TeamCreateRequestRejection';

export default function TeamCreateRequestRejection() {
  const sampleRequest = createSamplePublicCloudRequest();
  return <Template request={sampleRequest} />;
}
