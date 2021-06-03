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

import { Label } from '@rebass/forms';
import React from 'react';
import { Field } from 'react-final-form';
import { Flex } from 'rebass';
import Aux from '../../hoc/auxillary';
import getValidator from '../../utils/getValidator';
import FormSubtitle from '../common/UI/FormSubtitle';
import FormTitle from '../common/UI/FormTitle';
import TextInput from '../common/UI/TextInput';

const CreateFormTC: React.FC = () => {
  const validator = getValidator();

  return (
    <Aux>
      <FormTitle>Who is the technical contact for this project?</FormTitle>
      <FormSubtitle>
        Tell us about the Technical Contact (TC). This is typically the DevOps specialist; we will
        use this information to contact them with technical questions or notify them about platform
        events.
      </FormSubtitle>
      <Flex flexDirection="column">
        <Label htmlFor="tc-firstName">First Name</Label>
        <Field<string>
          name="tc-firstName"
          component={TextInput}
          validate={validator.mustBeValidName}
          placeholder="Jane"
        />
      </Flex>
      <Flex flexDirection="column">
        <Label htmlFor="tc-lastName">Last Name</Label>
        <Field<string>
          name="tc-lastName"
          component={TextInput}
          validate={validator.mustBeValidName}
          placeholder="Doe"
        />
      </Flex>
      <Flex flexDirection="column">
        <Label htmlFor="tc-email">Email Address</Label>
        <Field<string>
          name="tc-email"
          component={TextInput}
          validate={validator.mustBeValidEmail}
          placeholder="jane.doe@example.com"
          sx={{ textTransform: 'none' }}
        />
      </Flex>
      <Flex flexDirection="column">
        <Label htmlFor="tc-githubId">GitHub Id</Label>
        <Field<string>
          name="tc-githubId"
          component={TextInput}
          validate={validator.mustBeValidGithubName}
          placeholder="jane1100"
          sx={{ textTransform: 'none' }}
        />
      </Flex>
    </Aux>
  );
};

export default CreateFormTC;
