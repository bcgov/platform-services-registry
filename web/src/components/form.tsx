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

// import { useKeycloak } from '@react-keycloak/web';
import styled from '@emotion/styled';
import { Input, Label, Textarea } from '@rebass/forms';
import React from 'react';
import { Field, Form } from 'react-final-form';
import { Flex, Text } from 'rebass';
import typography from '../typography';
import { ShadowBox } from './UI/shadowContainer';

export interface IFormProps {
    children?: React.ReactNode,
    onSubmit?: (e: any) => void
};

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

const onSubmit = () => { };
const validate = (values: any): any => { return; };

const MyForm: React.SFC<IFormProps> = (props) => {
    // const { keycloak } = useKeycloak();

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
                                <option value="CITZ:EX">Citizens' Services</option>
                                <option value="FOO:BAR">Ham</option>
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
