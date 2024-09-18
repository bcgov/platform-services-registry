import * as React from 'react';
import { getRandomUser } from '@/helpers/mock-resources/core';
import { createSamplePrivateCloudRequest } from '@/helpers/mock-resources/private-cloud-request';
import Template from '../_templates/private-cloud/TeamDeleteRequest';

export default function TeamDeleteRequest() {
  const sampleRequest = createSamplePrivateCloudRequest();
  const sampleUser = getRandomUser();
  return <Template request={sampleRequest} requester={sampleUser.displayName} />;
}