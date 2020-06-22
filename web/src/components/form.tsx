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
import { Input, Label, Textarea } from '@rebass/forms';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Field, Form } from 'react-final-form';
import { Flex, Text } from 'rebass';
import { API } from '../constants';
import typography from '../typography';
import { ShadowBox } from './UI/shadowContainer';

export interface IFormProps {
    children?: React.ReactNode,
    onSubmit?: (e: any) => void
};

const axi = axios.create({
    baseURL: API.BASE_URL(),
    // headers: {
    //     Authorization: `Bearer ${keycloak?.token}`
    // },
});
console.log(`API Base URL = ${API.BASE_URL()}`);

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

const MyForm: React.SFC<IFormProps> = (props) => {
    // const { keycloak } = useKeycloak();
    const [state, setState] = useState<any>([]);

    const onSubmit = async (data: any) => {
        const headers = {
            // TODO: Add authentication header.
        };
        const profile = {
            name: 'Health Gateway II',
            description: 'This is a cool website',
            busOrgId: 'HLTH',
            prioritySystem: false
        };
        const pcontact = {
            firstName: 'Jason',
            lastName: 'Leach',
            email: 'jason.leach@fullboar.ca',
            githubId: 'jleach',
            roleId: 1,
        }
        const tcontact = {
            firstName: 'Phill',
            lastName: 'Billips',
            email: 'phill.billips@fullboar.ca',
            githubId: 'githubPB',
            roleId: 2,
        }

        try {
            // 1. Create the project profile.
            const response: any = await axi.post('profile', profile, headers);
            const profileId = response.data.id;

            // 2. Create people and relate to project profile.
            const x: any = await axi.post('contact', pcontact, headers);
            const y: any = await axi.post('contact', tcontact, headers);

            // 3. Link the contacts to the profile.
            await axi.post(`profile/${profileId}/contact/${x.data.id}`, headers);
            await axi.post(`profile/${profileId}/contact/${y.data.id}`, headers);

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

    // if (keycloak && keycloak.authenticated) {
    //     console.log('XXXXXXXXXXXX')
    //     axi.defaults.headers.common['Authorization'] = `Bearer ${keycloak?.token}`;
    // }

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
                        <Field name="name">
                            {({ input }) => (
                                <Flex flexDirection="column">
                                    <Label htmlFor="project-name">Name</Label>
                                    <Input {...input} id="project-name" placeholder="Project Name" />
                                </Flex>
                            )}
                        </Field>
                        <Field name="description">
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
                                        name="prioritySystem"
                                        component="input"
                                        type="radio"
                                        value="yes"
                                    />
                                    <span>yes</span>
                                </label>
                                <label>
                                    <Field
                                        name="prioritySystem"
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
                            <Field flex="1 1 auto" name="ministry" component="select">
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

                        <Field name="po-first-name">
                            {({ input }) => (
                                <Flex flexDirection="column">
                                    <Label htmlFor="po-first-name">First Name</Label>
                                    <Input {...input} id="po-first-name" placeholder="Jane" />
                                </Flex>
                            )}
                        </Field>
                        <Field name="po-last-name">
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

                        <Field name="po-github-id">
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

                        <Field name="tc-first-name">
                            {({ input }) => (
                                <Flex flexDirection="column">
                                    <Label htmlFor="tc-first-name">First Name</Label>
                                    <Input {...input} id="tc-first-name" placeholder="Jane" />
                                </Flex>
                            )}
                        </Field>
                        <Field name="tc-last-name">
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

                        <Field name="tc-github-id">
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
