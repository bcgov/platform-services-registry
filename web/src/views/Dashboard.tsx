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
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

import React, { useEffect, useState } from 'react';
import { Box } from 'rebass';
import ProfileCard from '../components/ProfileCard';
import { ShadowBox } from '../components/UI/shadowContainer';
import useRegistryApi from '../utils/useRegistryApi';

export const Dashboard = () => {
  const api = useRegistryApi();

  const [profile, setProfile] = useState<any>([]);

  useEffect(() => {
    async function wrap() {
      const response = await api.getProfile();
      setProfile(response.data);
    }
    wrap();

    // eslint-disable-next-line
  }, []);

  return (
    <Box sx={{
      display: 'grid',
      gridGap: 4,
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    }}>
      {(profile.length > 0) && profile.map((s: any) => (
        <ShadowBox p={3} key={s.id}>
          <ProfileCard title={s.name} textBody={s.description} ministry={s.busOrgId} />
        </ShadowBox>
      ))}
    </Box>
  );
};