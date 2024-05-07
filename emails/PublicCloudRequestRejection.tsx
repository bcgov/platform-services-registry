import * as React from 'react';
import { samplePublicRequest } from './_components/Params';
import RequestRejectionTemplate from './_templates/public-cloud/RequestRejection';

export default function RequestRejection() {
  // Extract the product name and human comment from the samplePublicRequest
  const productName = samplePublicRequest.requestedProject.name;
  const decisionComment = samplePublicRequest.decisionComment || undefined;

  return (
    <RequestRejectionTemplate
      product={samplePublicRequest.requestedProject}
      productName={productName}
      decisionComment={decisionComment}
    />
  );
}
