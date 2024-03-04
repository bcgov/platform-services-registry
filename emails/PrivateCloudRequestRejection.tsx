import * as React from 'react';
import { samplePrivateRequest } from './_components/Params';
import RequestRejectionTemplate from './_templates/private-cloud/RequestRejection';

export default function RequestRejection() {
  const productName = samplePrivateRequest.requestedProject.name;
  const decisionComment = samplePrivateRequest.decisionComment || undefined;

  return <RequestRejectionTemplate productName={productName} decisionComment={decisionComment} />;
}
