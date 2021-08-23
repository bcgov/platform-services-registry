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
import { FORM_ERROR } from 'final-form';
import React, { useState } from 'react';
import { Field, Form } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import { Redirect } from 'react-router-dom';
import { Flex } from 'rebass';
import { createStructuredSelector } from 'reselect';
import { connect } from 'react-redux';
import { selectGithubIDAllState } from '../../redux/githubID/githubID.selector';
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
import { Button } from '../common/UI/Button';
import { EditSubmitButton } from '../common/UI/EditSubmitButton';
import FormTitle from '../common/UI/FormTitle';
import TextInput from '../common/UI/TextInput';
import { ContactDetails } from './ContactCard';
import GithubUserValidation from '../common/UI/GithubUserValidation/GithubUserValidation';

const validator = getValidator();

interface IContactCardEditProps {
  profileId?: string;
  contactDetails: ContactDetails[];
  handleSubmitRefresh: any;
  isProvisioned?: boolean;
  hasPendingEdit: boolean;
  GithubIDAllState: any;
}

const ContactCardEdit: React.FC<IContactCardEditProps> = (props) => {
  const {
    profileId,
    contactDetails,
    handleSubmitRefresh,
    isProvisioned,
    hasPendingEdit,
    GithubIDAllState,
  } = props;

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
    let onSubmitErrorMessage;
    Object.entries(GithubIDAllState).forEach(([key, value]) => {
      if (GithubIDAllState[key].everFetched === true && GithubIDAllState[key].notFound === true) {
        onSubmitErrorMessage = 'Github User Not Found';
      }
      if (GithubIDAllState[key].inputKeyword && GithubIDAllState[key].everFetched === false) {
        onSubmitErrorMessage = 'Loading Github User infomation';
      }
    });
    if (onSubmitErrorMessage) return { [FORM_ERROR]: onSubmitErrorMessage };

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
        const errors: any = {};

        return errors;
      }}
    >
      {(formProps) => (
        <form onSubmit={formProps.handleSubmit}>
          <FormTitle>Who is the product owner for this project?</FormTitle>
          <Field name="updatedProductOwner.id" initialValue={productOwner.id}>
            {({ input }) => <input type="hidden" {...input} id="id" />}
          </Field>
          <Field name="updatedProductOwner.roleId" initialValue={productOwner.roleId}>
            {({ input }) => <input type="hidden" {...input} id="roleId" />}
          </Field>
          <Flex flexDirection="column">
            <Label htmlFor="updatedProductOwner.firstName">First Name</Label>
            <Field<string>
              name="updatedProductOwner.firstName"
              component={TextInput}
              validate={validator.mustBeValidName}
              defaultValue=""
              initialValue={productOwner.firstName}
            />
          </Flex>
          <Flex flexDirection="column">
            <Label htmlFor="updatedProductOwner.lastName">Last Name</Label>
            <Field<string>
              name="updatedProductOwner.lastName"
              component={TextInput}
              validate={validator.mustBeValidName}
              defaultValue=""
              initialValue={productOwner.lastName}
            />
          </Flex>
          <Flex flexDirection="column">
            <Label htmlFor="updatedProductOwner.email">Email Address</Label>
            <Field<string>
              name="updatedProductOwner.email"
              component={TextInput}
              validate={validator.mustBeValidEmail}
              defaultValue=""
              initialValue={productOwner.email}
              sx={{ textTransform: 'none' }}
            />
          </Flex>
          <Flex flexDirection="column">
            <Label htmlFor="updatedProductOwner.githubId">GitHub Id</Label>
            <GithubUserValidation
              name="updatedProductOwner.githubId"
              defaultValue=""
              initialValue={productOwner.githubId}
            />
          </Flex>
          <FormTitle>
            {technicalLeads.length > MINIMUM_TECHNICAL_LEADS
              ? 'Who are the technical leads for this project?'
              : 'Who is the technical lead for this project?'}
          </FormTitle>
          <FieldArray name="updatedTechnicalLeads" initialValue={technicalLeads}>
            {({ fields }) => (
              <div>
                {fields.map((name, index) => (
                  <div key={name}>
                    <Flex flexDirection="row">
                      <FormTitle style={{ fontSize: '20px' }}>Technical Lead {index + 1}</FormTitle>
                      {/* TODO: (SB) implement the ability to delete contacts from edit page */}
                      {/* {fields.length! > MINIMUM_TECHNICAL_LEADS && (
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
                      )} */}
                    </Flex>
                    <Flex flexDirection="column">
                      <Field name={`${name}.id`} initialValue={`${name}.id` || ''}>
                        {({ input }) => <input type="hidden" {...input} id={`${name}.id`} />}
                      </Field>
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
                      <GithubUserValidation name={`${name}.githubId`} />
                    </Flex>
                  </div>
                ))}
                {fields.length! < MAXIMUM_TECHNICAL_LEADS ? (
                  <Button
                    type="button"
                    onClick={() =>
                      fields.push({
                        id: '',
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

          <EditSubmitButton
            submitError={formProps.submitError}
            hasPendingEdit={hasPendingEdit}
            isProvisioned={isProvisioned}
            pristine={formProps.pristine}
          />
        </form>
      )}
    </Form>
  );
};
const mapStateToProps = createStructuredSelector({
  GithubIDAllState: selectGithubIDAllState,
});

export default connect(mapStateToProps)(ContactCardEdit);
