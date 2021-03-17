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
import React, { useState } from 'react';
import { Field, Form } from 'react-final-form';
import { Redirect } from 'react-router-dom';
import { Flex } from 'rebass';
import { COMPONENT_METADATA, PROFILE_EDIT_VIEW_NAMES, ROUTE_PATHS } from '../../constants';
import useCommonState from '../../hooks/useCommonState';
import useRegistryApi from '../../hooks/useRegistryApi';
import getValidator from '../../utils/getValidator';
import { promptErrToastWithText, promptSuccessToastWithText } from '../../utils/promptToastHelper';
import { transformForm } from '../../utils/transformDataHelper';
import { StyledFormButton, StyledFormDisabledButton } from '../common/UI/Button';
import CheckboxInput from '../common/UI/CheckboxInput';
import { Condition } from '../common/UI/FormControls';
import FormTitle from '../common/UI/FormTitle';
import SelectInput from '../common/UI/SelectInput';
import TextAreaInput from '../common/UI/TextAreaInput';
import TextInput from '../common/UI/TextInput';
import { ProjectDetails } from './ProjectCard';

const validator = getValidator();

interface IProjectCardEditProps {
  projectDetails: ProjectDetails;
  ministry: Array<MinistryItem>;
  handleSubmitRefresh: any;
  isProvisioned?: boolean;
  hasPendingEdit?: boolean;
}

interface MinistryItem {
  name: string;
  code: string;
}

const ProjectCardEdit: React.FC<IProjectCardEditProps> = (props) => {
  const { projectDetails, ministry, handleSubmitRefresh, isProvisioned, hasPendingEdit } = props;

  const api = useRegistryApi();
  const { setOpenBackdrop } = useCommonState();

  const [goBackToProfileEdit, setGoBackToProfileEditable] = useState<boolean>(false);

  const onSubmit = async (formData: any) => {
    if (!projectDetails.id) {
      throw new Error('Unable to get profile id');
    }

    setOpenBackdrop(true);
    try {
      // 1. Prepare project edit request body.
      const { profile } = transformForm(formData);

      // 2. Update the profile project.
      await api.updateProfile(projectDetails.id, profile);

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

  if (goBackToProfileEdit && projectDetails.id) {
    return (
      <Redirect
        to={ROUTE_PATHS.PROFILE_EDIT.replace(':profileId', projectDetails.id).replace(
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
          <FormTitle>Tell us about your project</FormTitle>
          <Flex flexDirection="column">
            <Label htmlFor="project-name">Name</Label>
            <Field<string>
              name="project-name"
              component={TextInput}
              placeholder="Project X"
              validate={validator.mustBeValidProfileName}
              defaultValue=""
              initialValue={projectDetails.name}
              disabled
            />
          </Flex>
          <Flex flexDirection="column">
            <Label htmlFor="project-description">Description</Label>
            <Field
              name="project-description"
              component={TextAreaInput}
              placeholder="A cutting edge web platform that enables Citizens to ..."
              validate={validator.mustBeValidProfileDescription}
              rows="5"
              defaultValue=""
              initialValue={projectDetails.description}
            />
          </Flex>
          <Flex mt={3}>
            <Label variant="adjacentLabel" m="auto">
              Is this a Priority Application?
            </Label>
            <Flex flex="1 1 auto" justifyContent="flex-end">
              <Field<boolean>
                name="project-prioritySystem"
                component={CheckboxInput}
                defaultValue={false}
                initialValue={!!projectDetails.prioritySystem}
                type="checkbox"
              />
            </Flex>
          </Flex>
          <Flex mt={3}>
            <Label variant="adjacentLabel" m="auto">
              Ministry Sponsor
            </Label>
            <Flex flex="1 1 auto" justifyContent="flex-end" name="project-busOrgId">
              <Field
                name="project-busOrgId"
                component={SelectInput}
                defaultValue={projectDetails.busOrgId}
              >
                <option key={projectDetails.busOrgId} value={projectDetails.busOrgId}>
                  {projectDetails.ministryName}
                </option>
                {ministry.length > 0 &&
                  ministry.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </Field>
            </Flex>
          </Flex>
          <Flex mt={3}>
            <Label variant="adjacentLabel" m="auto">
              Is this app migrating from OCP 3.11?
            </Label>
            <Flex flex="1 1 auto" justifyContent="flex-end">
              <Field<boolean>
                name="project-migratingApplication"
                component={CheckboxInput}
                initialValue={!!projectDetails.migratingLicenseplate}
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
                  initialValue={projectDetails.migratingLicenseplate}
                />
              </Flex>
            </Flex>
          </Condition>
          <Label variant="adjacentLabel">
            Please indicate what services you expect to utilize as part of your project?
          </Label>
          {COMPONENT_METADATA.map((item) => (
            <Flex mt={3} key={item.inputValue}>
              <Label variant="adjacentLabel" m="auto">
                {item.displayName}
              </Label>
              <Flex flex="1 1 auto" justifyContent="flex-end">
                <Field<boolean>
                  name={`project-${item.inputValue}`}
                  component={CheckboxInput}
                  // @ts-ignore
                  initialValue={projectDetails[item.inputValue]}
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
                defaultValue=""
                initialValue={projectDetails.other}
              />
            </Flex>
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
                Not available due to a {isProvisioned ? 'Update' : 'Provision'} Request{' '}
              </Label>
            </>
          )}
        </form>
      )}
    </Form>
  );
};

export default ProjectCardEdit;
