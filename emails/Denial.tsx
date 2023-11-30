import * as React from 'react';
import { sampleRequest } from './components/Params';
import { DenialTemplate } from './templates/DenialTemplate';

export const RequestDenial = () => {
  return <DenialTemplate request={sampleRequest} comment="SAMPLE COMMENT" />;
};

export default RequestDenial;
