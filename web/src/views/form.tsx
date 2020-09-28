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
import { useKeycloak } from '@react-keycloak/web';
import { Input, Label, Textarea } from '@rebass/forms';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Field, Form } from 'react-final-form';
import { toast } from 'react-toastify';
import { Flex } from 'rebass';
import { ShadowBox } from '../components/UI/shadowContainer';
import { API, ROLES } from '../constants';

const axi = axios.create({
    baseURL: API.BASE_URL(),
});

const StyledButton = styled.button`
    margin-top: 20px;
    width: 50%;
    height: 60px;
    border-radius: 5px;
    background-color: #036;
    color: #FFFFFF;
    font-size: 24px;
`;

// @ts-ignore
const StyledTitle = styled.h1`
    font-size: 24px;
    font-weight: bold;
    font-stretch: normal;
    font-style: normal;
    line-height: normal;
    letter-spacing: normal;
    color: #036;
`;

// const StyledSelect = styled.div`
//     width: 100%;
// `;

// color: ${props => props.theme.color.bcblue };

const requiredField = (value: string) => (value ? undefined : 'Required')

// const xxx = (value: string) => {
//     console.log('vvvv', value);
// }

// const blarb = () => {
//     toast.success('🦄 Your namespace request was successful 🦄', {
//         position: toast.POSITION.TOP_CENTER,
//         autoClose: 5000,
//         hideProgressBar: false,
//         closeOnClick: true,
//         pauseOnHover: true,
//         draggable: false,
//         progress: undefined,
//     });
// }

const transformFormData = (data: any) => {
    console.log(data);
    const profile: any = {};
    const productOwner: any = {
        roleId: ROLES.PRODUCTOWNER,
    };
    const technicalContact: any = {
        roleId: ROLES.TECHNICAL,
    };

    for (const [key, value] of Object.entries(data)) {
        const [prefix, fieldName] = key.split('-');

        if (prefix === 'project') {
            profile[fieldName] = value;
        }
        if (prefix === 'po') {
            productOwner[fieldName] = value;
        }
        if (prefix === 'tc') {
            technicalContact[fieldName] = value;
        }
    }

    if (typeof profile.prioritySystem !== 'undefined') {
        const value = profile.prioritySystem.pop();
        profile.prioritySystem = value === 'yes' ? true : false;
    } else {
        profile.prioritySystem = false;
    }

    return {
        profile,
        productOwner,
        technicalContact,
    }
}

const MyForm: React.SFC = () => {
    const { keycloak } = useKeycloak();
    const [ministry, setMinistrySponsor] = useState<any>([]);

    const onSubmit = async (formData: any) => {
        const { profile, productOwner, technicalContact } = transformFormData(formData);

        // TODO:(jl) This is lame. Need to figure out a better way to 
        // do form validation.
        if (!profile.busOrgId) {
            alert("You need to select a Ministry Sponsor.");
            return;
        }

        if (keycloak && keycloak.authenticated) {
            axi.defaults.headers = {
                'Authorization': `Bearer ${keycloak?.token}`
            };
        }

        try {
            // 1. Create the project profile.
            const response: any = await axi.post('profile', profile);
            const profileId = response.data.id;

            // 2. Create contacts.
            const po: any = await axi.post('contact', productOwner);
            const tc: any = await axi.post('contact', technicalContact);

            // 3. Link the contacts to the profile.
            await axi.post(`profile/${profileId}/contact/${po.data.id}`);
            await axi.post(`profile/${profileId}/contact/${tc.data.id}`);

            // 4. Trigger provisioning
            await axi.post(`provision/${profileId}/namespace`);

            // 5.All good? Tell the user.
            toast.success('🦄 Your namespace request was successful', {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: false,
                progress: undefined,
            });
        } catch (err) {
            toast.error('😥 Something went wrong', {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });

            console.log(err);
        }
    };

    const validate = (values: any): any => {
        console.log('xxxv=', values);
        // const errors = {}
        // if (!values['project-busOrgId']) {
        //     // @ts-ignore
        //     errors['project-busOrgId'] = 'Required'
        // }

        // // console.log(errors);
        // return errors;
    };

    useEffect(() => {
        async function wrap() {
            try {
                const result = await axi.get('ministry', {
                    headers: {
                        Accept: 'application/json',
                    },
                });

                if (result.data) {
                    console.log('Fetched ministry sponsors!!!');
                    setMinistrySponsor(result.data);
                }
            } catch (err) {
                // if the api service is not available,
                // provide empty list query than err that breaks the front-end
                setMinistrySponsor([]);
            }
        }

        wrap();
    }, []);

    return (
        <div>
            <Form
                onSubmit={onSubmit}
                validate={validate}>
                {props => (
                    <form onSubmit={props.handleSubmit} >
                        <ShadowBox maxWidth="750px" p="24px" mt="150px" px="70px">
                            <StyledTitle>Tell us about your project</StyledTitle>
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
                                                key={s.code}
                                                value={s.code}
                                            >
                                                {s.name}
                                            </option>
                                        ))}
                                        {/* )} */}
                                    </Field>
                                </Flex>
                            </Flex>
                        </ShadowBox>
                        <ShadowBox maxWidth="750px" p="24px" mt="68px" px="70px">
                            <StyledTitle>Who is the product owner for this project?</StyledTitle>

                            <Field name="po-firstName" validate={requiredField}>
                                {({ input, meta }) => (
                                    <Flex flexDirection="column" pb="12px" style={{ position: "relative" }}>
                                        <Label htmlFor="po-first-name">First Name</Label>
                                        <Input {...input} id="po-first-name" placeholder="Jane" />
                                        {meta.error && meta.touched && <Label as="span" style={{ position: "absolute", bottom: "-1em" }} variant="errorLabel">{meta.error}</Label>}
                                    </Flex>
                                )}
                            </Field>
                            <Field name="po-lastName" validate={requiredField}>
                                {({ input, meta }) => (
                                    <Flex flexDirection="column" pb="12px" style={{ position: "relative" }}>
                                        <Label htmlFor="po-last-name">Last Name</Label>
                                        <Input {...input} id="po-last-name" placeholder="Doe" />
                                        {meta.error && meta.touched && <Label as="span" style={{ position: "absolute", bottom: "-1em" }} variant="errorLabel">{meta.error}</Label>}
                                    </Flex>
                                )}
                            </Field>
                            <Field name="po-email" validate={requiredField}>
                                {({ input, meta }) => (
                                    <Flex flexDirection="column" pb="12px" style={{ position: "relative" }}>
                                        <Label htmlFor="po-email">eMail Address</Label>
                                        <Input {...input} id="po-email" placeholder="jane.doe@gov.bc.ca" />
                                        {meta.error && meta.touched && <Label as="span" style={{ position: "absolute", bottom: "-1em" }} variant="errorLabel">{meta.error}</Label>}
                                    </Flex>
                                )}
                            </Field>

                            <Field name="po-githubId" validate={requiredField}>
                                {({ input }) => (
                                    <Flex flexDirection="column" pb="12px" style={{ position: "relative" }}>
                                        <Label htmlFor="po-github-id">GitHub ID</Label>
                                        <Input {...input} id="po-github-id" placeholder="jane1100" />
                                    </Flex>
                                )}
                            </Field>
                        </ShadowBox>

                        <ShadowBox maxWidth="750px" p="24px" mt="68px" px="70px">
                            <StyledTitle>Who is the technical contact for this project?</StyledTitle>

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
                        </ShadowBox>
                    </form>
                )
                }
            </Form >
        </div>
    )
};


export default MyForm;
