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

import { Input, Label } from '@rebass/forms';
import React from 'react';
import { Field } from 'react-final-form';
import { Flex } from 'rebass';
import { COMPONENT_METADATA } from '../../constants';
import getValidator from '../../utils/getValidator';

const CreateFormMetadata: React.FC = () => {
  const validator = getValidator();

  return (
    <div>
      <Label variant="adjacentLabel">
        Please indicate what services you expect to utilize as part of your project?
      </Label>
      {COMPONENT_METADATA.map((item) => (
        <Flex key={item.inputValue}>
          <Label variant="adjacentLabel">{item.displayName}</Label>
          <Flex flex="1 1 auto" justifyContent="flex-end">
            <Label width="initial" px="8px">
              <Field name={`project-${item.inputValue}`} component="input" type="checkbox">
                {({ input }) => (
                  <input
                    style={{ width: '35px', height: '35px' }}
                    name={input.name}
                    type="checkbox"
                    checked={input.checked}
                    onChange={input.onChange}
                  />
                )}
              </Field>
            </Label>
          </Flex>
        </Flex>
      ))}
      <Field name="project-other" validate={validator.mustBeValidComponentOthers}>
        {({ input, meta }) => (
          <Flex pb="25px" style={{ position: 'relative' }}>
            <Label htmlFor="project-other">Other:</Label>
            <Flex flex="1 1 auto" justifyContent="flex-end">
              <Input {...input} id="project-other" />
            </Flex>
            {meta.error && meta.touched && (
              <Label as="span" style={{ position: 'absolute', bottom: '0' }} variant="errorLabel">
                {meta.error}
              </Label>
            )}
          </Flex>
        )}
      </Field>
    </div>
  );
};

export default CreateFormMetadata;
