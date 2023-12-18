import * as React from 'react';
import { samplePrivateRequest } from './components/Params';
import RequestRejectionTemplate from './templates/public-cloud/RequestRejection';

export const RequestRejection = () => {
  return <RequestRejectionTemplate productName={samplePrivateRequest.requestedProject.name} comment="SAMPLE COMMENT" />;
};

export default RequestRejection;
