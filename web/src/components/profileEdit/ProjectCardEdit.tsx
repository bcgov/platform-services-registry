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
import useCommonState from '../../hooks/useCommonState';
import useRegistryApi from '../../hooks/useRegistryApi';
import getValidator from '../../utils/getValidator';
import { promptErrToastWithText, promptSuccessToastWithText } from '../../utils/promptToastHelper';
import { transformForm } from '../../utils/transformDataHelper';
import { StyledFormButton, StyledFormDisabledButton } from '../common/UI/Button';
import FormTitle from '../common/UI/FormTitle';
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

            // 2. Request the profile project edit.
            if (projectDetails.description !== profile.description) {
                await api.requestProfileEdit(projectDetails.id, profile);
            } else {
                await api.updateProfile(projectDetails.id, profile);
            }

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
        return (<Redirect to={
            ROUTE_PATHS.PROFILE_EDIT.replace(':profileId', projectDetails.id).replace(':viewName', PROFILE_EDIT_VIEW_NAMES.OVERVIEW)
        } />);
    }

    return (
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
                    <Field name="project-name" validate={validator.mustBeValidProfileName} defaultValue={''} initialValue={projectDetails.name} >
                        {({ input, meta }) => (
                            <Flex flexDirection="column" pb="25px" style={{ position: "relative" }}>
                                <Label m="0" htmlFor="project-name">Name</Label>
                                <Input mt="8px" {...input} id="project-name" placeholder="Project X" disabled />
                                {meta.error && meta.touched && <Label as="span" style={{ position: "absolute", bottom: "0" }} variant="errorLabel">{meta.error}</Label>}
                            </Flex>
                        )}
                    </Field>
                    <Field name="project-description" validate={validator.mustBeValidProfileDescription} defaultValue={''} initialValue={projectDetails.description} >
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
                                    initialValue={projectDetails.prioritySystem}
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
                                defaultValue={projectDetails.busOrgId}
                            >
                                {/* {({ input, meta }) => ( */}
                                <option
                                    key={projectDetails.busOrgId}
                                    value={projectDetails.busOrgId}
                                >
                                    {projectDetails.ministryName}
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
                                        // @ts-ignore
                                        initialValue={projectDetails[item.inputValue]}
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
                    <Field name="project-other" validate={validator.mustBeValidComponentOthers} defaultValue={''} initialValue={projectDetails.other}>
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
                    {!hasPendingEdit && isProvisioned ? (
                        //@ts-ignore
                        <StyledFormButton style={{ display: 'block' }} >Request Update</StyledFormButton>
                    ) : (
                            <>
                                {/* @ts-ignore */}
                                <StyledFormDisabledButton style={{ display: 'block' }}>Request Update</StyledFormDisabledButton>
                                <Label as="span" variant="errorLabel" >Not available due to a {isProvisioned ? 'Update' : 'Provision'} Request </Label>
                            </>
                        )
                    }
                </form>
            )}
        </Form>
    );
};

export default ProjectCardEdit;
