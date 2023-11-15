import * as React from 'react';
import { sampleEditRequest } from './components/Params';
import EditRequestTemplate from './templates/EditRequestTemplate';

export const EditRequest = () => {
  return <EditRequestTemplate request={sampleEditRequest} />;
};

export default EditRequest;
