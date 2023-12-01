import * as React from 'react';
import { samplePrivateRequest } from './components/Params';
import { NewRequestTemplate } from './templates/private-cloud/CreateRequest';

export const NewRequest = () => {
  return <NewRequestTemplate request={samplePrivateRequest} />;
};

export default NewRequest;
