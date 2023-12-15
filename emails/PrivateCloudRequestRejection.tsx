import * as React from 'react';
import { samplePrivateRequest } from './components/Params';
import RequestRejectionTemplate from './templates/private-cloud/RequestRejection';

export const RequestRejection = () => {
  return <RequestRejectionTemplate productName={samplePrivateRequest.requestedProject.name} comment="SAMPLE COMMENT" />;
};

export default RequestRejection;
