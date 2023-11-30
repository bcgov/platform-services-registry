import * as React from 'react';
import { sampleEditRequest } from './components/Params';
import EditRequestTemplate from './templates/private-cloud/EditRequest';

export const EditRequest = () => {
  return <EditRequestTemplate request={sampleEditRequest} comment="SAMPLE COMMENT" />;
};

export default EditRequest;
