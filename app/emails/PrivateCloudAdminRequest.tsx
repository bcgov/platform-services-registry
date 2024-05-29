import * as React from 'react';
import { samplePrivateEditRequest } from './_components/Params';
import NewRequestTemplate from './_templates/private-cloud/AdminEditRequest';

export default function NewRequest() {
  return <NewRequestTemplate request={samplePrivateEditRequest} userName={'Session User'} />;
}
