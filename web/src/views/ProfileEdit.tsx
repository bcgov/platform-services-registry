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

import { useKeycloak } from '@react-keycloak/web';
import React, { useEffect, useState } from 'react';
import { Link as RouterLink, Redirect } from 'react-router-dom';
import { Box, Flex, Text } from 'rebass';
import Icon from '../components/common/UI/Icon';
import { ShadowBox } from '../components/common/UI/ShadowContainer';
import ContactCard from '../components/profileEdit/ContactCard';
import ContactCardEdit from '../components/profileEdit/ContactCardEdit';
import ProjectCard from '../components/profileEdit/ProjectCard';
import ProjectCardEdit from '../components/profileEdit/ProjectCardEdit';
import QuotaCard from '../components/profileEdit/QuotaCard';
import QuotaCardEdit from '../components/profileEdit/QuotaCardEdit';
import { PROFILE_EDIT_VIEW_NAMES, RESPONSE_STATUS_CODE, ROUTE_PATHS } from '../constants';
import useInterval from '../hooks/useInterval';
import useRegistryApi from '../hooks/useRegistryApi';
import theme from '../theme';
import { CNQuotaOptions, Namespace, QuotaSizeSet } from '../types';
import getProfileStatus from '../utils/getProfileStatus';
import { promptErrToastWithText } from '../utils/promptToastHelper';
import { getCurrentQuotaOptions, getCurrentQuotaSize, getLicensePlate, getProfileContacts, getProfileMinistry, isProfileProvisioned } from '../utils/transformDataHelper';
const txtForQuotaEdit = `All quota increase requests require Platform Services Team's approval. Please contact the Platform Admins (@cailey.jones, @patrick.simonian or @shelly.han) in RocketChat BEFORE submitting the request to provide justification for the increased need of Platform resources (i.e. historic data showing increased CPU/RAM consumption).`;

interface IProfileEditProps {
    openBackdropCB: () => void;
    closeBackdropCB: () => void;
};

