import * as React from 'react';
import { samplePrivateEditRequest } from './_components/Params';
import RequestRejectionTemplate from './_templates/private-cloud/RequestRejection';

export default function RequestRejection() {
  const productName = samplePrivateEditRequest.requestedProject.name;
  const decisionComment = samplePrivateEditRequest.decisionComment || undefined;

  return (
    <RequestRejectionTemplate
      request={samplePrivateEditRequest}
      productName={productName}
      decisionComment={decisionComment}
    />
  );
}
