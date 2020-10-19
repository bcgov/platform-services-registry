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
import useValidator from '../utils/useValidator';
import SubFormTitle from './UI/subFormTitle';

const SubformPO: React.FC = () => {
    const validator = useValidator();

    return (
        <div>
            <SubFormTitle>Who is the product owner for this project?</SubFormTitle>

            <Field name="po-firstName" validate={validator.mustBeValidName}>
                {({ input, meta }) => (
                    <Flex flexDirection="column" pb="12px" style={{ position: "relative" }}>
                        <Label htmlFor="po-first-name">First Name</Label>
                        <Input {...input} id="po-first-name" placeholder="Jane" />
                        {meta.error && meta.touched && <Label as="span" style={{ position: "absolute", bottom: "-1em" }} variant="errorLabel">{meta.error}</Label>}
                    </Flex>
                )}
            </Field>
            <Field name="po-lastName" validate={validator.mustBeValidName}>
                {({ input, meta }) => (
                    <Flex flexDirection="column" pb="12px" style={{ position: "relative" }}>
                        <Label htmlFor="po-last-name">Last Name</Label>
                        <Input {...input} id="po-last-name" placeholder="Doe" />
                        {meta.error && meta.touched && <Label as="span" style={{ position: "absolute", bottom: "-1em" }} variant="errorLabel">{meta.error}</Label>}
                    </Flex>
                )}
            </Field>
            <Field name="po-email" validate={validator.mustBeValidEmail}>
                {({ input, meta }) => (
                    <Flex flexDirection="column" pb="12px" style={{ position: "relative" }}>
                        <Label htmlFor="po-email">eMail Address</Label>
                        <Input {...input} id="po-email" placeholder="jane.doe@gov.bc.ca" />
                        {meta.error && meta.touched && <Label as="span" style={{ position: "absolute", bottom: "-1em" }} variant="errorLabel">{meta.error}</Label>}
                    </Flex>
                )}
            </Field>
            <Field name="po-githubId" validate={validator.mustBeValidGithubName}>
                {({ input, meta }) => (
                    <Flex flexDirection="column" pb="12px" style={{ position: "relative" }}>
                        <Label htmlFor="po-github-id">GitHub ID</Label>
                        <Input {...input} id="po-github-id" placeholder="jane1100" />
                        {meta.error && meta.touched && <Label as="span" style={{ position: "absolute", bottom: "-1em" }} variant="errorLabel">{meta.error}</Label>}
                    </Flex>
                )}
            </Field>
        </div>
    );
};

export default SubformPO;
