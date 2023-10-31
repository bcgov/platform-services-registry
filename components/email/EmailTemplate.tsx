import * as React from 'react';
import { PrivateCloudCreateRequestBodySchema, PrivateCloudCreateRequestBody } from '@/schema';

export const EmailTemplate = ({ body }) => {
  console.log(body);
  //// Validation
  const parsedBody = PrivateCloudCreateRequestBodySchema.safeParse(body);
  const formData: PrivateCloudCreateRequestBody = parsedBody.data;

  return (
    <div>
      <h1>Welcome, {formData.projectOwner.firstName}!</h1>
    </div>
  );
};
