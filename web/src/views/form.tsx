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

import React, { useEffect, useState } from 'react';
import { Form } from 'react-final-form';
import { Redirect } from 'react-router-dom';
import { Box, Flex, Text } from 'rebass';
import SubFormPO from '../components/SubFormPO';
import SubFormProject from '../components/SubFormProject';
import SubFormTC from '../components/SubFormTC';
import { ShadowBox } from '../components/UI/shadowContainer';
import { ROUTE_PATHS } from '../constants';
import { promptErrToastWithText, promptSuccessToastWithText } from '../utils/promptToastHelper';
import { transformForm } from '../utils/transformDataHelper';
import useRegistryApi from '../utils/useRegistryApi';
const txtForPO = `Tell us about the Product Owner (PO). This is typically the business owner of the application; we will use this information to contact them with any non-technical questions.`;
const txtForPO2 = `Although not required, we strongly recommend the requestor be the product owner so that this record appears on their dashboard when logging on to the registry; only the requestor will be able to edit this project in the future.`;
const txtForTC = `Tell us about the Technical Contact (TC). This is typically the DevOps specialist; we will use this information to contact them with technical questions or notify them about platform events.`;

interface IFormProps {
    openBackdropCB: () => void;
    closeBackdropCB: () => void;
};

const MyForm: React.FC<IFormProps> = (props: any) => {
    const { openBackdropCB, closeBackdropCB } = props;

    const api = useRegistryApi();

    const [ministry, setMinistry] = useState<any>([]);

    const [goBackToDashboard, setGoBackToDashboard] = useState(false);

    const onSubmit = async (formData: any) => {
        const { profile, productOwner, technicalContact } = transformForm(formData);

        // TODO: fx this work-around
        if (!profile.busOrgId) {
            alert("You need to select a Ministry Sponsor.");
            return;
        }
        openBackdropCB();
        try {
            // 1. Create the project profile.
            const response: any = await api.createProfile(profile);
            const profileId = response.data.id;

            // 2. Create contacts.
            const po: any = await api.createContact(productOwner);
            const tc: any = await api.createContact(technicalContact);

            // 3. Link the contacts to the profile.
            await api.linkContactToProfileById(profileId, po.data.id);
            await api.linkContactToProfileById(profileId, tc.data.id);

            // 4. Trigger provisioning
            await api.createNamespaceByProfileId(profileId);

            closeBackdropCB();
            setGoBackToDashboard(true);
            // 5.All good? Tell the user.
            promptSuccessToastWithText('Your namespace request was successful');
        } catch (err) {
            closeBackdropCB();
            const msg = `Unable to submit request at this time, reason = ${err.message}`;
            promptErrToastWithText(msg);
            console.log(err);
        }
    };

    useEffect(() => {
        async function wrap() {
            const response = await api.getMinistry();
            setMinistry(response.data);
        }
        wrap();

        // eslint-disable-next-line
    }, []);

    if (goBackToDashboard) {
        return (<Redirect to={ROUTE_PATHS.DASHBOARD} />);
    }
    return (
        <Form
            onSubmit={onSubmit}
            validate={values => {
                const errors = {};
                return errors;
            }}
        >
            {props => (
                <form onSubmit={props.handleSubmit} >
                    <Flex flexWrap='wrap' mx={-2}>
                        <ShadowBox maxWidth="750px" p="24px" mt="0px" px={["24px", "24px", "70px"]} width={[1, 1, 2 / 3]}>
                            <SubFormProject ministry={ministry} />
                        </ShadowBox>
                        <Box p={"30px"} width={[1, 1, 1 / 3]}>
                            <Text>If this is your first time on the OpenShift platform you need to book an alignment meeting with the Platform Services team; Reach out to {<a href="mailto: olena.mitovska@gov.bc.ca">olena.mitovska@gov.bc.ca</a>} to get started.</Text>
                            <Text pt={"24px"} >If you're new to OpenShift check out our {<a rel="noopener noreferrer" href="https://docs.google.com/presentation/d/1UcT0b2YTPki_o0et9ZCLKv8vF19eYakJQitU85TAeD4/edit?usp=sharing" target="_blank">Getting Started</a>} on the DevOps Platform guide. It's full of tones of useful information.</Text>
                        </Box>
                    </Flex>
                    <Flex flexWrap='wrap' mx={-2} mt="68px">
                        <ShadowBox maxWidth="750px" p="24px" mt="0px" px={["24px", "24px", "70px"]} width={[1, 1, 2 / 3]}>
                            <SubFormPO />
                        </ShadowBox>
                        <Box p={"30px"} width={[1, 1, 1 / 3]}>
                            <Text>{txtForPO}</Text>
                            <Text pt={"24px"}>{txtForPO2}</Text>
                        </Box>
                    </Flex>
                    <Flex flexWrap='wrap' mx={-2} mt="68px" >
                        <ShadowBox maxWidth="750px" p="24px" mt="0px" px={["24px", "24px", "70px"]} width={[1, 1, 2 / 3]}>
                            <SubFormTC />
                        </ShadowBox>
                        <Box p={"30px"} width={[1, 1, 1 / 3]}>
                            <Text>{txtForTC}</Text>
                        </Box>
                    </Flex>
                </form>
            )}
        </Form >
    );
};

export default MyForm;
