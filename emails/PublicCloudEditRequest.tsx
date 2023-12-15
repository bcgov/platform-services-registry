import * as React from 'react';
import { samplePublicEditRequest } from './components/Params';
import EditRequestTemplate from './templates/public-cloud/EditRequest';

const EditRequest = () => {
  return <EditRequestTemplate request={samplePublicEditRequest} />;
};

export default EditRequest;
