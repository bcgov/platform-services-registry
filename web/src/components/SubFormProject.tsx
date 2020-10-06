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
import SubFormTitle from './UI/subFormTitle';

interface MinistryItem {
    name: string;
    code: string;
}

interface ISubFormProjectProps {
    ministry: Array<MinistryItem>;
    requiredField: (value: string) => undefined | string;
}

const SubFormProject: React.FC<ISubFormProjectProps> = (props) => {
    const { ministry, requiredField } = props;

    return (
        <div>
            <SubFormTitle>Tell us about your project</SubFormTitle>
            <Field name="project-name" validate={requiredField}>
                {({ input, meta }) => (
                    <Flex flexDirection="column" pb="12px" style={{ position: "relative" }}>
                        <Label htmlFor="project-name">Name</Label>
                        <Input {...input} id="project-name" placeholder="Project X" />
                        {meta.error && meta.touched && <Label as="span" style={{ position: "absolute", bottom: "-1em" }} variant="errorLabel">{meta.error}</Label>}
                    </Flex>
                )}
            </Field>
            <Field name="project-description" validate={requiredField}>
                {({ input, meta }) => (
                    <Flex flexDirection="column" pb="12px" style={{ position: "relative" }}>
                        <Label htmlFor="project-description">Description</Label>
                        <Textarea {...input} id="project-description" placeholder="A cutting edge web platform that enables Citizens to ..." rows={5} />
                        {meta.error && meta.touched && <Label as="span" style={{ position: "absolute", bottom: "-1em" }} variant="errorLabel">{meta.error}</Label>}
                    </Flex>
                )}
            </Field>
            <Flex>
                <Label variant="adjacentLabel">Is this a Priority Application?</Label>
                <Flex flex="1 1 auto" justifyContent="flex-end">
                    <Label width="initial" px="8px">
                        <Field
                            name="project-prioritySystem"
                            component="input"
                            type="checkbox"
                            value="yes"
                        >
                            {({ input, meta }) => (
                                < >
                                    <input
                                        style={{ width: '35px', height: '35px' }}
                                        name={input.name}
                                        type="checkbox"
                                        value="yes"
                                        checked={input.checked}
                                        onChange={input.onChange}
                                    />
                                    {meta.error && meta.modified && <Label as="span" style={{ position: "absolute", bottom: "-1em" }} variant="errorLabel">{meta.error}</Label>}
                                </>
                            )}
                        </Field>
                    </Label>
                </Flex>
            </Flex>
            <Flex>
                <Label variant="adjacentLabel">Ministry Sponsor</Label>
                <Flex flex="1 1 auto" justifyContent="flex-end" name="project-busOrgId">
                    <Field
                        flex="1 0 200px"
                        name="project-busOrgId"
                        component="select"
                    >
                        {/* {({ input, meta }) => ( */}
                        <option>Select...</option>
                        {ministry.map((s: any) => (
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
        </div>
    );
};

export default SubFormProject;
