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
import { StyledFormButton, StyledFormDisabledButton } from '../components/UI/button';
import { PROFILE_VIEW_NAMES, ROUTE_PATHS } from '../constants';
import getValidator from '../utils/getValidator';
import { promptErrToastWithText, promptSuccessToastWithText } from '../utils/promptToastHelper';
import { transformForm } from '../utils/transformDataHelper';
import useRegistryApi from '../utils/useRegistryApi';
import SubFormTitle from './UI/subFormTitle';

interface IProfileEditableContactProps {
    profileId?: string;
    isProvisioned?: boolean;
    contactDetails: any;
    pendingEditRequest: boolean;
    setPendingEditRequest: any;
    openBackdropCB: () => void;
    closeBackdropCB: () => void;
}

const ProfileEditableContact: React.FC<IProfileEditableContactProps> = (props) => {
    const { profileId, isProvisioned, contactDetails, pendingEditRequest, setPendingEditRequest, openBackdropCB, closeBackdropCB } = props;

    const api = useRegistryApi();
    
    const validator = getValidator();

    const [goBackToProfileEditable, setGoBackToProfileEditable] = useState<boolean>(false);
    
    const onSubmit = async (formData: any) => {
        const { productOwner, technicalContact } = transformForm(formData);
        const updatedContacts = { productOwner, technicalContact };
        openBackdropCB();
        
        try {
            if (!profileId) {
                throw new Error(`'Unable to get profile id'`);
            }
            
            // 1. Request the project contact edit.
            await api.requestContactEdit(profileId, updatedContacts);

            // 2. All good? Redirect back to overview and tell the user.
            closeBackdropCB();
            setGoBackToProfileEditable(true);
            setPendingEditRequest(true);
            promptSuccessToastWithText('Your profile update was successful');
        } catch (err) {
            closeBackdropCB();
            promptErrToastWithText('Something went wrong');
            console.log(err);
        }
    };
    if (goBackToProfileEditable && profileId) {
        return (<Redirect to={
            ROUTE_PATHS.PROFILE_EDITABLE.replace(':profileId', profileId).replace(':viewName', PROFILE_VIEW_NAMES.OVERVIEW)
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
                    <SubFormTitle>Who is the product owner for this project?</SubFormTitle>
                    <Field name="po-id" initialValue={contactDetails.POId} >
                        {({ input }) => (
                            <input type="hidden" {...input} id="po-Id" />
                        )}
                    </Field>
                    <Field name="po-firstName" validate={validator.mustBeValidName} initialValue={contactDetails.POFirstName}>
                        {({ input, meta }) => (
                            <Flex flexDirection="column" pb="25px" style={{ position: "relative" }}>
                                <Label m="0" htmlFor="po-first-name">First Name</Label>
                                <Input mt="8px" {...input} id="po-first-name" />
                                {meta.error && meta.touched && <Label as="span" style={{ position: "absolute", bottom: "0" }} variant="errorLabel">{meta.error}</Label>}
                            </Flex>
                        )}
                    </Field>
                    <Field name="po-lastName" validate={validator.mustBeValidName} initialValue={contactDetails.POLastName} >
                        {({ input, meta }) => (
                            <Flex flexDirection="column" pb="25px" style={{ position: "relative" }}>
                                <Label m="0" htmlFor="po-last-name">Last Name</Label>
                                <Input mt="8px" {...input} id="po-last-name" />
                                {meta.error && meta.touched && <Label as="span" style={{ position: "absolute", bottom: "0" }} variant="errorLabel">{meta.error}</Label>}
                            </Flex>
                        )}
                    </Field>
                    <Field name="po-email" validate={validator.mustBeValidEmail} initialValue={contactDetails.POEmail} >
                        {({ input, meta }) => (
                            <Flex flexDirection="column" pb="25px" style={{ position: "relative" }}>
                                <Label m="0" htmlFor="po-email">eMail Address</Label>
                                <Input mt="8px" {...input} id="po-email" />
                                {meta.error && meta.touched && <Label as="span" style={{ position: "absolute", bottom: "0" }} variant="errorLabel">{meta.error}</Label>}
                            </Flex>
                        )}
                    </Field>
                    <Field name="po-githubId" validate={validator.mustBeValidGithubName} initialValue={contactDetails.POGithubId} >
                        {({ input, meta }) => (
                            <Flex flexDirection="column" pb="25px" style={{ position: "relative" }}>
                                <Label m="0" htmlFor="po-github-id">GitHub ID</Label>
                                <Input mt="8px" {...input} id="po-github-id" />
                                {meta.error && meta.touched && <Label as="span" style={{ position: "absolute", bottom: "0" }} variant="errorLabel">{meta.error}</Label>}
                            </Flex>
                        )}
                    </Field>

                    <SubFormTitle>Who is the technical contact for this project?</SubFormTitle>
                    <Field name="tc-id" initialValue={contactDetails.TCId} >
                        {({ input }) => (
                            <Input type="hidden" {...input} id="tc-Id" />
                        )}
                    </Field>
                    <Field name="tc-firstName" validate={validator.mustBeValidName} initialValue={contactDetails.TCFirstName} >
                        {({ input, meta }) => (
                            <Flex flexDirection="column" pb="25px" style={{ position: "relative" }}>
                                <Label m="0" htmlFor="tc-first-name">First Name</Label>
                                <Input mt="8px" {...input} id="tc-first-name" />
                                {meta.error && meta.touched && <Label as="span" style={{ position: "absolute", bottom: "0" }} variant="errorLabel">{meta.error}</Label>}
                            </Flex>
                        )}
                    </Field>
                    <Field name="tc-lastName" validate={validator.mustBeValidName} initialValue={contactDetails.TCLastName} >
                        {({ input, meta }) => (
                            <Flex flexDirection="column" pb="25px" style={{ position: "relative" }}>
                                <Label m="0" htmlFor="tc-last-name">Last Name</Label>
                                <Input mt="8px" {...input} id="tc-last-name" />
                                {meta.error && meta.touched && <Label as="span" style={{ position: "absolute", bottom: "0" }} variant="errorLabel">{meta.error}</Label>}
                            </Flex>
                        )}
                    </Field>
                    <Field name="tc-email" validate={validator.mustBeValidEmail} initialValue={contactDetails.TCEmail} >
                        {({ input, meta }) => (
                            <Flex flexDirection="column" pb="25px" style={{ position: "relative" }}>
                                <Label m="0" htmlFor="tc-email">eMail Address</Label>
                                <Input mt="8px" {...input} id="tc-email" />
                                {meta.error && meta.touched && <Label as="span" style={{ position: "absolute", bottom: "0" }} variant="errorLabel">{meta.error}</Label>}
                            </Flex>
                        )}
                    </Field>
                    <Field name="tc-githubId" validate={validator.mustBeValidGithubName} initialValue={contactDetails.TCGithubId} >
                        {({ input, meta }) => (
                            <Flex flexDirection="column" pb="25px" style={{ position: "relative" }}>
                                <Label m="0" htmlFor="tc-github-id">GitHub ID</Label>
                                <Input mt="8px" {...input} id="tc-github-id" />
                                {meta.error && meta.touched && <Label as="span" style={{ position: "absolute", bottom: "0" }} variant="errorLabel">{meta.error}</Label>}
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
                    )}
                </form>
            )}
          </Form>
        </>
    );
};

export default ProfileEditableContact;
