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

import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Box } from 'rebass';
import ProfileCard from '../components/ProfileCard';
import { ShadowBox } from '../components/UI/shadowContainer';
import useRegistryApi from '../utils/useRegistryApi';

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

        // 2. Fetch contact info for each profile
        for (let profile of response.data) {
          const contactResponse = await api.getContactsByProfileId(profile.id);
          contactResponse.data.forEach((contact: any) => {
            if (contact.roleId === 1) {
              profile.POEmail = contact.email;
            }
            if (contact.roleId === 2) {
              profile.TCEmail = contact.email;
            }
          })
        }

        // 3. Then update dashboard cards with fetched profile info
        setProfile(response.data);
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

  return (
    <Box sx={{
      display: 'grid',
      gridGap: 4,
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    }}>
      {(profile.length > 0) && profile.map((s: any) => (
        <ShadowBox p={3} key={s.id}>
          <ProfileCard title={s.name} textBody={s.description} ministry={s.busOrgId} PO={s.POEmail} TC={s.TCEmail} />
        </ShadowBox>
      ))}
    </Box>
  );
};


export default Dashboard;