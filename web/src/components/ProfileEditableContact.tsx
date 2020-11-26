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
import React from 'react';
import { Field } from 'react-final-form';
import { Flex } from 'rebass';
import getValidator from '../utils/getValidator';
import SubFormTitle from './UI/subFormTitle';

interface IProfileEditableContactProps {
    contactDetails: any;
}

const ProfileEditableContact: React.FC<IProfileEditableContactProps> = (props) => {
    const validator = getValidator();

    const { contactDetails } = props;
    
    return (
        <>
            <SubFormTitle>Who is the product owner for this project?</SubFormTitle>

            <Field name="po-firstName" validate={validator.mustBeValidName} defaultValue={''} initialValue={contactDetails.POFirstName} >
                {({ input, meta }) => (
                    <Flex flexDirection="column" pb="25px" style={{ position: "relative" }}>
                        <Label m="0" htmlFor="po-first-name">First Name</Label>
                        <Input mt="8px" {...input} id="po-first-name" />
                        {meta.error && meta.touched && <Label as="span" style={{ position: "absolute", bottom: "0" }} variant="errorLabel">{meta.error}</Label>}
                    </Flex>
                )}
            </Field>
            <Field name="po-lastName" validate={validator.mustBeValidName} defaultValue={''} initialValue={contactDetails.POLastName} >
                {({ input, meta }) => (
                    <Flex flexDirection="column" pb="25px" style={{ position: "relative" }}>
                        <Label m="0" htmlFor="po-last-name">Last Name</Label>
                        <Input mt="8px" {...input} id="po-last-name" />
                        {meta.error && meta.touched && <Label as="span" style={{ position: "absolute", bottom: "0" }} variant="errorLabel">{meta.error}</Label>}
                    </Flex>
                )}
            </Field>
            <Field name="po-email" validate={validator.mustBeValidEmail} defaultValue={''} initialValue={contactDetails.POEmail} >
                {({ input, meta }) => (
                    <Flex flexDirection="column" pb="25px" style={{ position: "relative" }}>
                        <Label m="0" htmlFor="po-email">eMail Address</Label>
                        <Input mt="8px" {...input} id="po-email" />
                        {meta.error && meta.touched && <Label as="span" style={{ position: "absolute", bottom: "0" }} variant="errorLabel">{meta.error}</Label>}
                    </Flex>
                )}
            </Field>
            <Field name="po-githubId" validate={validator.mustBeValidGithubName} defaultValue={''} initialValue={contactDetails.POGithubId} >
                {({ input, meta }) => (
                    <Flex flexDirection="column" pb="25px" style={{ position: "relative" }}>
                        <Label m="0" htmlFor="po-github-id">GitHub ID</Label>
                        <Input mt="8px" {...input} id="po-github-id" />
                        {meta.error && meta.touched && <Label as="span" style={{ position: "absolute", bottom: "0" }} variant="errorLabel">{meta.error}</Label>}
                    </Flex>
                )}
            </Field>

            <SubFormTitle>Who is the technical contact for this project?</SubFormTitle>

            <Field name="tc-firstName" validate={validator.mustBeValidName} defaultValue={''} initialValue={contactDetails.TCFirstName} >
                {({ input, meta }) => (
                    <Flex flexDirection="column" pb="25px" style={{ position: "relative" }}>
                        <Label m="0" htmlFor="tc-first-name">First Name</Label>
                        <Input mt="8px" {...input} id="tc-first-name" />
                        {meta.error && meta.touched && <Label as="span" style={{ position: "absolute", bottom: "0" }} variant="errorLabel">{meta.error}</Label>}
                    </Flex>
                )}
            </Field>
            <Field name="tc-lastName" validate={validator.mustBeValidName} defaultValue={''} initialValue={contactDetails.TCLastName} >
                {({ input, meta }) => (
                    <Flex flexDirection="column" pb="25px" style={{ position: "relative" }}>
                        <Label m="0" htmlFor="tc-last-name">Last Name</Label>
                        <Input mt="8px" {...input} id="tc-last-name" />
                        {meta.error && meta.touched && <Label as="span" style={{ position: "absolute", bottom: "0" }} variant="errorLabel">{meta.error}</Label>}
                    </Flex>
                )}
            </Field>
            <Field name="tc-email" validate={validator.mustBeValidEmail} defaultValue={''} initialValue={contactDetails.TCEmail} >
                {({ input, meta }) => (
                    <Flex flexDirection="column" pb="25px" style={{ position: "relative" }}>
                        <Label m="0" htmlFor="tc-email">eMail Address</Label>
                        <Input mt="8px" {...input} id="tc-email" />
                        {meta.error && meta.touched && <Label as="span" style={{ position: "absolute", bottom: "0" }} variant="errorLabel">{meta.error}</Label>}
                    </Flex>
                )}
            </Field>
            <Field name="tc-githubId" validate={validator.mustBeValidGithubName} defaultValue={''} initialValue={contactDetails.TCGithubId} >
                {({ input, meta }) => (
                    <Flex flexDirection="column" pb="25px" style={{ position: "relative" }}>
                        <Label m="0" htmlFor="tc-github-id">GitHub ID</Label>
                        <Input mt="8px" {...input} id="tc-github-id" />
                        {meta.error && meta.touched && <Label as="span" style={{ position: "absolute", bottom: "0" }} variant="errorLabel">{meta.error}</Label>}
                    </Flex>
                )}
            </Field>
        </>
    );
};

export default ProfileEditableContact;