const ProfileEdit: React.FC<IProfileEditProps> = (props) => {
    const api = useRegistryApi();
    const { keycloak } = useKeycloak();

    const profileStatus = getProfileStatus();

    // @ts-ignore
    const { match: { params: { profileId, viewName } }, openBackdropCB, closeBackdropCB } = props;

    const [initialRender, setInitialRender] = useState(true);
    const [unauthorizedToAccess, setUnauthorizedToAccess] = useState(false);
    const [profileJson, setProfileJson] = useState<any>({});
    const [contactJson, setContactJson] = useState<any>({});
    const [ministry, setMinistry] = useState<any>([]);
    const [provisionedStatus, setProvisionedStatus] = useState<any>();

    const [isProvisioned, setIsProvisioned] = useState<boolean>(false);
    const [namespacesJson, setNamespacesJson] = useState<Namespace[]>([]);
    const [quotaSize, setQuotaSize] = useState<QuotaSizeSet | ''>('');
    const [licensePlate, setLicensePlate] = useState<string>('');
    const [cnQuotaOptionsJson, setCnQuotaOptionsJson] = useState<CNQuotaOptions[]>([]);
    const [quotaOptions, setQuotaOptions] = useState<QuotaSizeSet[]>([]);
    const [quotaSubmitRefresh, setQuotaSubmitRefresh] = useState<any>(0);

    const [pendingEditRequest, setPendingEditRequest] = useState(true);

    const handleQuotaSubmitRefresh = () => {
        setQuotaSubmitRefresh(quotaSubmitRefresh + 1);
    };

    useEffect(() => {
        async function wrap() {
            openBackdropCB();
            try {
                const profileDetails = await api.getProfileByProfileId(profileId);
                const ministryDetails = await api.getMinistry();
                setMinistry(ministryDetails.data);

                profileDetails.data = { ...profileDetails.data, ...getProfileMinistry(ministryDetails.data, profileDetails.data) };
                setProfileJson(profileDetails.data);

                const contactDetails = await api.getContactsByProfileId(profileId);
                contactDetails.data = { ...getProfileContacts(contactDetails.data) };
                setContactJson(contactDetails.data);

                const namespaces = await api.getNamespacesByProfileId(profileId);
                const cnQuotaOptions = await api.getCNQuotaOptionsByProfileId(profileId);


                setIsProvisioned(isProfileProvisioned(namespaces.data));
                setNamespacesJson(namespaces.data);
                setCnQuotaOptionsJson(cnQuotaOptions.data);

                const isProvisioned = isProfileProvisioned(namespaces.data);
                setProvisionedStatus(isProvisioned);

                const isPendingEditRequest = await profileStatus.getPendingEditRequest(api, profileId)
                setPendingEditRequest(isPendingEditRequest);

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
    }, [keycloak]);

    useEffect(() => {
        async function wrap() {
            if (namespacesJson.length === 0 || cnQuotaOptionsJson.length === 0) { return; }
            try {
                // @ts-ignore
                setLicensePlate(getLicensePlate(namespacesJson));
                // @ts-ignore
                setQuotaSize(getCurrentQuotaSize(namespacesJson));
                // @ts-ignore
                setQuotaOptions(getCurrentQuotaOptions(cnQuotaOptionsJson, getCurrentQuotaSize(namespacesJson)));
            } catch (err) {
                promptErrToastWithText(err.message);
            }
        }
        wrap();
    }, [namespacesJson, cnQuotaOptionsJson, quotaSubmitRefresh]);

    useInterval(() => {
        async function wrap() {
            const isPendingEditRequest = await profileStatus.getPendingEditRequest(api, profileId)
            setPendingEditRequest(isPendingEditRequest);
        }
        wrap();
    }, 1000 * 30);

    if (initialRender) {
        return null;
    }

    if (unauthorizedToAccess) {
        return <Redirect to={ROUTE_PATHS.NOT_FOUND} />;
    }

    if (viewName === PROFILE_EDIT_VIEW_NAMES.OVERVIEW) {
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
                                {(pendingEditRequest === false) &&
                                    <RouterLink className='misc-class-m-dropdown-link' to={`/profile/${profileId}/project`}>
                                        <Icon hover color={'contrast'} name={'edit'} width={1.5} height={1.5} />
                                    </RouterLink>
                                }
                            </Flex>
                            <ShadowBox p={3} key={profileJson.id} style={{ position: 'relative' }}>
                                <ProjectCard title={profileJson.name} textBody={profileJson.description} ministry={profileJson.ministryName} />
                            </ShadowBox>
                        </Box>
                        <Box>
                            <Flex p={3} mt={4} bg={theme.colors.bcblue} style={{ position: 'relative' }}>
                                <Text as="h3" color={theme.colors.contrast} mx={2} >
                                    Contact Information
                            </Text>
                                {(pendingEditRequest === false) &&
                                    <RouterLink className='misc-class-m-dropdown-link' to={`/profile/${profileId}/contact`}>
                                        <Icon hover color={'contrast'} name={'edit'} width={1.5} height={1.5} />
                                    </RouterLink>
                                }
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
                                {(pendingEditRequest === false) &&
                                    <RouterLink className='misc-class-m-dropdown-link' to={`/profile/${profileId}/quota`}>
                                        <Icon hover color={'contrast'} name={'edit'} width={1.5} height={1.5} />
                                    </RouterLink>
                                }
                            </Flex>
                            <ShadowBox p={3} key={profileJson.id} style={{ position: 'relative' }}>
                                <QuotaCard licensePlate={licensePlate} quotaSize={quotaSize} />
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
                            {(viewName === PROFILE_EDIT_VIEW_NAMES.PROJECT) &&
                                <ProjectCardEdit
                                    profileDetails={profileJson}
                                    ministry={ministry}
                                    openBackdropCB={openBackdropCB}
                                    closeBackdropCB={closeBackdropCB}
                                />
                            }
                            {(viewName === PROFILE_EDIT_VIEW_NAMES.CONTACT) &&
                                <ContactCardEdit
                                    profileId={profileId}
                                    contactDetails={contactJson}
                                    pendingEditRequest={pendingEditRequest}
                                    isProvisioned={provisionedStatus}
                                    setPendingEditRequest={setPendingEditRequest}
                                    openBackdropCB={openBackdropCB}
                                    closeBackdropCB={closeBackdropCB}
                                />
                            }
                            {(viewName === PROFILE_EDIT_VIEW_NAMES.QUOTA) &&
                                <QuotaCardEdit
                                    licensePlate={licensePlate}
                                    quotaSize={quotaSize}
                                    profileId={profileId}
                                    quotaOptions={quotaOptions}
                                    cnQuotaOptionsJson={cnQuotaOptionsJson}
                                    openBackdropCB={openBackdropCB}
                                    closeBackdropCB={closeBackdropCB}
                                    handleQuotaSubmitRefresh={handleQuotaSubmitRefresh}
                                    isProvisioned={isProvisioned}
                                />
                            }
                        </ShadowBox>
                        {(viewName === PROFILE_EDIT_VIEW_NAMES.QUOTA) && (
                            <Box p={"30px"} width={[1, 1, 1 / 3]}>
                                <Text>{txtForQuotaEdit}</Text>
                            </Box>
                        )}
                    </Flex>
                </ShadowBox>
            </>
        );
    }
};

export default ProfileEdit;
