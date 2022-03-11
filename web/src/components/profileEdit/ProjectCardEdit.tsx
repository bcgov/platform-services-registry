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
import CheckboxInput from '../common/UI/CheckboxInput';
import { EditSubmitButton } from '../common/UI/EditSubmitButton';
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
  isDisabled?: boolean;
}

interface MinistryItem {
  name: string;
  code: string;
}

const ProjectCardEdit: React.FC<IProjectCardEditProps> = (props) => {
  const {
    projectDetails,
    ministry,
    handleSubmitRefresh,
    isProvisioned,
    hasPendingEdit,
    isDisabled,
  } = props;

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
      const { profile } = formData;

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
      {({ handleSubmit, pristine }) => (
        <form onSubmit={handleSubmit}>
          <fieldset disabled={isDisabled} style={{ border: 0 }}>
            <FormTitle>Tell us about your project</FormTitle>
            <Flex flexDirection="column">
              <Label htmlFor="profile.name">Name</Label>
              <Field<string>
                name="profile.name"
                component={TextInput}
                placeholder="Project X"
                validate={validator.mustBeValidProfileName}
                defaultValue=""
                initialValue={projectDetails.name}
              />
            </Flex>
            <Flex flexDirection="column">
              <Label htmlFor="profile.description">Description</Label>
              <Field
                name="profile.description"
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
                  name="profile.prioritySystem"
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
              <Flex flex="1 1 auto" justifyContent="flex-end" name="profile.busOrgId">
                <Field
                  name="profile.busOrgId"
                  component={SelectInput}
                  initialValue={projectDetails.busOrgId}
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
          </Condition>
          <Label variant="adjacentLabel">
            Please indicate what services you expect to utilize as part of your project?
          </Label>
          {COMPONENT_METADATA.map((item) => (
            <Flex mt={3} key={item.inputValue}>
              <Label variant="adjacentLabel" m="auto">
                {item.displayName}
                {item.documentationSource  ? (
                <Flex flex="1 1 auto" justifyContent="flex-end" className="componentContextLink">
                  <a href={item.documentationSource} target="_blank" title="Open a new browser tab with info about this component">?</a>
                </Flex>
                ) :
                (
                  <Flex flex="1 1 auto" justifyContent="flex-end" className="componentContextLink-inactive" title="There is not yet any documentation linked for this component.">
                    <div>?</div>
                  </Flex>
                )}
            {projectDetails.primaryClusterName === 'gold' && (
              <Flex mt={3}>
                <Label variant="adjacentLabel" m="auto">
                  Is this Application Migrating from OCP4 Silver Service?
                </Label>
                <Flex flex="1 1 auto" justifyContent="flex-end">
                  <Field<boolean>
                    name="profile.migratingApplication"
                    component={CheckboxInput}
                    type="checkbox"
                    initialValue={!!projectDetails.migratingLicenseplate}
                    defaultValue={false}
                  />
                </Flex>
              </Flex>
            )}
            <Condition when="profile.migratingApplication" is={true}>
              <Flex mt={3}>
                <Label variant="adjacentLabel" m="auto" htmlFor="profile.migratingLicenseplate">
                  OCP 4 Silver license plate:
                </Label>
                <Flex
                  flex="1 1 auto"
                  justifyContent="flex-end"
                  name="profile.migratingLicenseplate"
                >
                  <Field<string>
                    name="profile.migratingLicenseplate"
                    component={TextInput}
                    validate={validator.mustBeValidProfileLicenseplate}
                    initialValue={projectDetails.migratingLicenseplate}
                    defaultValue={projectDetails.migratingLicenseplate}
                  />
                </Flex>
              </Flex>
            
              </Label>
              <Flex flex="1 1 auto" justifyContent="flex-end" name="profile.other">
                <Field<string>
                  name="profile.other"
                  component={TextInput}
                  validate={validator.mustBeValidComponentOthers}
                  defaultValue=""
                  initialValue={projectDetails.other}
                />
              </Flex>
            </Flex>
            <EditSubmitButton
              hasPendingEdit={hasPendingEdit}
              isProvisioned={isProvisioned}
              pristine={pristine}
            />
          </fieldset>
        </form>
      )}
    </Form>
  );
};

export default ProjectCardEdit;
