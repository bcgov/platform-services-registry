import * as React from 'react';
import { createSamplePublicCloudRequest } from '@/helpers/mock-resources/public-cloud-request';
import { PublicCloudRequestDetailDecorated } from '@/types/public-cloud';
import Template from '../_templates/public-cloud/ExpenseAuthorityMou';

export default function ExpenseAuthorityMou() {
  const sampleRequest = createSamplePublicCloudRequest();
  return <Template request={sampleRequest as PublicCloudRequestDetailDecorated} />;
}
