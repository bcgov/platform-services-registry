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

import { useKeycloak } from '@react-keycloak/web';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Form } from 'react-final-form';
import { toast } from 'react-toastify';
import { Box, Flex, Text } from 'rebass';
import SubFormPO from '../components/SubFormPO';
import SubFormProject from '../components/SubFormProject';
import SubFormTC from '../components/SubFormTC';
import { ShadowBox } from '../components/UI/shadowContainer';
import { API } from '../constants';
import transformFormData from '../utils/transformFormData';

const axi = axios.create({
    baseURL: API.BASE_URL(),
});

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

const txtForProjectForm = `If this is your first time on the OpenShift platform you need to book an alignment meeting with the Platform Services team; Reach out to xxx@gov.bc.ca to get started.`;

const txtForPO = `Tell us about the Product Owner (PO). This is typically the business owner of the application; we will use this information to contact them with any non-technical questions.`;

const txtForTC = `Tell us about the Technical Contact (TC). This is typically the DevOps specialist; we will use this information to contact them within any technical questions or notify them about platform events.`;

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
        <Form
            onSubmit={onSubmit}
            validate={validate}>
            {props => (
                <form onSubmit={props.handleSubmit} >
                    <Flex flexWrap='wrap' mx={-2}>
                        <ShadowBox maxWidth="750px" p="24px" mt="0px" px={["24px", "24px", "70px"]} width={[1, 1, 2 / 3]}>
                            <SubFormProject ministry={ministry} requiredField={requiredField} />
                        </ShadowBox>
                        <Box p={"30px"} width={[1, 1, 1 / 3]}>
                            <Text>{txtForProjectForm}</Text>
                            <Text pt={"24px"} >If you're new to OpenShift check out our {<a rel="noopener noreferrer" href="https://developer.gov.bc.ca/Getting-Started-on-the-DevOps-Platform/How-to-Request-a-New-OpenShift-Project" target="_blank">Getting Started</a>} on the DevOps Platform guide. It's full of tones of useful information.</Text>
                        </Box>
                    </Flex>
                    <Flex flexWrap='wrap' mx={-2} mt="68px">
                        <ShadowBox maxWidth="750px" p="24px" mt="0px" px={["24px", "24px", "70px"]} width={[1, 1, 2 / 3]}>
                            <SubFormPO requiredField={requiredField} />
                        </ShadowBox>
<<<<<<< HEAD
                        <Box p={"30px"} width={[1, 1, 1 / 3]}>
                            <Text>{txtForPO}</Text>
                        </Box>
                    </Flex>
                    <Flex flexWrap='wrap' mx={-2} mt="68px" >
                        <ShadowBox maxWidth="750px" p="24px" mt="0px" px={["24px", "24px", "70px"]} width={[1, 1, 2 / 3]}>
                            <SubFormTC requiredField={requiredField} />
=======

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
>>>>>>> Update PUT query: remove comma
                        </ShadowBox>
                        <Box p={"30px"} width={[1, 1, 1 / 3]}>
                            <Text>{txtForTC}</Text>
                        </Box>
                    </Flex>
                </form>
            )}
        </Form >
    )
};


export default MyForm;
