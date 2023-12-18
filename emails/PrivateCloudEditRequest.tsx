import * as React from 'react';
import { samplePrivateEditRequest } from './components/Params';
import EditRequestTemplate from './templates/private-cloud/EditRequest';

export const EditRequest = () => {
  return <EditRequestTemplate request={samplePrivateEditRequest} comment="SAMPLE COMMENT" />;
};

export default EditRequest;
