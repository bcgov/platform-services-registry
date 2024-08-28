import * as React from 'react';
import { samplePrivateRequest } from './_components/Params';
import EditRequestTemplate from './_templates/private-cloud/EditRequest';

export default function EditRequest() {
  return <EditRequestTemplate request={samplePrivateRequest} userName={'Session User'} />;
}
