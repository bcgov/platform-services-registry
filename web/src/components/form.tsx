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
// Created by Jason Leach on 2020-06-09.
//

import styled from '@emotion/styled';
import { useKeycloak } from '@react-keycloak/web';
import { Input, Label, Select, Textarea } from '@rebass/forms';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Field, Form } from 'react-final-form';
import { Flex } from 'rebass';
import { API, DEFAULT_MINISTRY, ROLES } from '../constants';
import { ShadowBox } from './UI/shadowContainer';

const axi = axios.create({
    baseURL: API.BASE_URL(),
});

const StyledButton = styled.button`
    margin-top: 20px;
    width: 50%;
    height: 60px;
    border-radius: 5px;
    background-color: #036;
    color: #FFFFFF;
    font-size: 24px;
`;

// @ts-ignore
const StyledTitle = styled.h1`
    font-size: 24px;
    font-weight: bold;
    font-stretch: normal;
    font-style: normal;
    line-height: normal;
    letter-spacing: normal;
    color: #036;
`;

// color: ${props => props.theme.color.bcblue };

const requiredField = (value: string) => (value ? undefined : 'Required')

const transformFormData = (data: any) => {
    const profile: any = {};
    const productOwner: any = {
        roleId: ROLES.PRODUCTOWNER,
    };
    const technicalContact: any = {
        roleId: ROLES.TECHNICAL,
    };

    for (const [key, value] of Object.entries(data)) {
        const [prefix, fieldName] = key.split('-');

        if (prefix === 'project') {
            profile[fieldName] = value;
        }
        if (prefix === 'po') {
            productOwner[fieldName] = value;
        }
        if (prefix === 'tc') {
            technicalContact[fieldName] = value;
        }
    }

    return {
        profile,
        productOwner,
        technicalContact,
    }
}

