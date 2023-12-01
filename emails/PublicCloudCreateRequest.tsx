import * as React from 'react';
import { samplePublicRequest } from './components/Params';
import { NewRequestTemplate } from './templates/public-cloud/CreateRequest';

export const NewRequest = () => {
  return <NewRequestTemplate request={samplePublicRequest} />;
};

export default NewRequest;
