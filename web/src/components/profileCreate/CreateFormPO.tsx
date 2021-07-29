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

import { useKeycloak } from '@react-keycloak/web';
import { Label } from '@rebass/forms';
import React from 'react';
import { Field } from 'react-final-form';
import { Flex } from 'rebass';
import { ROLES } from '../../constants';
import Aux from '../../hoc/auxillary';
import getDecodedToken from '../../utils/getDecodedToken';
import getValidator from '../../utils/getValidator';
import FormSubtitle from '../common/UI/FormSubtitle';
import FormTitle from '../common/UI/FormTitle';
import TextInput from '../common/UI/TextInput';

const CreateFormPO: React.FC = () => {
  const validator = getValidator();

  const { keycloak } = useKeycloak();

  const decodedToken = getDecodedToken(`${keycloak?.token}`);

  return (
    <Aux>
      <FormTitle>Who is the product owner for this project?</FormTitle>
      <FormSubtitle>
        Tell us about the Product Owner (PO). This is typically the business owner of the
        application; we will use this information to contact them with any non-technical questions.
      </FormSubtitle>
      <Field name="productOwner.roleId" initialValue={ROLES.PRODUCT_OWNER}>
        {({ input }) => <input type="hidden" {...input} id="roleId" />}
      </Field>
      <Flex flexDirection="column">
        <Label htmlFor="productOwner.firstName">First Name</Label>
        <Field<string>
          name="productOwner.firstName"
          component={TextInput}
          validate={validator.mustBeValidName}
          defaultValue=""
          initialValue={decodedToken.given_name}
        />
      </Flex>
      <Flex flexDirection="column">
        <Label htmlFor="productOwner.lastName">Last Name</Label>
        <Field<string>
          name="productOwner.lastName"
          component={TextInput}
          validate={validator.mustBeValidName}
          defaultValue=""
          initialValue={decodedToken.family_name}
        />
      </Flex>
      <Flex flexDirection="column">
        <Label htmlFor="productOwner.email">Email Address</Label>
        <Field<string>
          name="productOwner.email"
          component={TextInput}
          validate={validator.mustBeValidEmail}
          defaultValue=""
          initialValue={decodedToken.email}
          sx={{ textTransform: 'none' }}
        />
      </Flex>
      <Flex flexDirection="column">
        <Label htmlFor="productOwner.githubId">GitHub Id</Label>
        <Field<string>
          name="productOwner.githubId"
          component={TextInput}
          validate={validator.mustBeValidGithubName}
          placeholder="jane1100"
          sx={{ textTransform: 'none' }}
        />
      </Flex>
    </Aux>
  );
};

export default CreateFormPO;
