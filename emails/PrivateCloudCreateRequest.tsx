import * as React from 'react';
import { samplePrivateRequest } from './_components/Params';
import NewRequestTemplate from './_templates/private-cloud/CreateRequest';

export default function NewRequest() {
  return <NewRequestTemplate request={samplePrivateRequest} />;
}
