import * as React from 'react';
import { getRandomUser } from '@/helpers/mock-resources/core';
import { createSamplePrivateCloudRequest } from '@/helpers/mock-resources/private-cloud-request';
import { Env, ResourceType } from '@/prisma/client';
import { PrivateCloudRequestDetailDecorated } from '@/types/private-cloud';
import Template from '../_templates/private-cloud/AdminEditRequestQuotaAutoApproval';

export default function AdminEditRequestQuotaAutoApproval() {
  const sampleRequest = createSamplePrivateCloudRequest();
  const sampleUser = getRandomUser();

  sampleRequest.quotaUpgradeResourceDetailList = [
    {
      env: Env.development,
      resourceType: ResourceType.cpu,
      allocation: {
        request: 1000,
        limit: 2000,
      },
      deployment: {
        request: 1000,
        limit: 2000,
        usage: 1800,
      },
    },
    {
      env: Env.test,
      resourceType: ResourceType.memory,
      allocation: {
        request: 1000,
        limit: 2000,
      },
      deployment: {
        request: 134217728,
        limit: 536870912,
        usage: 402653184,
      },
    },
  ];

  return <Template request={sampleRequest as PrivateCloudRequestDetailDecorated} requester={sampleUser.displayName} />;
}
