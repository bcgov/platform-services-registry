import * as React from 'react';
import { createSamplePublicCloudRequest } from '@/helpers/mock-resources/public-cloud-request';
import Template from '../_templates/public-cloud/ExpenseAuthority';

export default function ExpenseAuthority() {
  const sampleRequest = createSamplePublicCloudRequest();
  return <Template request={sampleRequest} />;
}
