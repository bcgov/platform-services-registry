import * as React from 'react';
import { samplePublicEditRequest } from './_components/Params';
import EditSummaryTemplate from './_templates/public-cloud/EditSummary';

const EditRequest = () => {
  return <EditSummaryTemplate request={samplePublicEditRequest} comment="SAMPLE COMMENT" />;
};

export default EditRequest;
