import * as React from 'react';
import { getRandomUser } from '@/helpers/mock-resources/core';
import { createSamplePublicCloudRequest } from '@/helpers/mock-resources/public-cloud-request';
import { PublicCloudRequestDetailDecorated } from '@/types/public-cloud';
import Template from '../_templates/public-cloud/TeamCreateRequest';

export default function TeamCreateRequest() {
  const sampleRequest = createSamplePublicCloudRequest();
  const sampleUser = getRandomUser();
  return <Template request={sampleRequest as PublicCloudRequestDetailDecorated} requester={sampleUser.displayName} />;
}
