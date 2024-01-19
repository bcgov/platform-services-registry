import * as React from 'react';
import { samplePublicEditRequest } from './_components/Params';
import EditRequestTemplate from './_templates/public-cloud/EditRequest';

const EditRequest = () => {
  return <EditRequestTemplate request={samplePublicEditRequest} comment="SAMPLE COMMENT" />;
};

export default EditRequest;
