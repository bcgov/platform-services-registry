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
import { Input, Label, Textarea } from '@rebass/forms';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Field, Form } from 'react-final-form';
import { Flex, Text } from 'rebass';
import { API, ROLES } from '../constants';
import typography from '../typography';
import { ShadowBox } from './UI/shadowContainer';
export interface IFormProps {
    children?: React.ReactNode,
    onSubmit?: (e: any) => void
};

const axi = axios.create({
    baseURL: API.BASE_URL(),
});

const StyledTitle = styled.h1`
    ${typography.toString()}
    font-size: 24px;
    font-weight: bold;
    font-stretch: normal;
    font-style: normal;
    line-height: normal;
    letter-spacing: normal;
    color: #036;
`;

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

const MyForm: React.SFC<IFormProps> = (props) => {
    const { keycloak } = useKeycloak();
    const [state, setState] = useState<any>([]);

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
            const x: any = await axi.post('contact', productOwner);
            const y: any = await axi.post('contact', technicalContact);

            // 3. Link the contacts to the profile.
            await axi.post(`profile/${profileId}/contact/${x.data.id}`);
            await axi.post(`profile/${profileId}/contact/${y.data.id}`);

            // 4. Create the provisioning request (submit clusters);
            // const provision = {
            //     profileId: response.id,
            //     clusters: [1, 3],
            // }

            // await axi.post('provision', provision, headers);

            // 5. All good? Tell the user.
        } catch (err) {
            console.log(err);
        }
    };

    const validate = (values: any): any => {
        console.log('validate = ', values);
    };

    useEffect(() => {
        async function wrap() {
            const result = await axi.get('ministry', {
                headers: {
                    Accept: 'application/json',
                    // TODO: Add authentication header.
                },
            });

            if (result.data) {
                console.log('Fetched ministry sponsors!!!');
                setState(result.data);
            }
        }

        wrap();
    }, []);

    return (
        <Form
            onSubmit={onSubmit}
            validate={validate}>
            {props => (
                <form onSubmit={props.handleSubmit} >
                    <ShadowBox maxWidth="750px" p="24px" mt="68px" px="70px">
                        <StyledTitle>Tell us about your project</StyledTitle>
                        <Field name="project-name">
                            {({ input }) => (
                                <Flex flexDirection="column">
                                    <Label htmlFor="project-name">Name</Label>
                                    <Input {...input} id="project-name" placeholder="Project Name" />
                                </Flex>
                            )}
                        </Field>
                        <Field name="project-description">
                            {({ input }) => (
                                <Flex flexDirection="column">
                                    <Label>Description</Label>
                                    <Textarea {...input} id="project-description" rows={5} />
                                </Flex>
                            )}
                        </Field>

                        <Flex>
                            <Text flex="0 0 66%">Priority Application</Text>
                            <Flex flex="1 1 auto" justifyContent="space-between">
                                <label>
                                    <Field
                                        name="project-prioritySystem"
                                        component="input"
                                        type="radio"
                                        value="yes"
                                    />
                                    <span>yes</span>
                                </label>
                                <label>
                                    <Field
                                        name="project-prioritySystem"
                                        component="input"
                                        type="radio"
                                        value="no"
                                    />
                                    <span>no</span>
                                </label>
                            </Flex>
                        </Flex>

                        <Flex>
                            <Text flex="0 0 66%">Ministry Sponsor</Text>
                            <Field flex="1 1 auto" name="project-busOrgId" component="select">
                                {state.map((s: any) => (
                                    <option key={s.code} value={s.code}>
                                        {s.name}
                                    </option>
                                ))}
                            </Field>
                        </Flex>
                    </ShadowBox>

                    <ShadowBox maxWidth="750px" p="24px" mt="68px" px="70px">
                        <StyledTitle>What type of infrastructure do you need?</StyledTitle>
                    </ShadowBox>

                    <ShadowBox maxWidth="750px" p="24px" mt="68px" px="70px">
                        <StyledTitle>Who is the product owner for this project?</StyledTitle>

                        <Field name="po-firstName">
                            {({ input }) => (
                                <Flex flexDirection="column">
                                    <Label htmlFor="po-first-name">First Name</Label>
                                    <Input {...input} id="po-first-name" placeholder="Jane" />
                                </Flex>
                            )}
                        </Field>
                        <Field name="po-lastName">
                            {({ input }) => (
                                <Flex flexDirection="column">
                                    <Label htmlFor="po-last-name">Last Name</Label>
                                    <Input {...input} id="po-last-name" placeholder="Doe" />
                                </Flex>
                            )}
                        </Field>
                        <Field name="po-email">
                            {({ input }) => (
                                <Flex flexDirection="column">
                                    <Label htmlFor="po-email">eMail Address</Label>
                                    <Input {...input} id="po-email" placeholder="jane.doe@gov.bc.ca" />
                                </Flex>
                            )}
                        </Field>

                        <Field name="po-githubId">
                            {({ input }) => (
                                <Flex flexDirection="column">
                                    <Label htmlFor="po-github-id">GitHub ID</Label>
                                    <Input {...input} id="po-github-id" placeholder="jane1100" />
                                </Flex>
                            )}
                        </Field>
                    </ShadowBox>

                    <ShadowBox maxWidth="750px" p="24px" mt="68px" px="70px">
                        <StyledTitle>Who is the technical contact for this project?</StyledTitle>

                        <Field name="tc-firstName">
                            {({ input }) => (
                                <Flex flexDirection="column">
                                    <Label htmlFor="tc-first-name">First Name</Label>
                                    <Input {...input} id="tc-first-name" placeholder="Jane" />
                                </Flex>
                            )}
                        </Field>
                        <Field name="tc-lastName">
                            {({ input }) => (
                                <Flex flexDirection="column">
                                    <Label htmlFor="tc-last-name">Last Name</Label>
                                    <Input {...input} id="tc-last-name" placeholder="Doe" />
                                </Flex>
                            )}
                        </Field>
                        <Field name="tc-email">
                            {({ input }) => (
                                <Flex flexDirection="column">
                                    <Label htmlFor="tc-email">eMail Address</Label>
                                    <Input {...input} id="tc-email" placeholder="jane.doe@gov.bc.ca" />
                                </Flex>
                            )}
                        </Field>

                        <Field name="tc-githubId">
                            {({ input }) => (
                                <Flex flexDirection="column">
                                    <Label htmlFor="tc-github-id">GitHub ID</Label>
                                    <Input {...input} id="tc-github-id" placeholder="jane1100" />
                                </Flex>
                            )}
                        </Field>
                    </ShadowBox>
                    <ShadowBox>
                        <button type="submit">Submit</button>
                    </ShadowBox>
                </form>
            )}
        </Form>
    )
};

MyForm.defaultProps = {
    children: null,
    onSubmit: () => { }
};

export default MyForm;
