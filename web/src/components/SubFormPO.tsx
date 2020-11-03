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

import { useKeycloak } from '@react-keycloak/web';
import { Input, Label } from '@rebass/forms';
import React from 'react';
import { Field } from 'react-final-form';
import { Flex } from 'rebass';
import getDecodedToken from '../utils/TokenDecoder';
import useValidator from '../utils/useValidator';
import SubFormTitle from './UI/subFormTitle';

const SubformPO: React.FC = () => {
    const validator = useValidator();

    const { keycloak } = useKeycloak();

    const decodedToken = getDecodedToken(`${keycloak?.token}`);

    return (
        <div>
            <SubFormTitle>Who is the product owner for this project?</SubFormTitle>

            <Field name="po-firstName" validate={validator.mustBeValidName}>
                {({ input, meta }) => (
                    <Flex flexDirection="column" pb="25px" style={{ position: "relative" }}>
                        <Label m="0" htmlFor="po-first-name">First Name</Label>
                        <Input mt="8px" {...input} id="po-first-name" value={decodedToken.given_name} disabled />
                        {meta.error && meta.touched && <Label as="span" style={{ position: "absolute", bottom: "0" }} variant="errorLabel">{meta.error}</Label>}
                    </Flex>
                )}
            </Field>
            <Field name="po-lastName" validate={validator.mustBeValidName}>
                {({ input, meta }) => (
                    <Flex flexDirection="column" pb="25px" style={{ position: "relative" }}>
                        <Label m="0" htmlFor="po-last-name">Last Name</Label>
                        <Input mt="8px" {...input} id="po-last-name" value={decodedToken.family_name} disabled />
                        {meta.error && meta.touched && <Label as="span" style={{ position: "absolute", bottom: "0" }} variant="errorLabel">{meta.error}</Label>}
                    </Flex>
                )}
            </Field>
            <Field name="po-email" validate={validator.mustBeValidEmail}>
                {({ input, meta }) => (
                    <Flex flexDirection="column" pb="25px" style={{ position: "relative" }}>
                        <Label m="0" htmlFor="po-email">eMail Address</Label>
                        <Input mt="8px" {...input} id="po-email" value={decodedToken.email} disabled />
                        {meta.error && meta.touched && <Label as="span" style={{ position: "absolute", bottom: "0" }} variant="errorLabel">{meta.error}</Label>}
                    </Flex>
                )}
            </Field>
            <Field name="po-githubId" validate={validator.mustBeValidGithubName}>
                {({ input, meta }) => (
                    <Flex flexDirection="column" pb="25px" style={{ position: "relative" }}>
                        <Label m="0" htmlFor="po-github-id">GitHub ID</Label>
                        <Input mt="8px" {...input} id="po-github-id" placeholder="jane1100" />
                        {meta.error && meta.touched && <Label as="span" style={{ position: "absolute", bottom: "0" }} variant="errorLabel">{meta.error}</Label>}
                    </Flex>
                )}
            </Field>
        </div>
    );
};

export default SubformPO;
