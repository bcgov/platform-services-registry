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
import arrayMutators from 'final-form-arrays';
import React, { useState } from 'react';
import { Field, Form } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import { Redirect } from 'react-router-dom';
import { Box, Flex } from 'rebass';
import {
  MAXIMUM_TECHNICAL_LEADS,
  MINIMUM_TECHNICAL_LEADS,
  PROFILE_EDIT_VIEW_NAMES,
  ROLES,
  ROUTE_PATHS,
} from '../../constants';
import useCommonState from '../../hooks/useCommonState';
import useRegistryApi from '../../hooks/useRegistryApi';
import getValidator from '../../utils/getValidator';
import { promptErrToastWithText, promptSuccessToastWithText } from '../../utils/promptToastHelper';
import {
  Button,
  SquareFormButton,
  StyledFormButton,
  StyledFormDisabledButton,
} from '../common/UI/Button';
import FormTitle from '../common/UI/FormTitle';
import TextInput from '../common/UI/TextInput';
import { ContactDetails } from './ContactCard';

const validator = getValidator();

interface IContactCardEditProps {
  profileId?: string;
  contactDetails: ContactDetails[];
  handleSubmitRefresh: any;
  isProvisioned?: boolean;
  hasPendingEdit: boolean;
}

const ContactCardEdit: React.FC<IContactCardEditProps> = (props) => {
  const { profileId, contactDetails, handleSubmitRefresh, isProvisioned, hasPendingEdit } = props;

  const { setOpenBackdrop } = useCommonState();
  const api = useRegistryApi();

  const [goBackToProfileEditable, setGoBackToProfileEditable] = useState<boolean>(false);

  const productOwner = contactDetails
    .filter((contact) => contact.roleId === ROLES.PRODUCT_OWNER)
    .pop();

  if (!productOwner) {
    throw new Error('Unable to get product owner details');
  }

  const technicalLeads = contactDetails.filter(
    (contact) => contact.roleId === ROLES.TECHNICAL_LEAD,
  );

  const onSubmit = async (formData: any) => {
    setOpenBackdrop(true);
    try {
      if (!profileId) {
        throw new Error('Unable to get profile id');
      }

      // 1. Prepare contact edit request body.
      const { updatedProductOwner, updatedTechnicalLeads } = formData;
      const updatedContacts = [...updatedTechnicalLeads, updatedProductOwner];

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
      mutators={{
        ...arrayMutators,
      }}
      validate={(values) => {
        const errors = {};
        return errors;
      }}
    >
      {(formProps) => (
        <form onSubmit={formProps.handleSubmit}>
          <FormTitle>Who is the product owner for this project?</FormTitle>
          <Field name="productOwner.id" initialValue={productOwner.id}>
            {({ input }) => <input type="hidden" {...input} id="id" />}
          </Field>
          <Field name="productOwner.roleId" initialValue={productOwner.roleId}>
            {({ input }) => <input type="hidden" {...input} id="roleId" />}
          </Field>
          <Flex flexDirection="column">
            <Label htmlFor="productOwner.firstName">First Name</Label>
            <Field<string>
              name="productOwner.firstName"
              component={TextInput}
              validate={validator.mustBeValidName}
              defaultValue=""
              initialValue={productOwner.firstName}
            />
          </Flex>
          <Flex flexDirection="column">
            <Label htmlFor="productOwner.lastName">Last Name</Label>
            <Field<string>
              name="productOwner.lastName"
              component={TextInput}
              validate={validator.mustBeValidName}
              defaultValue=""
              initialValue={productOwner.lastName}
            />
          </Flex>
          <Flex flexDirection="column">
            <Label htmlFor="productOwner.email">Email Address</Label>
            <Field<string>
              name="productOwner.email"
              component={TextInput}
              validate={validator.mustBeValidEmail}
              defaultValue=""
              initialValue={productOwner.email}
              sx={{ textTransform: 'none' }}
            />
          </Flex>
          <Flex flexDirection="column">
            <Label htmlFor="productOwner.githubId">GitHub Id</Label>
            <Field<string>
              name="productOwner.githubId"
              component={TextInput}
              validate={validator.mustBeValidGithubName}
              defaultValue=""
              initialValue={productOwner.githubId}
              sx={{ textTransform: 'none' }}
            />
          </Flex>
          <FormTitle>Who is the technical contact for this project?</FormTitle>
          <FieldArray name="technicalLeads" initialValue={technicalLeads}>
            {({ fields }) => (
              <div>
                {fields.map((name, index) => (
                  <div key={name}>
                    <Flex flexDirection="row">
                      <FormTitle style={{ margin: '14px 0 5px 0' }}>Technical Lead</FormTitle>
                      {fields.length! > MINIMUM_TECHNICAL_LEADS && (
                        <Box my="auto" ml="auto" className="buttons">
                          <SquareFormButton
                            type="button"
                            onClick={() => fields.remove(index)}
                            style={{ cursor: 'pointer' }}
                            inversed
                          >
                            X
                          </SquareFormButton>
                        </Box>
                      )}
                    </Flex>
                    <Flex flexDirection="column">
                      <Label htmlFor={`${name}.firstName`}>First Name</Label>
                      <Field<string>
                        name={`${name}.firstName`}
                        component={TextInput}
                        validate={validator.mustBeValidName}
                        placeholder="Jane"
                      />
                    </Flex>
                    <Flex flexDirection="column">
                      <Label htmlFor={`${name}.lastName`}>Last Name</Label>
                      <Field<string>
                        name={`${name}.lastName`}
                        component={TextInput}
                        validate={validator.mustBeValidName}
                        placeholder="Doe"
                      />
                    </Flex>
                    <Flex flexDirection="column">
                      <Label htmlFor={`${name}.email`}>Email Address</Label>
                      <Field<string>
                        name={`${name}.email`}
                        component={TextInput}
                        validate={validator.mustBeValidEmail}
                        placeholder="jane.doe@example.com"
                        sx={{ textTransform: 'none' }}
                      />
                    </Flex>
                    <Flex flexDirection="column">
                      <Label htmlFor={`${name}.githubId`}>GitHub Id</Label>
                      <Field<string>
                        name={`${name}.githubId`}
                        component={TextInput}
                        validate={validator.mustBeValidGithubName}
                        placeholder="jane1100"
                        sx={{ textTransform: 'none' }}
                      />
                    </Flex>
                  </div>
                ))}
                {fields.length! < MAXIMUM_TECHNICAL_LEADS ? (
                  <Button
                    type="button"
                    onClick={() =>
                      fields.push({
                        firstName: '',
                        lastName: '',
                        email: '',
                        githubId: '',
                        roleId: ROLES.TECHNICAL_LEAD,
                      })
                    }
                  >
                    Add Technical Lead
                  </Button>
                ) : (
                  ''
                )}
              </div>
            )}
          </FieldArray>
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
