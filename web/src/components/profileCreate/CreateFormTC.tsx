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
import React, { useState } from 'react';
import { Field } from 'react-final-form';
import { Flex } from 'rebass';
import Aux from '../../hoc/auxillary';
import getValidator from '../../utils/getValidator';
import { StyledFormButton } from '../common/UI/Button';
import FormSubtitle from '../common/UI/FormSubtitle';
import FormTitle from '../common/UI/FormTitle';
import TextInput from '../common/UI/TextInput';

const CreateFormTC: React.FC = () => {
  const validator = getValidator();
  const [TCcount, setTCcount] = useState(1);

  const changeTCCount = (increment: number) => {
    if (TCcount + increment > 0 && TCcount + increment <= 3) {
      setTCcount(TCcount + increment);
    }
  }
  console.log(TCcount)

  let tcs = []
  for (let count = 1; count < TCcount + 1; count++) {
    const key: string = `tc${count}`;
    const tc_firstName: string = `tc-firstName${count}`;
    const tc_lastName: string = `tc-lastName${count}`;
    const tc_email: string = `tc-email${count}`;
    const tc_githubId: string = `tc-githubId${count}`;

    tcs.push(
      <Aux key={key}>
        <FormTitle>Who is the technical contact for this project?</FormTitle>
        <FormSubtitle>
          Tell us about the Technical Contact (TC). This is typically the DevOps specialist; we will
          use this information to contact them with technical questions or notify them about platform
          events.
        </FormSubtitle>
        <Flex flexDirection="column">
          <Label htmlFor={tc_firstName}>First Name</Label>
          <Field<string>
            name={tc_firstName}
            component={TextInput}
            validate={validator.mustBeValidName}
            placeholder="Jane"
          />
        </Flex>
        <Flex flexDirection="column">
          <Label htmlFor={tc_lastName}>Last Name</Label>
          <Field<string>
            name={tc_lastName}
            component={TextInput}
            validate={validator.mustBeValidName}
            placeholder="Doe"
          />
        </Flex>
        <Flex flexDirection="column">
          <Label htmlFor={tc_email}>Email Address</Label>
          <Field<string>
            name={tc_email}
            component={TextInput}
            validate={validator.mustBeValidEmail}
            placeholder="jane.doe@example.com"
          />
        </Flex>
        <Flex flexDirection="column">
          <Label htmlFor={tc_githubId}>GitHub Id</Label>
          <Field<string>
            name={tc_githubId}
            component={TextInput}
            validate={validator.mustBeValidGithubName}
            placeholder="jane1100"
          />
        </Flex>
      </Aux>
    );
  }
  console.log(tcs)
  return (
    <Aux>
      {tcs}
      <div className="buttons">
        {(
          <StyledFormButton
            type="button"
            onClick={() => changeTCCount(-1)}
            style={{ backgroundColor: '#d3d3d3', color: '#036' }}
          >
            Remove TC
          </StyledFormButton>
        )}
        {(
          <StyledFormButton
            type="button"
            onClick={() => changeTCCount(1)}
          >
            Add TC
          </StyledFormButton>
        )}
      </div>
    </Aux >

  );
};

export default CreateFormTC;