const MyForm: React.SFC = () => {
    const { keycloak } = useKeycloak();
    const [ministry, setMinistrySponsor] = useState<any>(['Loading...']);

    const onSubmit = async (form: any) => {
        const { profile, productOwner, technicalContact } = transformFormData(form);

        if (keycloak && keycloak.authenticated) {
            axi.defaults.headers = {
                'Authorization': `Bearer ${keycloak?.token}`
            };
        }

        try {
            // 1. Create the project profile.
            const response: any = await axi.post('profile', profile);
            const profileId = response.data.id;

            // 2. Create contacts.
            const po: any = await axi.post('contact', productOwner);
            const tc: any = await axi.post('contact', technicalContact);

            // 3. Link the contacts to the profile.
            await axi.post(`profile/${profileId}/contact/${po.data.id}`);
            await axi.post(`profile/${profileId}/contact/${tc.data.id}`);

            // 4. All good? Tell the user.
        } catch (err) {
            console.log(err);
        }
    };

    // const validate = (values: any): any => {
    //     const errors = {}
    //     if (!values.username) {
    //         // @ts-ignore
    //         errors['project-name'] = 'Required'
    //     }

    //     console.log(errors);
    //     return errors;
    // };

    useEffect(() => {
        async function wrap() {
            const result = await axi.get('ministry', {
                headers: {
                    Accept: 'application/json',
                },
            });

            if (result.data) {
                console.log('Fetched ministry sponsors!!!');
                setMinistrySponsor(result.data);
            }
        }

        wrap();
    }, []);

    return (
        <Form
            onSubmit={onSubmit}>
            {props => (
                <form onSubmit={props.handleSubmit} >
                    <ShadowBox maxWidth="750px" p="24px" mt="150px" px="70px">
                        <StyledTitle>Tell us about your project</StyledTitle>
                        <Field name="project-name" validate={requiredField}>
                            {({ input, meta }) => (
                                <Flex flexDirection="column" pb="12px" style={{ position: "relative" }}>
                                    <Label htmlFor="project-name">Name</Label>
                                    <Input {...input} id="project-name" placeholder="Project X" />
                                    {meta.error && meta.touched && <Label as="span" style={{ position: "absolute", bottom: "-1em" }} variant="errorLabel">{meta.error}</Label>}
                                </Flex>
                            )}
                        </Field>
                        <Field name="project-description" validate={requiredField}>
                            {({ input, meta }) => (
                                <Flex flexDirection="column" pb="12px" style={{ position: "relative" }}>
                                    <Label htmlFor="project-description">Description</Label>
                                    <Textarea {...input} id="project-description" placeholder="A cutting edge web platform that enables Citizens to ..." rows={5} />
                                    {meta.error && meta.touched && <Label as="span" style={{ position: "absolute", bottom: "-1em" }} variant="errorLabel">{meta.error}</Label>}
                                </Flex>
                            )}
                        </Field>

                        <Flex>
                            <Label variant="adjacentLabel">Priority Application</Label>
                            <Flex flex="1 1 auto" justifyContent="flex-end">
                                <Label width="initial" px="8px">
                                    <Field
                                        name="project-prioritySystem"
                                        component="input"
                                        type="radio"
                                        value="yes"
                                    />
                                    <span>&nbsp;Yes</span>
                                </Label>
                                <Label width="initial" px="8px">
                                    <Field
                                        name="project-prioritySystem"
                                        component="input"
                                        type="radio"
                                        value="no"
                                        checked="checked"
                                    />
                                    <span>&nbsp;No</span>
                                </Label>
                            </Flex>
                        </Flex>
                        <Flex>
                            <Label variant="adjacentLabel">Ministry Sponsor</Label>
                            <Select flex="1 0 200px" name="project-busOrgId">
                                {ministry.map((s: any) => (
                                    <option
                                        key={s.code}
                                        value={s.code}
                                        defaultValue={s.code === DEFAULT_MINISTRY ? 'yes' : 'no'}
                                    >
                                        {s.name}
                                    </option>
                                ))}
                            </Select>
                        </Flex>
                    </ShadowBox>
                    <ShadowBox maxWidth="750px" p="24px" mt="68px" px="70px">
                        <StyledTitle>Who is the product owner for this project?</StyledTitle>

                        <Field name="po-firstName" validate={requiredField}>
                            {({ input, meta }) => (
                                <Flex flexDirection="column" pb="12px" style={{ position: "relative" }}>
                                    <Label htmlFor="po-first-name">First Name</Label>
                                    <Input {...input} id="po-first-name" placeholder="Jane" />
                                    {meta.error && meta.touched && <Label as="span" style={{ position: "absolute", bottom: "-1em" }} variant="errorLabel">{meta.error}</Label>}
                                </Flex>
                            )}
                        </Field>
                        <Field name="po-lastName" validate={requiredField}>
                            {({ input, meta }) => (
                                <Flex flexDirection="column" pb="12px" style={{ position: "relative" }}>
                                    <Label htmlFor="po-last-name">Last Name</Label>
                                    <Input {...input} id="po-last-name" placeholder="Doe" />
                                    {meta.error && meta.touched && <Label as="span" style={{ position: "absolute", bottom: "-1em" }} variant="errorLabel">{meta.error}</Label>}
                                </Flex>
                            )}
                        </Field>
                        <Field name="po-email" validate={requiredField}>
                            {({ input, meta }) => (
                                <Flex flexDirection="column" pb="12px" style={{ position: "relative" }}>
                                    <Label htmlFor="po-email">eMail Address</Label>
                                    <Input {...input} id="po-email" placeholder="jane.doe@gov.bc.ca" />
                                    {meta.error && meta.touched && <Label as="span" style={{ position: "absolute", bottom: "-1em" }} variant="errorLabel">{meta.error}</Label>}
                                </Flex>
                            )}
                        </Field>

                        <Field name="po-githubId" validate={requiredField}>
                            {({ input, meta }) => (
                                <Flex flexDirection="column" pb="12px" style={{ position: "relative" }}>
                                    <Label htmlFor="po-github-id">GitHub ID</Label>
                                    <Input {...input} id="po-github-id" placeholder="jane1100" />
                                    {/* {meta.error && meta.touched && <Label as="span" style={{ position: "absolute", bottom: "-1em" }} variant="errorLabel">{meta.error}</Label>} */}
                                </Flex>
                            )}
                        </Field>
                    </ShadowBox>

                    <ShadowBox maxWidth="750px" p="24px" mt="68px" px="70px">
                        <StyledTitle>Who is the technical contact for this project?</StyledTitle>

                        <Field name="tc-firstName" validate={requiredField}>
                            {({ input, meta }) => (
                                <Flex flexDirection="column" pb="12px" style={{ position: "relative" }}>
                                    <Label htmlFor="tc-first-name">First Name</Label>
                                    <Input {...input} id="tc-first-name" placeholder="Jane" />
                                    {meta.error && meta.touched && <Label as="span" style={{ position: "absolute", bottom: "-1em" }} variant="errorLabel">{meta.error}</Label>}
                                </Flex>
                            )}
                        </Field>
                        <Field name="tc-lastName" validate={requiredField}>
                            {({ input, meta }) => (
                                <Flex flexDirection="column" pb="12px" style={{ position: "relative" }}>
                                    <Label htmlFor="tc-last-name">Last Name</Label>
                                    <Input {...input} id="tc-last-name" placeholder="Doe" />
                                    {meta.error && meta.touched && <Label as="span" style={{ position: "absolute", bottom: "-1em" }} variant="errorLabel">{meta.error}</Label>}
                                </Flex>
                            )}
                        </Field>
                        <Field name="tc-email" validate={requiredField}>
                            {({ input, meta }) => (
                                <Flex flexDirection="column" pb="12px" style={{ position: "relative" }}>
                                    <Label htmlFor="tc-email">eMail Address</Label>
                                    <Input {...input} id="tc-email" placeholder="jane.doe@gov.bc.ca" />
                                    {meta.error && meta.touched && <Label variant="errorLabel">{meta.error}</Label>}
                                </Flex>
                            )}
                        </Field>

                        <Field name="tc-githubId" validate={requiredField}>
                            {({ input, meta }) => (
                                <Flex flexDirection="column" pb="12px" style={{ position: "relative" }}>
                                    <Label htmlFor="tc-github-id">GitHub ID</Label>
                                    <Input {...input} id="tc-github-id" placeholder="jane1100" />
                                    {meta.error && meta.touched && <Label variant="errorLabel">{meta.error}</Label>}
                                </Flex>
                            )}
                        </Field>
                        <StyledButton type="submit">Request</StyledButton>
                    </ShadowBox>
                </form>
            )}
        </Form>
    )
};


export default MyForm;
