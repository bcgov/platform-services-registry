import * as React from 'react';
import { samplePrivateRequest } from '../_components/Params';
import RequestRejectionTemplate from '../_templates/private-cloud/RequestRejection';

export default function RequestRejection() {
  return <RequestRejectionTemplate request={samplePrivateRequest} currentData={samplePrivateRequest.decisionData} />;
}
