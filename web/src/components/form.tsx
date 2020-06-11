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
    & > div {
        display: flex;
        flex-flow: row nowrap;
        line-height: 2em;
        margin: 5px;
        & > label {
        color: #333;
        width: 110px;
        font-size: 1em;
        line-height: 32px;
        }
        & > input,
        & > select,
        & > textarea {
        flex: 1;
        padding: 3px 5px;
        font-size: 1em;
        margin-left: 15px;
        border: 1px solid #ccc;
        border-radius: 3px;
        }
        & > input[type='checkbox'] {
        margin-top: 7px;
        }
        & > div {
        margin-left: 16px;
        & > label {
            display: block;
            & > input {
            margin-right: 3px;
            }
        }
        }
    }
    pre {
        border: 1px solid #ccc;
        background: rgba(0, 0, 0, 0.1);
        box-shadow: inset 1px 1px 3px rgba(0, 0, 0, 0.2);
        padding: 20px;
    }
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
`;

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
                    <Field name="myField">
                        {props => (
                            <div>
                                <label>Name</label>
                                <Field
                                    name="projectName"
                                    component="input"
                                    type="text"
                                    placeholder="Project Name"
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
