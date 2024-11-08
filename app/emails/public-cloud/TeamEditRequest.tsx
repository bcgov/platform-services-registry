import { PublicCloudProductMemberRole } from '@prisma/client';
import * as React from 'react';
import { getRandomUser } from '@/helpers/mock-resources/core';
import { createSamplePublicCloudRequest } from '@/helpers/mock-resources/public-cloud-request';
import { PublicCloudRequestDetailDecorated } from '@/types/public-cloud';
import Template from '../_templates/public-cloud/TeamEditRequest';

export default function TeamEditRequest() {
  const sampleRequest = createSamplePublicCloudRequest() as PublicCloudRequestDetailDecorated;
  const sampleUser = getRandomUser();

  if (sampleRequest.originalData) sampleRequest.originalData.members = [];
  sampleRequest.decisionData.members = [
    {
      ...sampleUser,
      email: 'private.admin.system@gov.bc.ca',
      userId: '',
      roles: [],
    },
    {
      ...sampleUser,
      email: 'kevin.taylor@gov.bc.ca',
      userId: '',
      roles: [PublicCloudProductMemberRole.VIEWER, PublicCloudProductMemberRole.SUBSCRIBER],
    },
  ];

  return <Template request={sampleRequest} requester={sampleUser.displayName} />;
}
