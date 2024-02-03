import * as React from 'react';
import { samplePrivateRequest } from './_components/Params';
import RequestRejectionTemplate from './_templates/private-cloud/RequestRejection';

export const RequestRejection = () => {
  const productName = samplePrivateRequest.requestedProject.name;
  const humanComment = samplePrivateRequest.humanComment || undefined;

  return <RequestRejectionTemplate productName={productName} humanComment={humanComment} />;
};

export default RequestRejection;
