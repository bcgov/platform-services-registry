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

import { Input, Label, Textarea } from '@rebass/forms';
import React from 'react';
import { Field } from 'react-final-form';
import { Flex } from 'rebass';
import { COMPONENT_METADATA } from '../../constants';
import getValidator from '../../utils/getValidator';
import FormSubtitle from '../common/UI/FormSubtitle';
import FormTitle from '../common/UI/FormTitle';

interface MinistryItem {
    name: string;
    code: string;
}

interface ICreateFormProjectProps {
    ministry: Array<MinistryItem>;
}

const CreateFormProject: React.FC<ICreateFormProjectProps> = (props) => {
    const validator = getValidator();

    const { ministry = [] } = props;

    return (
        <div>
            <FormTitle>Tell us about your project</FormTitle>
            <FormSubtitle>As the capacity in the Silver cluster remains to be an issue due to the slow progress of the app migration, the priority will be given to provisioning namespaces for the projects that a) migrate from OCP3 and b) have short 2-3 week migration timelines starting from when the namespaces are provisioned. Please, indicate in the project description field if your project meets the 2 criteria above</FormSubtitle>
            <Field name="project-name" validate={validator.mustBeValidProfileName}>
                {({ input, meta }) => (
                    <Flex flexDirection="column" pb="25px" style={{ position: "relative" }}>
                        <Label m="0" htmlFor="project-name">Name</Label>
                        <Input mt="8px" {...input} id="project-name" placeholder="Project X" />
                        {meta.error && meta.touched && <Label as="span" style={{ position: "absolute", bottom: "0" }} variant="errorLabel">{meta.error}</Label>}
                    </Flex>
                )}
            </Field>
            <Field name="project-description" validate={validator.mustBeValidProfileDescription}>
                {({ input, meta }) => (
                    <Flex flexDirection="column" pb="25px" style={{ position: "relative" }}>
                        <Label m="0" htmlFor="project-description">Description</Label>
                        <Textarea mt="8px" {...input} id="project-description" placeholder="A cutting edge web platform that enables Citizens to ..." rows={5} />
                        {meta.error && meta.touched && <Label as="span" style={{ position: "absolute", bottom: "0" }} variant="errorLabel">{meta.error}</Label>}
                    </Flex>
                )}
            </Field>
            <Flex pb="20px">
                <Label m="0" variant="adjacentLabel">Is this a Priority Application?</Label>
                <Flex flex="1 1 auto" justifyContent="flex-end">
                    <Label m="0" width="initial" px="8px">
                        <Field
                            name="project-prioritySystem"
                            component="input"
                            type="checkbox"
                        >
                            {({ input }) => (
                                <input
                                    style={{ width: '35px', height: '35px' }}
                                    name={input.name}
                                    type="checkbox"
                                    checked={input.checked}
                                    onChange={input.onChange}
                                />
                            )}
                        </Field>
                    </Label>
                </Flex>
            </Flex>
            <Flex pb="20px">
                <Label variant="adjacentLabel">Ministry Sponsor</Label>
                <Flex flex="1 1 auto" justifyContent="flex-end" name="project-busOrgId">
                    {/* using a className prop as react final form Field does
                    not seem to expose any API to modify CSS */}
                    <Field
                        name="project-busOrgId"
                        component="select"
                        className="misc-class-m-dropdown-select"
                    >
                        {/* {({ input, meta }) => ( */}
                        <option>Select...</option>
                        {(ministry.length > 0) && ministry.map((s: any) => (
                            <option
                                key={s.id}
                                value={s.id}
                            >
                                {s.name}
                            </option>
                        ))}
                        {/* )} */}
                    </Field>
                </Flex>
            </Flex>
            <Label variant="adjacentLabel">Please indicate what services you expect to utilize as part of your project?</Label>
            {COMPONENT_METADATA.map(item => (
                <Flex key={item.inputValue}>
                    <Label variant="adjacentLabel">{item.displayName}</Label>
                    <Flex flex="1 1 auto" justifyContent="flex-end">
                        <Label width="initial" px="8px">
                            <Field
                                name={`project-${item.inputValue}`}
                                component="input"
                                type="checkbox"
                            >
                                {({ input }) => (
                                    <input
                                        style={{ width: "35px", height: "35px" }}
                                        name={input.name}
                                        type="checkbox"
                                        checked={input.checked}
                                        onChange={input.onChange}
                                    />
                                )}
                            </Field>
                        </Label>
                    </Flex>
                </Flex>
            ))}
            <Field name="project-other" validate={validator.mustBeValidComponentOthers}>
                {({ input, meta }) => (
                    <Flex pb="25px" style={{ position: "relative" }}>
                        <Label htmlFor="project-other">Other:</Label>
                        <Flex flex="1 1 auto" justifyContent="flex-end">
                            <Input {...input} id="project-other" />
                        </Flex>
                        {meta.error && meta.touched && <Label as="span" style={{ position: "absolute", bottom: "0" }} variant="errorLabel" >{meta.error}</Label>}
                    </Flex>
                )}
            </Field>
        </div>
    );
};

export default CreateFormProject;
