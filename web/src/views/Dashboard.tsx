//
// Copyright © 2020 Province of British Columbia
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,git
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

import { useKeycloak } from '@react-keycloak/web';
import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box } from 'rebass';
import { BackdropForPendingItem } from '../components/common/UI/Backdrop';
import { Button } from '../components/common/UI/Button';
import { ShadowBox } from '../components/common/UI/ShadowContainer';
import ProfileCard from '../components/dashboard/ProfileCard';
import { COMPONENT_METADATA, CSV_PROFILE_ATTRIBUTES } from '../constants';
import useCommonState from '../hooks/useCommonState';
import useInterval from '../hooks/useInterval';
import useRegistryApi from '../hooks/useRegistryApi';
import theme from '../theme';
import { promptErrToastWithText } from '../utils/promptToastHelper';
import {
  getCurrentQuotaSize,
  getProfileContacts,
  isProfileProvisioned,
  sortProfileByDatetime,
  transformJsonToCsv,
} from '../utils/transformDataHelper';

const Dashboard: React.FC = () => {
  const api = useRegistryApi();
  const { keycloak } = useKeycloak();
  const { setOpenBackdrop } = useCommonState();

  const [profile, setProfile] = useState<any>([]);

  useEffect(() => {
    async function wrap() {
      setOpenBackdrop(true);
      try {
        // 1. First fetch the list of profiles the user is entitled to see
        const response = await api.getProfile();

        // 2. Fetch contact and namespaces info for each profile
        const promisesForContact: any = [];
        const promisesForNamespaces: any = [];

        for (const p of response.data) {
          promisesForContact.push(api.getContactsByProfileId(p.id));
          promisesForNamespaces.push(api.getNamespaceByProfileId(p.id));
        }
        const contactResponses: Array<any> = await Promise.all(promisesForContact);
        const namespacesResponses: Array<any> = await Promise.all(promisesForNamespaces);

        // 3. Combine contact info, provision status and quota size to existing profile
        for (let i: number = 0; i < response.data.length; i++) {
          response.data[i] = {
            ...response.data[i],
            ...getProfileContacts(contactResponses[i].data),
          };
          response.data[i].provisioned = isProfileProvisioned(namespacesResponses[i].data);
          response.data[i].quotaSize = getCurrentQuotaSize(namespacesResponses[i].data);
        }

        // 4. Then update dashboard cards with fetched profile info
        setProfile(sortProfileByDatetime(response.data));
      } catch (err) {
        promptErrToastWithText('Something went wrong');
        console.log(err);
      }
      setOpenBackdrop(false);
    }
    wrap();
    // eslint-disable-next-line
  }, [keycloak]);

  useInterval(() => {
    const promisesForNamespaces: any = [];
    for (const p of profile) {
      promisesForNamespaces.push(api.getNamespaceByProfileId(p.id));
    }

    Promise.all(promisesForNamespaces).then((namespacesResponses: any) => {
      for (let i: number = 0; i < profile.length; i++) {
        profile[i].provisioned = isProfileProvisioned(namespacesResponses[i].data);
      }
      setProfile([...profile]);
    });
  }, 1000 * 30);

  const downloadCSV = () => {
    setOpenBackdrop(true);
    try {
      const metadataAttributes: Array<string> = [];
      COMPONENT_METADATA.forEach((m) => {
        metadataAttributes.push(m.inputValue);
      });

      const csvFilter = (obj: any) =>
        [...CSV_PROFILE_ATTRIBUTES, ...metadataAttributes].reduce(
          (acc, key) => ({
            ...acc,
            [key]: obj[key],
          }),
          {},
        );

      const csv = transformJsonToCsv(
        profile.filter((item: any) => item.provisioned === true).map(csvFilter),
      );
      window.open(`data:text/csv;charset=utf-8,${escape(csv)}`);
    } catch (err) {
      promptErrToastWithText('Something went wrong');
      console.log(err);
    }
    setOpenBackdrop(false);
  };

  return (
    <>
      {profile.length > 0 && <Button onClick={downloadCSV}>Download CSV</Button>}
      <Box
        sx={{
          display: 'grid',
          gridGap: 4,
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        }}
      >
        {profile.length > 0 &&
          profile.map((s: any) => (
            <ShadowBox p={3} key={s.id} style={{ position: 'relative' }}>
              <RouterLink
                to={{ pathname: `/profile/${s.id}/overview` }}
                style={{ color: theme.colors.black, textDecoration: 'none' }}
              >
                {!s.provisioned && <BackdropForPendingItem />}
                <ProfileCard
                  title={s.name}
                  textBody={s.description}
                  ministry={s.busOrgId}
                  PO={s.POEmail}
                  TC={s.TCEmail}
                  isProvisioned={s.provisioned}
                />
              </RouterLink>
            </ShadowBox>
          ))}
      </Box>
    </>
  );
};

export default Dashboard;
