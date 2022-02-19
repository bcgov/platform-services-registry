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

import styled from '@emotion/styled';
import { useKeycloak } from '@react-keycloak/web';
import React, { useEffect, useState } from 'react';
import { Link as RouterLink, Redirect } from 'react-router-dom';
import { Box, Flex, Text } from 'rebass';
import { faArrowLeft, faPen } from '@fortawesome/free-solid-svg-icons';
import { getLicencePlatePostFix } from '../utils/utils';
import { useQuery } from '../utils/AppRoute';
import { ShadowBox } from '../components/common/UI/ShadowContainer';
import ContactCard, { ContactDetails } from '../components/profileEdit/ContactCard';
import ContactCardEdit from '../components/profileEdit/ContactCardEdit';
import ProjectCard, { ProjectDetails } from '../components/profileEdit/ProjectCard';
import ProjectCardEdit from '../components/profileEdit/ProjectCardEdit';
import QuotaCard, {
  QuotaDetails,
  NAMESPACE_DEFAULT_QUOTA,
} from '../components/profileEdit/QuotaCard';
import { QuotaCardEdit } from '../components/profileEdit/QuotaCardEdit';
import { BaseIcon } from '../components/common/UI/Icon';
import {
  HOME_PAGE_URL,
  PROFILE_EDIT_VIEW_NAMES,
  RESPONSE_STATUS_CODE,
  ROUTE_PATHS,
} from '../constants';
import useCommonState from '../hooks/useCommonState';
import useInterval from '../hooks/useInterval';
import useRegistryApi from '../hooks/useRegistryApi';
import theme from '../theme';
import { Namespace, NamespaceQuotaOption } from '../types';
import getProfileStatus from '../utils/getProfileStatus';
import { promptErrToastWithText } from '../utils/promptToastHelper';
import {
  getClusterDisplayName,
  getLicensePlate,
  getProfileMinistry,
  isProfileProvisioned,
  sortContacts,
} from '../utils/transformDataHelper';

const StyledDiv = styled.div`
  min-width: 80%;
  margin-left: clamp(10px, ${theme.spacingIncrements[1]});
  margin-right: clamp(10px, ${theme.spacingIncrements[1]});
`;

const { hasPendingEditRequest } = getProfileStatus();

export interface BaseData {
  namespacesJson: Namespace[];
  ministryJson: any[];
}

interface IProfileState {
  baseData: BaseData;
  isProvisioned: boolean;
  hasPendingEdit: boolean;
  projectDetails: ProjectDetails;
  contactDetails: ContactDetails[];
  quotaDetails: QuotaDetails;
}

