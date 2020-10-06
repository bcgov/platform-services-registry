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

import styled from '@emotion/styled';
import { Input, Label } from '@rebass/forms';
import React from 'react';
import { Field } from 'react-final-form';
import { Flex } from 'rebass';
import SubFormTitle from './UI/subFormTitle';

const StyledButton = styled.button`
    margin-top: 20px;
    width: 50%;
    height: 60px;
    border-radius: 5px;
    background-color: #036;
    color: #FFFFFF;
    font-size: 24px;
`;

interface ISubFormTCProps {
    requiredField: (value: string) => undefined | string;
}

const SubformTC: React.FC<ISubFormTCProps> = (props) => {
    const { requiredField } = props;

    return (
        <div>
            <SubFormTitle>Who is the technical contact for this project?</SubFormTitle>

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
        </div>
    );
};

export default SubformTC;
