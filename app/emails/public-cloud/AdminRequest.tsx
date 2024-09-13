import * as React from 'react';
import { getRandomUser } from '@/helpers/mock-resources/core';
import { createSamplePublicCloudRequest } from '@/helpers/mock-resources/public-cloud-request';
import Template from '../_templates/public-cloud/AdminRequest';

export default function AdminRequest() {
  const sampleRequest = createSamplePublicCloudRequest();
  const sampleUser = getRandomUser();
  return <Template request={sampleRequest} userName={sampleUser.displayName} />;
}
