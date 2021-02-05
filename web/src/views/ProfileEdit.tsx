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
import ContactCard, { ContactDetails } from '../components/profileEdit/ContactCard';
import ContactCardEdit from '../components/profileEdit/ContactCardEdit';
import ProjectCard, { ProjectDetails } from '../components/profileEdit/ProjectCard';
import ProjectCardEdit from '../components/profileEdit/ProjectCardEdit';
import QuotaCard, { QuotaDetails } from '../components/profileEdit/QuotaCard';
import QuotaCardEdit from '../components/profileEdit/QuotaCardEdit';
import { PROFILE_EDIT_VIEW_NAMES, RESPONSE_STATUS_CODE, ROUTE_PATHS } from '../constants';
import useCommonState from '../hooks/useCommonState';
import useInterval from '../hooks/useInterval';
import useRegistryApi from '../hooks/useRegistryApi';
import theme from '../theme';
import { Namespace } from '../types';
import getProfileStatus from '../utils/getProfileStatus';
import { promptErrToastWithText } from '../utils/promptToastHelper';
import {
  getLicensePlate,
  getProfileContacts,
  getProfileMinistry,
  isProfileProvisioned
} from '../utils/transformDataHelper';

const txtForQuotaEdit =
  "All quota increase requests require Platform Services Team's approval. Please contact the Platform Admins (@cailey.jones, @patrick.simonian or @shelly.han) in RocketChat BEFORE submitting the request to provide justification for the increased need of Platform resources (i.e. historic data showing increased CPU/RAM consumption).";
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
  contactDetails: ContactDetails;
  quotaDetails: QuotaDetails;
}

const ProfileEdit: React.FC = (props: any) => {
  const {
    match: {
      params: { profileId, viewName },
    },
  } = props;

  const api = useRegistryApi();
  const { keycloak } = useKeycloak();
  const { setOpenBackdrop } = useCommonState();

  const [profileState, setProfileState] = useState<IProfileState>({
    baseData: {
      namespacesJson: [],
      ministryJson: [],
    },
    isProvisioned: false,
    hasPendingEdit: true,
    projectDetails: {},
    contactDetails: {},
    quotaDetails: {},
  });

  const [initialRender, setInitialRender] = useState(true);
  const [unauthorizedToAccess, setUnauthorizedToAccess] = useState(false);
  const [submitRefresh, setSubmitRefresh] = useState<any>(0);

  const handleSubmitRefresh = () => {
    setSubmitRefresh(submitRefresh + 1);
  };

  async function updateProfileState() {
    const namespaces = await api.getNamespacesByProfileId(profileId);
    const ministry = await api.getMinistry();
    const quotaOptions = await api.getQuotaOptionsByProfileId(profileId);
    const hasPendingEdit = await hasPendingEditRequest(api, profileId);

    const projectDetails = await api.getProfileByProfileId(profileId);
    projectDetails.data = {
      ...projectDetails.data,
      ...getProfileMinistry(ministry.data, projectDetails.data),
    };

    const contactDetails = await api.getContactsByProfileId(profileId);
    contactDetails.data = { ...getProfileContacts(contactDetails.data) };

    const quotaSize = namespaces.data.quota;

    setProfileState((profileState0: any) => ({
      ...profileState0,
      baseData: {
        namespacesJson: namespaces.data,
        ministryJson: ministry.data,
      },
      hasPendingEdit,
      isProvisioned: isProfileProvisioned(namespaces.data),
      projectDetails: projectDetails.data,
      contactDetails: contactDetails.data,
      quotaDetails: {
        licensePlate: getLicensePlate(namespaces.data),
        quotaSize,
        quotaOptions,
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
          promptErrToastWithText(err.message);
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
      title: 'Project Information',
      href: ROUTE_PATHS.PROFILE_EDIT.replace(':profileId', profileId).replace(
        ':viewName',
        PROFILE_EDIT_VIEW_NAMES.PROJECT,
      ),
      component: <ProjectCard projectDetails={profileState.projectDetails} />,
    },
    {
      title: 'Contact Information',
      href: ROUTE_PATHS.PROFILE_EDIT.replace(':profileId', profileId).replace(
        ':viewName',
        PROFILE_EDIT_VIEW_NAMES.CONTACT,
      ),
      component: <ContactCard contactDetails={profileState.contactDetails} />,
    },
    {
      title: 'Quota Information',
      href: ROUTE_PATHS.PROFILE_EDIT.replace(':profileId', profileId).replace(
        ':viewName',
        PROFILE_EDIT_VIEW_NAMES.QUOTA,
      ),
      component: <QuotaCard quotaDetails={profileState.quotaDetails} />,
    },
  ];

  if (viewName === PROFILE_EDIT_VIEW_NAMES.OVERVIEW) {
    return (
      <Box
        sx={{
          display: 'grid',
          gridGap: 4,
        }}
      >
        <ShadowBox p={5} style={{ position: 'relative' }}>
          <Text as="h1">{profileState.projectDetails.name}</Text>
          {cards.length > 0 &&
            cards.map((c: any, index: number) => (
              <Box key={index}>
                <Flex p={3} mt={4} bg={theme.colors.bcblue} style={{ position: 'relative' }}>
                  <Text as="h3" color={theme.colors.contrast} mx={2}>
                    {c.title}
                  </Text>
                  {!profileState.hasPendingEdit && profileState.isProvisioned && (
                    <RouterLink className="misc-class-m-dropdown-link" to={c.href}>
                      <Icon hover color="contrast" name="edit" width={1.5} height={1.5} />
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
    );
  }
  return (
    <>
      <Flex p={3} mt={4} bg={theme.colors.bcblue}>
        <RouterLink
          className="misc-class-m-dropdown-link"
          to={ROUTE_PATHS.PROFILE_EDIT.replace(':profileId', profileId).replace(
            ':viewName',
            PROFILE_EDIT_VIEW_NAMES.OVERVIEW,
          )}
        >
          <Icon hover color="contrast" name="goBack" width={1} height={1} />
        </RouterLink>
        <Text as="h3" color={theme.colors.contrast} mx={2}>
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
              />
            )}
            {viewName === PROFILE_EDIT_VIEW_NAMES.CONTACT && (
              <ContactCardEdit
                profileId={profileId}
                contactDetails={profileState.contactDetails}
                handleSubmitRefresh={handleSubmitRefresh}
                isProvisioned={profileState.isProvisioned}
                hasPendingEdit={profileState.hasPendingEdit}
              />
            )}
            {viewName === PROFILE_EDIT_VIEW_NAMES.QUOTA && (
              <QuotaCardEdit
                profileId={profileId}
                quotaDetails={profileState.quotaDetails}
                handleSubmitRefresh={handleSubmitRefresh}
                isProvisioned={profileState.isProvisioned}
                hasPendingEdit={profileState.hasPendingEdit}
              />
            )}
          </ShadowBox>
          {viewName === PROFILE_EDIT_VIEW_NAMES.QUOTA && (
            <Box p="30px" width={[1, 1, 1 / 3]}>
              <Text>{txtForQuotaEdit}</Text>
            </Box>
          )}
        </Flex>
      </ShadowBox>
    </>
  );
};

export default ProfileEdit;
