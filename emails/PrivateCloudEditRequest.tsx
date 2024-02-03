import * as React from 'react';
import { samplePrivateEditRequest } from './_components/Params';
import EditRequestTemplate from './_templates/private-cloud/EditRequest';

export const EditRequest = () => {
  return <EditRequestTemplate request={samplePrivateEditRequest} />;
};

export default EditRequest;
