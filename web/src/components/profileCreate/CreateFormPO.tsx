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

import { AccountInfo, IPublicClientApplication } from '@azure/msal-browser';
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
import { connect } from "react-redux";
import { selectProductOwner } from '../../redux/githubID/githubID.selector';
import { GithubIdBaseInterface } from '../../redux/githubID/githubID.reducer';
import githubIDSearchKeyword from '../../redux/githubID/githubID.action';

interface ContactInterface{
  instance: IPublicClientApplication;
  accounts: AccountInfo[];
  graphToken: string;
  productOwner: GithubIdBaseInterface;
}
const CreateFormPO: React.FC<ContactInterface> = (props) => {
  const {
    instance,
    accounts,
    graphToken,
    productOwner,
  } = props;
  const validator = getValidator();
  const { keycloak } = useKeycloak();
  const decodedToken = getDecodedToken(`${keycloak?.token}`);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    mapDispatchToProps({productOwner});
    setFirstName(productOwner.githubUser? productOwner.githubUser.value[0].givenName : '');
    setLastName(productOwner.githubUser? productOwner.githubUser.value[0].surname : '');
    setEmail(productOwner.githubUser? productOwner.githubUser.value[0].mail : '');
  }, [productOwner]);

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
        <Label htmlFor="productOwner.githubId">Search contact by their IDIR email address</Label>
        <GithubUserValidation
          name="productOwner.githubId"
          defaultValue=""
          initialValue={decodedToken.email}
          persona="productOwner"
          position={0}
          instance={instance}
          accounts={accounts}
          graphToken={graphToken}
        />
      </Flex>
      <Flex flexDirection="column">
        <Label htmlFor="productOwner.firstName">First Name</Label>
        <Field<string> 
        name="productOwner.firstName"
        defaultValue=""
        initialValue={`${firstName}`}
        >
          {({ input }) => <input type="text" value={`${firstName}`} readOnly={true}/>}
        </Field>
      </Flex>
      <Flex flexDirection="column">
        <Label htmlFor="productOwner.lastName">Last Name</Label>
        <Field<string>
          name="productOwner.lastName"
          defaultValue=""
          initialValue={lastName}
          >
            {({ input }) => <input type="text" value={`${lastName}`} readOnly={true}/>}
        </Field>
      </Flex>
      <Flex flexDirection="column">
        <Label htmlFor="productOwner.email">IDIR Email Address</Label>
        <Field<string>
          name="productOwner.email"
          defaultValue=""
          value={email}
          sx={{ textTransform: 'none' }}
        >
         {({ input }) => <input type="text" value={`${email}`} onChange={() => {}}/>}
        </Field>
      </Flex>
    </Aux>
  );
};

const mapStateToProps = (state: any) => ({
//   selectedTechnicalLeads: selectTechnicalLead(githubID.position)(state),
  productOwner: selectProductOwner()(state),
});
const mapDispatchToProps = (dispatch: any) => ({
  dispatchSearchGithubIDInput: (payload: {
    persona: string;
    inputValue: string;
    position: number;
  }) => dispatch(githubIDSearchKeyword(payload)),
});
export default connect(mapStateToProps, mapDispatchToProps)(CreateFormPO);
