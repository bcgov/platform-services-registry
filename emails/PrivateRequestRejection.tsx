import * as React from 'react';
import { sampleRequest } from './components/Params';
import { RequestRejectionTemplate } from './templates/private-cloud/RequestRejection';

export const RequestRejection = () => {
  return <RequestRejectionTemplate request={sampleRequest} comment="SAMPLE COMMENT" />;
};

export default RequestRejection;
