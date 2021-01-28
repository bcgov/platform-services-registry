//
// Copyright © 2020 Province of British Columbia
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

import { Checkbox, Input, Label } from '@rebass/forms';
import React, { useState } from 'react';
import { Field } from 'react-final-form';
import { Flex, Text } from 'rebass';
import getValidator from '../../utils/getValidator';
import { StyledFormButton, StyledFormDisabledButton } from '../common/UI/Button';
import FormTitle from '../common/UI/FormTitle';

const CreateFormTC: React.FC = () => {
  const validator = getValidator();

  const [boxChecked, setBoxChecked] = useState(false);

  return (
    <div>
      <FormTitle>Who is the technical contact for this project?</FormTitle>

      <Field name="tc-firstName" validate={validator.mustBeValidName}>
        {({ input, meta }) => (
          <Flex flexDirection="column" pb="25px" style={{ position: 'relative' }}>
            <Label m="0" htmlFor="tc-first-name">
              First Name
            </Label>
            <Input mt="8px" {...input} id="tc-first-name" placeholder="Jane" />
            {meta.error && meta.touched && (
              <Label as="span" style={{ position: 'absolute', bottom: '0' }} variant="errorLabel">
                {meta.error}
              </Label>
            )}
          </Flex>
        )}
      </Field>
      <Field name="tc-lastName" validate={validator.mustBeValidName}>
        {({ input, meta }) => (
          <Flex flexDirection="column" pb="25px" style={{ position: 'relative' }}>
            <Label m="0" htmlFor="tc-last-name">
              Last Name
            </Label>
            <Input mt="8px" {...input} id="tc-last-name" placeholder="Doe" />
            {meta.error && meta.touched && (
              <Label as="span" style={{ position: 'absolute', bottom: '0' }} variant="errorLabel">
                {meta.error}
              </Label>
            )}
          </Flex>
        )}
      </Field>
      <Field name="tc-email" validate={validator.mustBeValidEmail}>
        {({ input, meta }) => (
          <Flex flexDirection="column" pb="25px" style={{ position: 'relative' }}>
            <Label m="0" htmlFor="tc-email">
              eMail Address
            </Label>
            <Input mt="8px" {...input} id="tc-email" placeholder="jane.doe@gov.bc.ca" />
            {meta.error && meta.touched && (
              <Label as="span" style={{ position: 'absolute', bottom: '0' }} variant="errorLabel">
                {meta.error}
              </Label>
            )}
          </Flex>
        )}
      </Field>
      <Field name="tc-githubId" validate={validator.mustBeValidGithubName}>
        {({ input, meta }) => (
          <Flex flexDirection="column" pb="25px" style={{ position: 'relative' }}>
            <Label m="0" htmlFor="tc-github-id">
              GitHub ID
            </Label>
            <Input mt="8px" {...input} id="tc-github-id" placeholder="jane1100" />
            {meta.error && meta.touched && (
              <Label as="span" style={{ position: 'absolute', bottom: '0' }} variant="errorLabel">
                {meta.error}
              </Label>
            )}
          </Flex>
        )}
      </Field>

      <Label>
        <Checkbox
          type="checkbox"
          defaultChecked={boxChecked}
          onChange={() => {
            setBoxChecked(!boxChecked);
          }}
        />
        <Text px="20px">
          By checking this box, i confirm that I have read and understood the roles and
          responsibilities as described in the{' '}
          <a
            rel="noopener noreferrer"
            href="https://developer.gov.bc.ca/Welcome-to-our-Platform-Community!"
            target="_blank"
          >
            Onboarding Guide
          </a>
          .
        </Text>
      </Label>

      {/* @ts-ignore */}
      {boxChecked ? (
        <StyledFormButton>Request</StyledFormButton>
      ) : (
        <StyledFormDisabledButton>Request</StyledFormDisabledButton>
      )}
    </div>
  );
};

export default CreateFormTC;
