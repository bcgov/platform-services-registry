import * as React from 'react';
import { samplePrivateRequest } from './_components/Params';
import RequestRejectionTemplate from './_templates/public-cloud/RequestRejection';

export const RequestRejection = () => {
  return <RequestRejectionTemplate productName={samplePrivateRequest.requestedProject.name} comment="SAMPLE COMMENT" />;
};

export default RequestRejection;
