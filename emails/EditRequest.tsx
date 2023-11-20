import * as React from 'react';
import { sampleEditRequest } from './components/Params';
import EditRequestTemplate from './templates/EditRequestTemplate';

export const EditRequest = () => {
  return <EditRequestTemplate request={sampleEditRequest} comment={'SAMPLE COMMENT'} />;
};

export default EditRequest;
