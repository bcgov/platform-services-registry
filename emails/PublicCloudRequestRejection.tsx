import * as React from 'react';
import { samplePublicRequest } from './_components/Params';
import RequestRejectionTemplate from './_templates/public-cloud/RequestRejection';

export const RequestRejection = () => {
  // Extract the product name and human comment from the samplePublicRequest
  const productName = samplePublicRequest.requestedProject.name;
  const adminComment = samplePublicRequest.adminComment || undefined;

  return <RequestRejectionTemplate productName={productName} adminComment={adminComment} />;
};

export default RequestRejection;
