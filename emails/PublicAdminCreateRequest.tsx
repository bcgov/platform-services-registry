import * as React from 'react';
import { samplePublicRequest } from './_components/Params';
import AdminCreateRequest from './_templates/public-cloud/AdminRequest';

export default function NewRequest() {
  return <AdminCreateRequest request={samplePublicRequest} />;
}
