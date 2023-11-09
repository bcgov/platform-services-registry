import * as React from 'react';
import { sampleRequest } from './components/Params';
import { NewRequestTemplate } from './templates/NewRequestTemplate';

export const NewRequest = () => {
  return <NewRequestTemplate request={sampleRequest} />;
};

export default NewRequest;
