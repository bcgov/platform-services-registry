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

    const onSubmit = (data: any) => {
        // const form = new FormData();
        const aData = { ...data, name: 'Hello' };
        axi.post('provisioning', aData, {
            headers: {
                // Accept: 'application/json',
                // TODO: Add authentication header.
            },
        }).then(res => {
            console.log('DONE!!!');
            console.log(res);
        });

        console.log(data, state);
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
        <ShadowBox maxWidth="750px" p="24px" mt="68px" px="70px">
            <StyledTitle>Tell us about your project</StyledTitle>
            <Form
                onSubmit={onSubmit}
                validate={validate}>
                {props => (
                    <form onSubmit={props.handleSubmit} >
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
                            <Text flex="0 0 66%">Critical Application</Text>
                            <Flex flex="1 1 auto" justifyContent="space-between">
                                <label>
                                    <Field
                                        name="isCritical"
                                        component="input"
                                        type="radio"
                                        value="yes"
                                    />
                                    <span>yes</span>
                                </label>
                                <label>
                                    <Field
                                        name="isCritical"
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
                        <button type="submit">Submit</button>
                    </form>
                )}
            </Form>
        </ShadowBox>
    )
};



MyForm.defaultProps = {
    children: null,
    onSubmit: () => { }
};

export default MyForm;
