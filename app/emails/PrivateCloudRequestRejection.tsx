import * as React from 'react';
import { samplePrivateEditRequest } from './_components/Params';
import RequestRejectionTemplate from './_templates/private-cloud/RequestRejection';

export default function RequestRejection() {
  return (
    <RequestRejectionTemplate request={samplePrivateEditRequest} currentData={samplePrivateEditRequest.decisionData} />
  );
}
