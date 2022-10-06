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
import React, { useEffect, useState } from 'react';
import { Field } from 'react-final-form';
import { Flex } from 'rebass';
import { ROLES } from '../../constants';
import Aux from '../../hoc/auxillary';
import getDecodedToken from '../../utils/getDecodedToken';
import getValidator from '../../utils/getValidator';
import FormSubtitle from '../common/UI/FormSubtitle';
import FormTitle from '../common/UI/FormTitle';
import GithubUserValidation from '../common/UI/GithubUserValidation/GithubUserValidation';
import TextInput from '../common/UI/TextInput';
import useRegistryApi from '../../hooks/useRegistryApi';
import { useMsal } from '@azure/msal-react';

const CreateFormPO: React.FC = () => {
  const [graphToken, setToken ] = useState<any>(""); // for app based permissions, not user delegate 
  const validator = getValidator();
  const { keycloak } = useKeycloak();
  const decodedToken = getDecodedToken(`${keycloak?.token}`);
  const api = useRegistryApi();
  const { instance, accounts } = useMsal();
 
  useEffect(() => {
    async function fetchAzureToken() {
      const request = {
        scopes: ["User.ReadBasic.All"],
        account: accounts[0],
      }
      instance.acquireTokenSilent(request).then((response) => {
        console.log(response.accessToken);
        setToken(response.accessToken);
      }).catch((e) => {
          instance.acquireTokenPopup(request).then((response) => {
            setToken(response.accessToken);
        });
      });
    };
    fetchAzureToken();
  }, []);

  return (
    <Aux>
      <FormTitle>Who is the product owner for this product?</FormTitle>
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
        <GithubUserValidation
          name="productOwner.githubId"
          defaultValue=""
          initialValue=""
          persona="productOwner"
          position={0}
          instance={instance}
          accounts={accounts}
          graphToken={graphToken}
        />
      </Flex>
    </Aux>
  );
};

export default CreateFormPO;
