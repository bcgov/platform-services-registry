// @ts-ignore
import * as React from 'react';
import { sampleRequest } from './components/Params';
import { NewRequestTemplate } from './templates/private-cloud/AdminCreateRequest';

export const NewRequest = () => {
  return <NewRequestTemplate request={sampleRequest} />;
};

export default NewRequest;
