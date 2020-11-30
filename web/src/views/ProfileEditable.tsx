//
// Copyright © 2020 Province of British Columbia
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

import React, { useEffect, useState } from 'react';
import { Link as RouterLink, Redirect } from 'react-router-dom';
import { Box, Flex, Text } from 'rebass';
import ContactCard from '../components/ContactCard';
import Icon from '../components/Icon';
import ProfileDetailCard from '../components/ProfileDetailCard';
import ProfileEditableContact from '../components/ProfileEditableContact';
import ProfileEditableProject from '../components/ProfileEditableProject';
import ProfileEditableQuota from '../components/ProfileEditableQuota';
import QuotaCard from '../components/QuotaCard';
import { ShadowBox } from '../components/UI/shadowContainer';
import { PROFILE_VIEW_NAMES, RESPONSE_STATUS_CODE, ROUTE_PATHS } from '../constants';
import theme from '../theme';
import { promptErrToastWithText } from '../utils/promptToastHelper';
import { getProfileContacts, getProfileMinistry } from '../utils/transformDataHelper';
import useRegistryApi from '../utils/useRegistryApi';

interface IProfileEditProps {
    openBackdropCB: () => void;
    closeBackdropCB: () => void;
};

const ProfileEdit: React.FC<IProfileEditProps> = (props) => {
    const api = useRegistryApi();
    // @ts-ignore
    const { match: { params: { profileId, viewName } }, openBackdropCB, closeBackdropCB } = props;

    const [initialRender, setInitialRender] = useState(true);
    const [unauthorizedToAccess, setUnauthorizedToAccess] = useState(false);
    const [profileJson, setProfileJson] = useState<any>({});
    const [contactJson, setContactJson] = useState<any>({});

    useEffect(() => {
        async function wrap() {
            openBackdropCB();
            try {
                const profileDetails = await api.getProfileByProfileId(profileId);
                const ministryDetails = await api.getMinistry();

                profileDetails.data = { ...profileDetails.data, ...getProfileMinistry(ministryDetails.data, profileDetails.data)};
                setProfileJson(profileDetails.data);

                const contactDetails = await api.getContactsByProfileId(profileId);
                contactDetails.data = { ...getProfileContacts(contactDetails.data) };
                setContactJson(contactDetails.data);
                console.log(contactDetails.data)

            } catch (err) {
                if (err.response && err.response.status && err.response.status === RESPONSE_STATUS_CODE.UNAUTHORIZED) {
                    setUnauthorizedToAccess(true);
                } else {
                    // when api returns 500 or queried profile entry does not exist
                    promptErrToastWithText('Something went wrong');
                }
            }
            setInitialRender(false);
            closeBackdropCB();
        }
        wrap();
        // eslint-disable-next-line
    }, []);

    if (initialRender) {
        return null;
    }

    if (unauthorizedToAccess) {
        return <Redirect to={ROUTE_PATHS.NOT_FOUND} />;
    }

    if (viewName === PROFILE_VIEW_NAMES.OVERVIEW) {
        return (
            <>
            <Box sx={{
                display: 'grid',
                gridGap: 4
              }}>
                <ShadowBox p={5} style={{ position: 'relative' }}>
                    <Text as="h1">
                    {profileJson.name}
                    </Text>
                    <Box>
                        <Flex p={3} mt={4} bg={theme.colors.bcblue} style={{ position: 'relative' }}>
                            <Text as="h3" color={theme.colors.contrast} mx={2} >
                                Project Information
                            </Text>
                            <RouterLink className='misc-class-m-dropdown-link' to={`/profile/${profileId}/project`}>
                                <Icon hover color={'contrast'} name={'edit'} width={1.5} height={1.5} />
                            </RouterLink>
                        </Flex>
                        <ShadowBox p={3} key={profileJson.id} style={{ position: 'relative' }}>
                            <ProfileDetailCard title={profileJson.name} textBody={profileJson.description} ministry={profileJson.ministryName} />
                        </ShadowBox> 
                    </Box>
                    <Box>
                        <Flex p={3} mt={4} bg={theme.colors.bcblue} style={{ position: 'relative' }}>
                            <Text as="h3" color={theme.colors.contrast} mx={2} >
                                Contact Information
                            </Text>
                        </Flex>
                        <ShadowBox p={3} key={contactJson.id} style={{ position: 'relative' }}>
                            <ContactCard POName={contactJson.POName} POEmail={contactJson.POEmail} POGithubId={contactJson.POGithubId} TCName={contactJson.TCName} TCEmail={contactJson.TCEmail} TCGithubId={contactJson.TCGithubId} />
                        </ShadowBox> 
                    </Box>
                    <Box>
                        <Flex p={3} mt={4} bg={theme.colors.bcblue} style={{ position: 'relative' }}>
                            <Text as="h3" color={theme.colors.contrast} mx={2} >
                                Quota Information
                            </Text>
                            <RouterLink className='misc-class-m-dropdown-link' to={`/profile/${profileId}/quota`}>
                                <Icon hover color={'contrast'} name={'edit'} width={1.5} height={1.5} />
                            </RouterLink>
                        </Flex>
                        <ShadowBox p={3} key={profileJson.id} style={{ position: 'relative' }}>
                            <QuotaCard />
                        </ShadowBox> 
                    </Box>
                </ShadowBox>
            </Box>
            </>
        );
    } else {
        return (
            <>
            <Flex p={3} mt={4} bg={theme.colors.bcblue}>
                        <RouterLink className='misc-class-m-dropdown-link' to={`/profile/${profileId}/overview`}>
                            <Icon hover color={'contrast'} name={'goBack'} width={1} height={1} />
                        </RouterLink>
                        <Text as="h3" color={theme.colors.contrast} mx={2} >
                            {(viewName)}
                        </Text>
                </Flex>
                <ShadowBox p={3}>
                    <Flex flexWrap='wrap' m={3}>
                        <ShadowBox p="24px" mt="0px" px={["24px", "24px", "70px"]} >
                            {(viewName === PROFILE_VIEW_NAMES.PROJECT) && <ProfileEditableProject/>}
                            {(viewName === PROFILE_VIEW_NAMES.CONTACT) && <ProfileEditableContact/>}
                            {(viewName === PROFILE_VIEW_NAMES.QUOTA) && <ProfileEditableQuota />}
                        </ShadowBox>
                    </Flex>
                </ShadowBox>
            </>
        );
    }
};

export default ProfileEdit;
