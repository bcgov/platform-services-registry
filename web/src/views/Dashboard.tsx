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

import styled from '@emotion/styled';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Box } from 'rebass';
import ProfileCard from '../components/ProfileCard';
import { ShadowBox } from '../components/UI/shadowContainer';
import theme from '../theme';
import { getProfileContacts, isProfileProvisioned, sortProfileByDatetime } from '../utils/transformDataHelper';
import useInterval from '../utils/useInterval';
import useRegistryApi from '../utils/useRegistryApi';

const StyledBackdrop = styled.div`
  position:absolute;
  z-index: ${theme.zIndices[0]};
  top:0px;
  left:0px;
  width:100%;
  height:100%;
  background-color: white;
  opacity: 0.5;
`;

interface IDashboardProps {
  openBackdropCB: () => void;
  closeBackdropCB: () => void;
};

const Dashboard: React.FC<IDashboardProps> = (props) => {
  const { openBackdropCB, closeBackdropCB } = props;

  const api = useRegistryApi();

  const [profile, setProfile] = useState<any>([]);

  useEffect(() => {
    async function wrap() {
      openBackdropCB();
      try {
        // 1. First fetch the list of profiles the user is entitled to see
        const response = await api.getProfile();

        // 2. Fetch contact info and provision status for each profile
        const promisesForContact: any = [];
        const promisesForProvision: any = [];

        for (let profile of response.data) {
          promisesForContact.push(api.getContactsByProfileId(profile.id));
          promisesForProvision.push(api.getNamespaceByProfileId(profile.id));
        }
        const contactResponses: Array<any> = await Promise.all(promisesForContact);
        const provisionResponses: Array<any> = await Promise.all(promisesForProvision);

        // 3. Combine contact info and provision status to existing profile
        for (let i: number = 0; i < response.data.length; i++) {
          response.data[i] = { ...response.data[i], ...getProfileContacts(contactResponses[i].data) };
          response.data[i].provisioned = isProfileProvisioned(provisionResponses[i].data);
        }

        // 4. Then update dashboard cards with fetched profile info
        setProfile(sortProfileByDatetime(response.data));

        closeBackdropCB();
      } catch (err) {
        closeBackdropCB();
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
    }
    wrap();

    // eslint-disable-next-line
  }, []);

  // start polling for profile provision status changes every 30s
  useInterval(() => {
    const promisesForProvision: any = [];
    for (let p of profile) {
      promisesForProvision.push(api.getNamespaceByProfileId(p.id));
    }

    Promise.all(promisesForProvision)
      .then((provisionResponses: any) => {
        for (let i: number = 0; i < profile.length; i++) {
          profile[i].provisioned = isProfileProvisioned(provisionResponses[i].data);
        }
        setProfile([...profile]);
      })
  }, 1000 * 30);

  return (
    <Box sx={{
      display: 'grid',
      gridGap: 4,
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))'
    }}>
      {(profile.length > 0) && profile.map((s: any) => (
        <ShadowBox p={3} key={s.id} style={{ position: 'relative' }}>
          {!s.provisioned && <StyledBackdrop />}
          <ProfileCard title={s.name} textBody={s.description} ministry={s.busOrgId} PO={s.POEmail} TC={s.TCEmail} isProvisioned={s.provisioned} />
        </ShadowBox>
      ))}
    </Box>
  );
};


export default Dashboard;