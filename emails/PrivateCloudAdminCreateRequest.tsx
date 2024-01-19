import * as React from 'react';
import { samplePrivateRequest } from './_components/Params';
import NewRequestTemplate from './_templates/private-cloud/AdminCreateRequest';

export const NewRequest = () => {
  return <NewRequestTemplate request={samplePrivateRequest} />;
};

export default NewRequest;
