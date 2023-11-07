import * as React from 'react';
import { sampleFormData } from './components/Params';
import { NewRequestTemplate } from './templates/NewRequestTemplate';

export const NewRequest = () => {
  return <NewRequestTemplate formData={sampleFormData} />;
};

export default NewRequest;
