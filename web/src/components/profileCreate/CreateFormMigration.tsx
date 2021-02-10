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
import getValidator from '../../utils/getValidator';
import { Condition } from '../common/UI/FormControls';
import FormSubtitle from '../common/UI/FormSubtitle';
import FormTitle from '../common/UI/FormTitle';

const CreateFormMigration: React.FC = () => {
  const validator = getValidator();

  return (
    <div>
      <FormTitle>Tell us about your project</FormTitle>
      <FormSubtitle>
        As the capacity in the Silver cluster remains to be an issue due to the slow progress of the
        app migration, the priority will be given to provisioning namespaces for the projects that:
        <blockquote>
          <br /> a) migrate from OCP3 and
          <br /> b) have short 2-3 week migration timelines starting from when the namespaces are
          provisioned.
        </blockquote>
        Please indicate if your project meets the two criteria
        above and include the license plate number for the OCP3 project set.
      </FormSubtitle>
      <Flex pb="20px">
        <Label m="0" variant="adjacentLabel">
          Is this app migrating from OCP 3.11?
        </Label>
        <Flex flex="1 1 auto" justifyContent="flex-end">
          <Label m="0" width="initial" px="8px" my="auto">
            <Field name="project-migratingApplication" component="input" type="checkbox">
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
      <Condition when="project-migratingApplication" is={true}>
        <Field name="project-migratingLicenseplate" validate={validator.mustBeValidProfileLicenseplate}>
          {({ input, meta }) => (
            <Flex flexDirection="column" pb="25px" style={{ position: 'relative' }}>
              <Label m="0" htmlFor="project-migratingLicenseplate">
                OCP 3.11 license plate
              </Label>
              <Input mt="8px" {...input} id="project-migratingLicenseplate" placeholder="1362av" />
              {meta.error && meta.touched && (
                <Label as="span" style={{ position: 'absolute', bottom: '0' }} variant="errorLabel">
                  {meta.error}
                </Label>
              )}
            </Flex>
          )}
        </Field>
      </Condition>
    </div>
  );
};

export default CreateFormMigration;
