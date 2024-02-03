import * as React from 'react';
import { samplePublicRequest } from './_components/Params';
import RequestRejectionTemplate from './_templates/public-cloud/RequestRejection';

export const RequestRejection = () => {
  // Extract the product name and human comment from the samplePublicRequest
  const productName = samplePublicRequest.requestedProject.name;
  const humanComment = samplePublicRequest.humanComment || undefined;

  return <RequestRejectionTemplate productName={productName} humanComment={humanComment} />;
};

export default RequestRejection;
