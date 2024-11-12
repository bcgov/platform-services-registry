import { PrivateCloudProductMemberRole } from '@prisma/client';
import * as React from 'react';
import { getRandomUser } from '@/helpers/mock-resources/core';
import { createSamplePrivateCloudRequest } from '@/helpers/mock-resources/private-cloud-request';
import { PrivateCloudRequestDetailDecorated } from '@/types/private-cloud';
import Template from '../_templates/private-cloud/AdminEditRequest';

export default function AdminRequest() {
  const sampleRequest = createSamplePrivateCloudRequest() as PrivateCloudRequestDetailDecorated;
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
      roles: [PrivateCloudProductMemberRole.VIEWER, PrivateCloudProductMemberRole.SUBSCRIBER],
    },
  ];

  return <Template request={sampleRequest as PrivateCloudRequestDetailDecorated} requester={sampleUser.displayName} />;
}
