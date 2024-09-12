import * as React from 'react';
import { samplePublicRequest } from '../_components/Params';
import AdminCreateRequest from '../_templates/public-cloud/AdminCreateRequest';

export default function PublicAdminCreateRequest() {
  return <AdminCreateRequest request={samplePublicRequest} userName={'User Session'} />;
}
