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
import { COMPONENT_METADATA, PROFILE_EDIT_VIEW_NAMES, ROUTE_PATHS } from '../../constants';
import useRegistryApi from '../../hooks/useRegistryApi';
import getValidator from '../../utils/getValidator';
import { promptErrToastWithText, promptSuccessToastWithText } from '../../utils/promptToastHelper';
import { transformForm } from '../../utils/transformDataHelper';
import { StyledFormButton } from '../common/UI/Button';
import FormTitle from '../common/UI/FormTitle';

interface IProjectCardEditProps {
    profileDetails: any;
    ministry: Array<MinistryItem>;
    openBackdropCB: () => void;
    closeBackdropCB: () => void;
}

interface MinistryItem {
    name: string;
    code: string;
}

const ProjectCardEdit: React.FC<IProjectCardEditProps> = (props) => {
    const api = useRegistryApi();
    const validator = getValidator();
    const { profileDetails, ministry, openBackdropCB, closeBackdropCB } = props;

    const [goBackToProfileEditable, setGoBackToProfileEditable] = useState<boolean>(false);

    const onSubmit = async (formData: any) => {
        const { profile } = transformForm(formData);
        openBackdropCB();
        try {
            // 1. Update the project profile.
            await api.updateProfile(profileDetails.id, profile);
            closeBackdropCB();
            setGoBackToProfileEditable(true);

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
            ROUTE_PATHS.PROFILE_EDIT.replace(':profileId', profileDetails.id).replace(':viewName', PROFILE_EDIT_VIEW_NAMES.OVERVIEW)
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
                        <FormTitle>Tell us about your project</FormTitle>
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
                                    <Textarea mt="8px" {...input} id="project-description" placeholder="A cutting edge web platform that enables Citizens to ..." rows={5} disabled />
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
                        {/* @ts-ignore */}
                        <StyledFormButton style={{ display: 'block' }}>Update Profile</StyledFormButton>
                    </form>
                )}
            </Form>
        </>
    );
};

export default ProjectCardEdit;
