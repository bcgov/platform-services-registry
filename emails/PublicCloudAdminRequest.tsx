import * as React from 'react';
import { samplePublicRequest } from './_components/Params';
import AdminRequestTemplate from './_templates/public-cloud/AdminRequest';

export default function AdminRequest() {
  return <AdminRequestTemplate request={samplePublicRequest} userName={'Session User'} />;
}
