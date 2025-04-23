import _get from 'lodash-es/get';
import React from 'react';
import SharedAdditionalTeamMembers from '@/components/shared/AdditionalTeamMembers';
import { publicCloudProductMemberRoles } from '@/constants';
import { PublicCloudProductMember } from '@/prisma/client';

export default function AdditionalTeamMembers({ disabled }: { disabled?: boolean }) {
  return (
    <SharedAdditionalTeamMembers<PublicCloudProductMember>
      disabled={disabled}
      memberRoles={publicCloudProductMemberRoles}
    >
      <p>
        Additional members can be added to grant privileges on the registry application. These privileges are for
        the&nbsp;<span className="font-semibold">registry only</span>.
      </p>
      <p>
        These members can be managed by the product owner or the product&apos;s technical lead(s). The available roles
        include:
      </p>
      <ul className="list-disc pl-5">
        <li>
          <span className="font-semibold">Viewer</span>: Has read-only access to the product.
        </li>
        <li>
          <span className="font-semibold">Editor</span>: Can edit the product and submit edit requests.
        </li>
        <li>
          <span className="font-semibold">Billing Viewer</span>: Can view the product and download the eMOU.
        </li>
        <li>
          <span className="font-semibold">Subscriber</span>: Receives email notifications about product-related
          activities.
        </li>
      </ul>
    </SharedAdditionalTeamMembers>
  );
}
