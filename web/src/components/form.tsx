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
import React from 'react';
import { Field, Form } from 'react-final-form';
import typography from '../typography';

export interface IFormProps {
    children?: React.ReactNode,
    onSubmit?: (e: any) => void
};

const StyledForm = styled.form`
    margin: 100px 0px 0px 100px;
    width: 606px;
    height: 578px;
    border-radius: 5px;
    box-shadow: 0 4px 40px 0 rgba(0, 0, 0, 0.07);
    background-color: #C0C0F0; // <- so I can see it better for now.
`;

const StyledTitle = styled.h1`
    ${typography.toString()}
    width: 261px;
    height: 28px;
    font-size: 24px;
    font-weight: bold;
    font-stretch: normal;
    font-style: normal;
    line-height: normal;
    letter-spacing: normal;
    color: #036;
`

const StyledLabel = styled.p`
    ${typography.toString()}
    width: 43px;
    height: 18px;
    font-size: 15px;
    font-weight: 500;
    font-stretch: normal;
    font-style: normal;
    line-height: normal;
    letter-spacing: normal;
    color: #036;
`

const onSubmit = () => { };
const validate = (values: any): any => { return; };

const MyForm: React.SFC<IFormProps> = (props) => {
    // const { keycloak } = useKeycloak();

    return (
        <Form
            onSubmit={onSubmit}
            validate={validate}>
            {props => (
                <StyledForm onSubmit={props.handleSubmit}>
                    <StyledTitle>Tell us about your project</StyledTitle>
                    <StyledLabel>Name</StyledLabel>
                    <Field name="myField">
                        {props => (
                            <div>
                                <input type="text"
                                    name={props.input.name}
                                    value={props.input.value}
                                    onChange={props.input.onChange}
                                />
                            </div>
                        )}
                    </Field>
                    <button type="submit">Submit</button>
                </StyledForm>
            )}
        </Form>
    )
};

MyForm.defaultProps = {
    children: null,
    onSubmit: () => { }
};

export default MyForm;
