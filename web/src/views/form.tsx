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
import { Flex } from 'rebass';
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
                        <ShadowBox maxWidth="750px" p="24px" mt="0px" px="70px" width={[1, 1, 2 / 3]}>
                            <SubFormProject ministry={ministry} requiredField={requiredField} />
                        </ShadowBox>
                    </Flex>
                    <Flex flexWrap='wrap' mx={-2} mt="68px">
                        <ShadowBox maxWidth="750px" p="24px" mt="0px" px="70px" width={[1, 1, 2 / 3]}>
                            <SubFormPO requiredField={requiredField} />
                        </ShadowBox>
                    </Flex>
                    <Flex flexWrap='wrap' mx={-2} mt="68px" >
                        <ShadowBox maxWidth="750px" p="24px" mt="0px" px="70px" width={[1, 1, 2 / 3]}>
                            <SubFormTC requiredField={requiredField} />
                        </ShadowBox>
                    </Flex>
                </form>
            )}
        </Form >
    )
};


export default MyForm;
