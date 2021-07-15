//
// Copyright © 2020 Province of British Columbia
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

import React from 'react';
import { Label } from '@rebass/forms';
import { StyledFormButton, StyledFormDisabledButton } from './Button';

export const EditSubmitButton = ({ hasPendingEdit, isProvisioned, pristine }: any) => {
  if (pristine) {
    return (
      <>
        {/* @ts-ignore */}
        <StyledFormDisabledButton disabled style={{ display: 'block' }}>
          Request Update
        </StyledFormDisabledButton>
      </>
    );
  }
  if (!hasPendingEdit && isProvisioned) {
    return <StyledFormButton style={{ display: 'block' }}>Request Update</StyledFormButton>;
  }
  return (
    <>
      {/* @ts-ignore */}
      <StyledFormDisabledButton disabled style={{ display: 'block' }}>
        Request Update
      </StyledFormDisabledButton>
      <Label as="span" variant="errorLabel">
        Not available due to a {isProvisioned ? 'Update' : 'Provision'} Request{' '}
      </Label>
    </>
  );
};

export default EditSubmitButton;
