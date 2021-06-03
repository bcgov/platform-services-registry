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
import { COMPONENT_METADATA } from '../../constants';
import getValidator from '../../utils/getValidator';
import CheckboxInput from '../common/UI/CheckboxInput';
import FormSubtitle from '../common/UI/FormSubtitle';
import FormTitle from '../common/UI/FormTitle';
import TextInput from '../common/UI/TextInput';

const CreateFormMetadata: React.FC = () => {
  const validator = getValidator();

  return (
    <div>
      <FormTitle>Tell us about your project</FormTitle>
      <FormSubtitle>
        Please indicate what services you expect to utilize as part of your project?
      </FormSubtitle>
      {COMPONENT_METADATA.map((item) => (
        <Flex mt={3} key={item.inputValue}>
          <Label variant="adjacentLabel" m="auto">
            {item.displayName}
          </Label>
          <Flex flex="1 1 auto" justifyContent="flex-end">
            <Field<boolean>
              name={`project-${item.inputValue}`}
              component={CheckboxInput}
              type="checkbox"
            />
          </Flex>
        </Flex>
      ))}
      <Flex>
        <Label variant="adjacentLabel" m="auto" htmlFor="project-other">
          Other:
        </Label>
        <Flex flex="1 1 auto" justifyContent="flex-end" name="project-other">
          <Field<string>
            name="project-other"
            component={TextInput}
            validate={validator.mustBeValidComponentOthers}
            sx={{ textTransform: 'none' }}
          />
        </Flex>
      </Flex>
    </div>
  );
};

export default CreateFormMetadata;
