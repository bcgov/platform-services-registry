import * as React from 'react';
import { createSamplePublicCloudBilling } from '@/helpers/mock-resources/public-cloud-billing';
import { createSamplePublicCloudRequest } from '@/helpers/mock-resources/public-cloud-request';
import { PublicCloudBillingDetailDecorated, PublicCloudRequestDetailDecorated } from '@/types/public-cloud';
import Template from '../_templates/public-cloud/BillingReviewerMou';

export default function BillingReviewerMou() {
  const sampleRequest = createSamplePublicCloudRequest();
  const sampleBilling = createSamplePublicCloudBilling();
  return (
    <Template
      request={sampleRequest as PublicCloudRequestDetailDecorated}
      billing={sampleBilling as PublicCloudBillingDetailDecorated}
    />
  );
}
