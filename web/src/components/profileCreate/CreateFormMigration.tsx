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
import CheckboxInput from '../common/UI/CheckboxInput';
import { Condition } from '../common/UI/FormControls';
import FormSubtitle from '../common/UI/FormSubtitle';
import FormTitle from '../common/UI/FormTitle';
import TextInput from '../common/UI/TextInput';

const CreateFormMigration: React.FC = () => {
  const validator = getValidator();

  return (
    <Aux>
      <FormTitle>Tell us about your project</FormTitle>
      <FormSubtitle>
        As the capacity in the Silver cluster remains to be an issue due to the slow progress of the
        app migration, the priority will be given to provisioning namespaces for the projects that:
        <blockquote>
          <br /> a) migrate from OCP3 and
          <br /> b) have short 2-3 week migration timelines starting from when the namespaces are
          provisioned.
        </blockquote>
        Please indicate if your project meets the two criteria above and include the license plate
        number for the OCP3 project set.
      </FormSubtitle>
      <Flex mt={3}>
        <Label variant="adjacentLabel" m="auto">
          Is this app migrating from OCP 3.11?
        </Label>
        <Flex flex="1 1 auto" justifyContent="flex-end">
          <Field<boolean>
            name="project-migratingApplication"
            component={CheckboxInput}
            type="checkbox"
          />
        </Flex>
      </Flex>
      <Condition when="project-migratingApplication" is={true}>
        <Flex mt={3}>
          <Label variant="adjacentLabel" m="auto" htmlFor="project-migratingLicenseplate">
            OCP 3.11 license plate:
          </Label>
          <Flex flex="1 1 auto" justifyContent="flex-end" name="project-migratingLicenseplate">
            <Field<string>
              name="project-migratingLicenseplate"
              component={TextInput}
              validate={validator.mustBeValidProfileLicenseplate}
              sx={{ textTransform: 'none' }}
            />
          </Flex>
        </Flex>
      </Condition>
    </Aux>
  );
};

export default CreateFormMigration;
