import * as React from 'react';
import { samplePrivateRequest } from './components/Params';
import { RequestRejectionTemplate } from './templates/private-cloud/RequestRejection';

export const RequestRejection = () => {
  return <RequestRejectionTemplate request={samplePrivateRequest} comment="SAMPLE COMMENT" />;
};

export default RequestRejection;