const ProfileEdit: React.FC = (props: any) => {
  const {
    match: {
      params: { profileId, viewName },
    },
  } = props;

  const DEFAULT_NAMESPACE_ALLOWED_QUOTA_SIZE: NamespaceQuotaOption = {
    quotaCpuSize: [],
    quotaMemorySize: [],
    quotaStorageSize: [],
    quotaSnapshotSize: [],
  };
  const PROJECT_SET = ['prod', 'test', 'dev', 'tools'];
  const namespaceSearchQuery = useQuery().get('namespace') || '';
  const api = useRegistryApi();
  const { keycloak } = useKeycloak();
  const { setOpenBackdrop } = useCommonState();

  const [isEditDisabled, setIsEditDisabled] = useState(true);

  const [profileState, setProfileState] = useState<IProfileState>({
    baseData: {
      namespacesJson: [],
      ministryJson: [],
    },
    isProvisioned: false,
    hasPendingEdit: true,
    projectDetails: {},
    contactDetails: [],
    quotaDetails: {
      quotaSize: {
        dev: NAMESPACE_DEFAULT_QUOTA,
        test: NAMESPACE_DEFAULT_QUOTA,
        tools: NAMESPACE_DEFAULT_QUOTA,
        prod: NAMESPACE_DEFAULT_QUOTA,
      },
      quotaOptions: DEFAULT_NAMESPACE_ALLOWED_QUOTA_SIZE,
    },
  });

  useEffect(() => {
    async function projectBelongToUser() {
      try {
        const data = await keycloak?.loadUserProfile();
        const userEmail = data?.email;

        if (typeof userEmail !== 'undefined') {
          const contactEmails = profileState.contactDetails.map((contact) => contact.email);
          setIsEditDisabled(!contactEmails.includes(userEmail));
        }
      } catch (err) {
        console.log(err);
      }
    }

    if (profileState.hasOwnProperty('contactDetails') && profileState.contactDetails.length > 0) {
      projectBelongToUser();
    }
  }, [profileState]);

  const [initialRender, setInitialRender] = useState(true);
  const [unauthorizedToAccess, setUnauthorizedToAccess] = useState(false);
  const [submitRefresh, setSubmitRefresh] = useState<any>(0);
  const editNamespace = getLicencePlatePostFix(
    namespaceSearchQuery,
  ) as keyof typeof profileState.quotaDetails.quotaSize;

  const handleSubmitRefresh = () => {
    setSubmitRefresh(submitRefresh + 1);
  };

  async function updateProfileState() {
    const namespaces = await api.getNamespacesByProfileId(profileId);
    const ministry = await api.getMinistry();
    const cluster = await api.getCluster();
    const hasPendingEdit = await hasPendingEditRequest(api, profileId);

    const projectDetails = await api.getProfileByProfileId(profileId);
    projectDetails.data = {
      ...projectDetails.data,
      ...getProfileMinistry(ministry.data, projectDetails.data),
      primaryClusterDisplayName: getClusterDisplayName(
        projectDetails.data.primaryClusterName,
        cluster.data,
      ),
    };
    const contactDetails = await api.getContactsByProfileId(profileId);

    const quotaOptions = await api.getAllAvailableQuotaSize();

    const quotaSize = await api.getQuotaSizeByProfileId(profileId);

    setProfileState((profileState0: any) => ({
      ...profileState0,
      baseData: {
        namespacesJson: namespaces.data,
        ministryJson: ministry.data,
      },
      hasPendingEdit,
      isProvisioned: isProfileProvisioned(projectDetails.data, namespaces.data),
      projectDetails: projectDetails.data,
      contactDetails: sortContacts(contactDetails.data),
      quotaDetails: {
        licensePlate: getLicensePlate(namespaces.data),
        quotaSize: quotaSize.data,
        quotaOptions: quotaOptions.data,
      },
    }));
  }

  useEffect(() => {
    async function wrap() {
      setOpenBackdrop(true);
      try {
        await updateProfileState();
      } catch (err) {
        if (
          err.response &&
          err.response.status &&
          err.response.status === RESPONSE_STATUS_CODE.UNAUTHORIZED
        ) {
          setUnauthorizedToAccess(true);
        } else {
          // when api returns 500 or queried profileState entry does not exist
          promptErrToastWithText('Something went wrong');
        }
      }
      setInitialRender(false);
      setOpenBackdrop(false);
    }
    wrap();
    // eslint-disable-next-line
  }, [keycloak, submitRefresh]);

  useInterval(() => {
    async function wrap() {
      try {
        await updateProfileState();
      } catch (err) {
        const msg = 'Unable to update Profile State';
        throw new Error(`${msg}, reason = ${err.message}`);
      }
    }
    wrap();
  }, 1000 * 30);

  if (initialRender) {
    return null;
  }

  if (unauthorizedToAccess) {
    return <Redirect to={ROUTE_PATHS.NOT_FOUND} />;
  }

  const cards = [
    {
      name: 'project',
      title: 'Project Information',
      href: ROUTE_PATHS.PROFILE_EDIT.replace(':profileId', profileId).replace(
        ':viewName',
        PROFILE_EDIT_VIEW_NAMES.PROJECT,
      ),
      component: <ProjectCard projectDetails={profileState.projectDetails} />,
    },
    {
      name: 'contact',
      title: 'Contact Information',
      href: ROUTE_PATHS.PROFILE_EDIT.replace(':profileId', profileId).replace(
        ':viewName',
        PROFILE_EDIT_VIEW_NAMES.CONTACT,
      ),
      component: <ContactCard contactDetails={profileState.contactDetails} />,
    },
    {
      name: 'quota',
      title: 'Quota Information',

      component: (
        <QuotaCard
          quotaDetails={profileState.quotaDetails}
          href={ROUTE_PATHS.PROFILE_EDIT.replace(':profileId', profileId).replace(
            ':viewName',
            PROFILE_EDIT_VIEW_NAMES.QUOTA,
          )}
        />
      ),
    },
  ];

  if (viewName === PROFILE_EDIT_VIEW_NAMES.OVERVIEW) {
    return (
      <StyledDiv>
        <Box
          sx={{
            display: 'grid',
            gridGap: 4,
          }}
        >
          <ShadowBox p={5} style={{ position: 'relative' }}>
            <Flex>
              <Box my="auto">
                <RouterLink className="misc-class-m-dropdown-link" to={HOME_PAGE_URL}>
                  <BaseIcon
                    name="goBack"
                    color="black"
                    hover
                    width={1.5}
                    height={1.5}
                    displayIcon={faArrowLeft}
                  />
                </RouterLink>
              </Box>
              <Text as="h1" mx={2}>
                {profileState.projectDetails.name}
              </Text>
            </Flex>
            {cards.length > 0 &&
              cards.map((c: any, index: number) => (
                <Box key={index}>
                  <Flex p={3} mt={4} bg={theme.colors.bcblue} style={{ position: 'relative' }}>
                    <Text as="h3" color={theme.colors.contrast} mx={2}>
                      {c.title}
                    </Text>
                    {c.name !== 'quota' && (
                      <RouterLink className="misc-class-m-dropdown-link" to={c.href}>
                        <BaseIcon
                          name="edit"
                          color="contrast"
                          hover
                          width={1.5}
                          height={1.5}
                          displayIcon={faPen}
                        />
                      </RouterLink>
                    )}
                  </Flex>
                  <ShadowBox p={3} key={profileId} style={{ position: 'relative' }}>
                    {c.component}
                  </ShadowBox>
                </Box>
              ))}
          </ShadowBox>
        </Box>
      </StyledDiv>
    );
  }
  return (
    <StyledDiv>
      <Flex p={3} mt={4} bg={theme.colors.bcblue}>
        <RouterLink
          className="misc-class-m-dropdown-link"
          to={ROUTE_PATHS.PROFILE_EDIT.replace(':profileId', profileId).replace(
            ':viewName',
            PROFILE_EDIT_VIEW_NAMES.OVERVIEW,
          )}
        >
          <BaseIcon
            name="goBack"
            color="contrast"
            hover
            width={1.5}
            height={1.5}
            displayIcon={faArrowLeft}
          />
        </RouterLink>
        <Text as="h3" color={theme.colors.contrast} mx={2} sx={{ textTransform: 'capitalize' }}>
          {viewName}
        </Text>
      </Flex>
      <ShadowBox p={3}>
        <Flex flexWrap="wrap" m={3}>
          <ShadowBox p="24px" mt="0px" px={['24px', '24px', '70px']}>
            {viewName === PROFILE_EDIT_VIEW_NAMES.PROJECT && (
              <ProjectCardEdit
                projectDetails={profileState.projectDetails}
                ministry={profileState.baseData.ministryJson}
                handleSubmitRefresh={handleSubmitRefresh}
                isProvisioned={profileState.isProvisioned}
                hasPendingEdit={profileState.hasPendingEdit}
                isDisabled={isEditDisabled}
              />
            )}
            {viewName === PROFILE_EDIT_VIEW_NAMES.CONTACT && (
              <ContactCardEdit
                profileId={profileId}
                contactDetails={profileState.contactDetails}
                handleSubmitRefresh={handleSubmitRefresh}
                isProvisioned={profileState.isProvisioned}
                hasPendingEdit={profileState.hasPendingEdit}
                isDisabled={isEditDisabled}
              />
            )}

            {viewName === PROFILE_EDIT_VIEW_NAMES.QUOTA && PROJECT_SET.includes(editNamespace) && (
              <QuotaCardEdit
                profileId={profileId}
                licensePlate={profileState.quotaDetails.licensePlate || ''}
                quotaOptions={
                  profileState.quotaDetails.quotaOptions || DEFAULT_NAMESPACE_ALLOWED_QUOTA_SIZE
                }
                quotaSize={
                  profileState.quotaDetails.quotaSize[editNamespace] || NAMESPACE_DEFAULT_QUOTA
                }
                handleSubmitRefresh={handleSubmitRefresh}
                isProvisioned={profileState.isProvisioned}
                hasPendingEdit={profileState.hasPendingEdit}
                namespace={namespaceSearchQuery}
                primaryClusterName={profileState.projectDetails?.primaryClusterName || ''}
                isDisabled={isEditDisabled}
              />
            )}
          </ShadowBox>
        </Flex>
      </ShadowBox>
    </StyledDiv>
  );
};

export default ProfileEdit;
