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
import { Input, Label, Textarea } from '@rebass/forms';
import React, { useState } from 'react';
import { Field, Form } from 'react-final-form';
import { Redirect } from 'react-router-dom';
import { Flex } from 'rebass';
import { StyledFormButton, StyledFormDisabledButton } from '../components/UI/button';
import { COMPONENT_METADATA, PROFILE_VIEW_NAMES, ROUTE_PATHS } from '../constants';
import getValidator from '../utils/getValidator';
import { promptErrToastWithText, promptSuccessToastWithText } from '../utils/promptToastHelper';
import { transformForm } from '../utils/transformDataHelper';
import useRegistryApi from '../utils/useRegistryApi';
import SubFormTitle from './UI/subFormTitle';

interface IProfileEditableProjectProps {
    profileDetails: any;
    ministry: Array<MinistryItem>;
    isProvisioned?: boolean;
    pendingEditRequest: boolean;
    setPendingEditRequest: any;
    openBackdropCB: () => void;
    closeBackdropCB: () => void;
}

interface MinistryItem {
    name: string;
    code: string;
}

const ProfileEditableProject: React.FC<IProfileEditableProjectProps> = (props) => {
    const api = useRegistryApi();
    const validator = getValidator();
    const { profileDetails, ministry, isProvisioned, pendingEditRequest, setPendingEditRequest, openBackdropCB, closeBackdropCB } = props;

    const [goBackToProfileEditable, setGoBackToProfileEditable] = useState<boolean>(false);

    const onSubmit = async (formData: any) => {
      const { profile } = transformForm(formData);
      openBackdropCB();
      try {
        // 1. Check if the project profile description has changed.
        if (profileDetails.description !== profile.description) {
            await api.requestProfileEdit(profileDetails.id, profile);
        } else {
            await api.updateProfile(profileDetails.id, profile);
        }

        closeBackdropCB();
        setGoBackToProfileEditable(true);
        setPendingEditRequest(true);

        // 2. All good? Tell the user.
        promptSuccessToastWithText('Your profile update was successful');
      } catch (err) {
          closeBackdropCB();
          promptErrToastWithText('Something went wrong');
          console.log(err);
      }
  };
    if (goBackToProfileEditable && profileDetails.id) {
        return (<Redirect to={
            ROUTE_PATHS.PROFILE_EDITABLE.replace(':profileId', profileDetails.id).replace(':viewName', PROFILE_VIEW_NAMES.OVERVIEW)
        } />);
    }

    return (
        <>
        <Form
            onSubmit={onSubmit}
            validate={values => {
                const errors = {};
                return errors;
            }}
        >
          {props => (
              <form onSubmit={props.handleSubmit} >
            <SubFormTitle>Tell us about your project</SubFormTitle>
            <Field name="project-name" validate={validator.mustBeValidProfileName} defaultValue={''} initialValue={profileDetails.name} >
                {({ input, meta }) => (
                    <Flex flexDirection="column" pb="25px" style={{ position: "relative" }}>
                        <Label m="0" htmlFor="project-name">Name</Label>
                        <Input mt="8px" {...input} id="project-name" placeholder="Project X" disabled />
                        {meta.error && meta.touched && <Label as="span" style={{ position: "absolute", bottom: "0" }} variant="errorLabel">{meta.error}</Label>}
                    </Flex>
                )}
            </Field>
            <Field name="project-description" validate={validator.mustBeValidProfileDescription} defaultValue={''} initialValue={profileDetails.description} >
                {({ input, meta }) => (
                    <Flex flexDirection="column" pb="25px" style={{ position: "relative" }}>
                        <Label m="0" htmlFor="project-description">Description</Label>
                        <Textarea mt="8px" {...input} id="project-description" placeholder="A cutting edge web platform that enables Citizens to ..." rows={5} />
                        {meta.error && meta.touched && <Label as="span" style={{ position: "absolute", bottom: "0" }} variant="errorLabel">{meta.error}</Label>}
                    </Flex>
                )}
            </Field>
            <Flex pb="20px">
                <Label m="0" variant="adjacentLabel">Is this a Priority Application?</Label>
                <Flex flex="1 1 auto" justifyContent="flex-end">
                    <Label m="0" width="initial" px="8px">
                        <Field
                            name="project-prioritySystem"
                            component="input"
                            type="checkbox"
                            defaultValue={''}
                            initialValue={profileDetails.prioritySystem}
                        >
                            {({ input }) => (
                                <input
                                    style={{ width: '35px', height: '35px' }}
                                    name={input.name}
                                    type="checkbox"
                                    value="yes"
                                    checked={input.checked}
                                    onChange={input.onChange}
                                />
                            )}
                        </Field>
                    </Label>
                </Flex>
            </Flex>
            <Flex pb="20px">
                <Label variant="adjacentLabel">Ministry Sponsor</Label>
                <Flex flex="1 1 auto" justifyContent="flex-end" name="project-busOrgId">
                    {/* using a className prop as react final form Field does
                    not seem to expose any API to modify CSS */}
                    <Field
                        name="project-busOrgId"
                        component="select"
                        className="misc-class-m-dropdown-select"
                        defaultValue={profileDetails.busOrgId}
                    >
                        {/* {({ input, meta }) => ( */}
                        <option 
                          key={profileDetails.busOrgId} 
                          value={profileDetails.busOrgId}
                        >
                          {profileDetails.ministryName}
                        </option>
                        {(ministry.length > 0) && ministry.map((s: any) => (
                            <option
                                key={s.id}
                                value={s.id}
                            >
                                {s.name}
                            </option>
                        ))}
                        {/* )} */}
                    </Field>
                </Flex>
            </Flex>
            <Label variant="adjacentLabel">Please indicate what services you expect to utilize as part of your project?</Label>
            {COMPONENT_METADATA.map(item => (
                <Flex key={item.inputValue}>
                    <Label variant="adjacentLabel">{item.displayName}</Label>
                    <Flex flex="1 1 auto" justifyContent="flex-end">
                        <Label width="initial" px="8px">
                            <Field
                                name={`project-${item.inputValue}`}
                                component="input"
                                type="checkbox"
                                defaultValue={''}
                                initialValue={profileDetails[item.inputValue]}
                            >
                                {({ input }) => (
                                    <input
                                        style={{ width: "35px", height: "35px" }}
                                        name={input.name}
                                        type="checkbox"
                                        value="yes"
                                        checked={input.checked}
                                        onChange={input.onChange}
                                    />
                                )}
                            </Field>
                        </Label>
                    </Flex>
                </Flex>
            ))}
            <Field name="project-other" validate={validator.mustBeValidComponentOthers} defaultValue={''} initialValue={profileDetails.other}>
                {({ input, meta }) => (
                    <Flex pb="25px" style={{ position: "relative" }}>
                        <Label htmlFor="project-other">Other:</Label>
                        <Flex flex="1 1 auto" justifyContent="flex-end">
                            <Input {...input} id="project-other" />
                        </Flex>
                        {meta.error && meta.touched && <Label as="span" style={{ position: "absolute", bottom: "0" }} variant="errorLabel" >{meta.error}</Label>}
                    </Flex>
                )}
            </Field>
            {!pendingEditRequest && isProvisioned ? (
                //@ts-ignore
                <StyledFormButton style={{ display: 'block' }} >Request Update</StyledFormButton>
                ) : (
                    <>
                        {/* @ts-ignore */}
                        <StyledFormDisabledButton style={{ display: 'block' }}>Request Update</StyledFormDisabledButton>
                        <Label as="span" variant="errorLabel" >Not available due to a {isProvisioned ? 'Update' : 'Provision'} Request</Label>
                    </>
                )
            }
            </form>
          )}
          </Form>
        </>
    );
};

export default ProfileEditableProject;
