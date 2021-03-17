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
import React, { useState } from 'react';
import { Field, Form } from 'react-final-form';
import { Redirect } from 'react-router-dom';
import { Flex } from 'rebass';
import { PROFILE_EDIT_VIEW_NAMES, ROUTE_PATHS } from '../../constants';
import useCommonState from '../../hooks/useCommonState';
import useRegistryApi from '../../hooks/useRegistryApi';
import getValidator from '../../utils/getValidator';
import { promptErrToastWithText, promptSuccessToastWithText } from '../../utils/promptToastHelper';
import { transformForm } from '../../utils/transformDataHelper';
import { StyledFormButton, StyledFormDisabledButton } from '../common/UI/Button';
import FormTitle from '../common/UI/FormTitle';
import TextInput from '../common/UI/TextInput';
import { ContactDetails } from './ContactCard';

const validator = getValidator();

interface IContactCardEditProps {
  profileId?: string;
  contactDetails: ContactDetails;
  handleSubmitRefresh: any;
  isProvisioned?: boolean;
  hasPendingEdit: boolean;
}

const ContactCardEdit: React.FC<IContactCardEditProps> = (props) => {
  const { profileId, contactDetails, handleSubmitRefresh, isProvisioned, hasPendingEdit } = props;

  const { setOpenBackdrop } = useCommonState();
  const api = useRegistryApi();

  const [goBackToProfileEditable, setGoBackToProfileEditable] = useState<boolean>(false);

  const onSubmit = async (formData: any) => {
    setOpenBackdrop(true);
    try {
      if (!profileId) {
        throw new Error('Unable to get profile id');
      }

      // 1. Prepare contact edit request body.
      const { productOwner, technicalContact } = transformForm(formData);
      const updatedContacts = { productOwner, technicalContact };

      // 2. Request the profile contact edit.
      await api.updateContactsByProfileId(profileId, updatedContacts);

      // 3. All good? Redirect back to overview and tell the user.
      setGoBackToProfileEditable(true);
      handleSubmitRefresh();
      promptSuccessToastWithText('Your profile update was successful');
    } catch (err) {
      promptErrToastWithText(err.message);
      console.log(err);
    }
    setOpenBackdrop(false);
  };

  if (goBackToProfileEditable && profileId) {
    return (
      <Redirect
        to={ROUTE_PATHS.PROFILE_EDIT.replace(':profileId', profileId).replace(
          ':viewName',
          PROFILE_EDIT_VIEW_NAMES.OVERVIEW,
        )}
      />
    );
  }

  return (
    <Form
      onSubmit={onSubmit}
      validate={(values) => {
        const errors = {};
        return errors;
      }}
    >
      {(formProps) => (
        <form onSubmit={formProps.handleSubmit}>
          <FormTitle>Who is the product owner for this project?</FormTitle>
          <Field name="po-id" initialValue={contactDetails.POId}>
            {({ input }) => <input type="hidden" {...input} id="po-Id" />}
          </Field>
          <Flex flexDirection="column">
            <Label htmlFor="po-firstName">First Name</Label>
            <Field<string>
              name="po-firstName"
              component={TextInput}
              validate={validator.mustBeValidName}
              defaultValue=""
              initialValue={contactDetails.POFirstName}
            />
          </Flex>
          <Flex flexDirection="column">
            <Label htmlFor="po-lastName">Last Name</Label>
            <Field<string>
              name="po-lastName"
              component={TextInput}
              validate={validator.mustBeValidName}
              defaultValue=""
              initialValue={contactDetails.POLastName}
            />
          </Flex>
          <Flex flexDirection="column">
            <Label htmlFor="po-email">Email Address</Label>
            <Field<string>
              name="po-email"
              component={TextInput}
              validate={validator.mustBeValidEmail}
              defaultValue=""
              initialValue={contactDetails.POEmail}
            />
          </Flex>
          <Flex flexDirection="column">
            <Label htmlFor="po-githubId">GitHub Id</Label>
            <Field<string>
              name="po-githubId"
              component={TextInput}
              validate={validator.mustBeValidGithubName}
              defaultValue=""
              initialValue={contactDetails.POGithubId}
            />
          </Flex>
          <FormTitle>Who is the technical contact for this project?</FormTitle>
          <Field name="tc-id" initialValue={contactDetails.TCId}>
            {({ input }) => <Input type="hidden" {...input} id="tc-Id" />}
          </Field>
          <Flex flexDirection="column">
            <Label htmlFor="tc-firstName">First Name</Label>
            <Field<string>
              name="tc-firstName"
              component={TextInput}
              validate={validator.mustBeValidName}
              defaultValue=""
              initialValue={contactDetails.TCFirstName}
            />
          </Flex>
          <Flex flexDirection="column">
            <Label htmlFor="tc-lastName">Last Name</Label>
            <Field<string>
              name="tc-lastName"
              component={TextInput}
              validate={validator.mustBeValidName}
              defaultValue=""
              initialValue={contactDetails.TCLastName}
            />
          </Flex>
          <Flex flexDirection="column">
            <Label htmlFor="tc-email">Email Address</Label>
            <Field<string>
              name="tc-email"
              component={TextInput}
              validate={validator.mustBeValidEmail}
              defaultValue=""
              initialValue={contactDetails.TCEmail}
            />
          </Flex>
          <Flex flexDirection="column">
            <Label htmlFor="tc-githubId">GitHub Id</Label>
            <Field<string>
              name="tc-githubId"
              component={TextInput}
              validate={validator.mustBeValidGithubName}
              defaultValue=""
              initialValue={contactDetails.TCGithubId}
            />
          </Flex>
          {!hasPendingEdit && isProvisioned ? (
            // @ts-ignore
            <StyledFormButton style={{ display: 'block' }}>Request Update</StyledFormButton>
          ) : (
            <>
              {/* @ts-ignore */}
              <StyledFormDisabledButton style={{ display: 'block' }}>
                Request Update
              </StyledFormDisabledButton>
              <Label as="span" variant="errorLabel">
                Not available due to a {isProvisioned ? 'Update' : 'Provision'} Request
              </Label>
            </>
          )}
        </form>
      )}
    </Form>
  );
};

export default ContactCardEdit;
