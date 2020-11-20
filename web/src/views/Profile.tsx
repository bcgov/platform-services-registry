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
import { Box, Text } from 'rebass';
import ContactCard from '../components/ContactCard';
import Icon from '../components/Icon';
import ProjectCard from '../components/ProjectCard';
import { ShadowBox } from '../components/UI/shadowContainer';
import theme from '../theme';
import { promptErrToastWithText } from '../utils/promptToastHelper';
import { getProfileContacts, sortProfileByDatetime } from '../utils/transformDataHelper';
import useRegistryApi from '../utils/useRegistryApi';

interface IProfileViewProps {
  openBackdropCB: () => void;
  closeBackdropCB: () => void;
};

const ProfileView: React.FC<IProfileViewProps> = (props) => {
  const { openBackdropCB, closeBackdropCB } = props;

  const api = useRegistryApi();

  const [profile, setProfile] = useState<any>([]);

  useEffect(() => {
    async function wrap() {
      openBackdropCB();
      try {
        // 1. First fetch the list of profiles the user is entitled to see
        // TODO: Make profile id dynamic
        const response = await api.getProfileByProfileId('169');
        const contactDetails = await api.getContactsByProfileId('169')

        // 3. Combine contact info and provision status to existing profile
        response.data = { ...response.data, ...getProfileContacts(contactDetails.data) };
        console.log(response.data);
        

        // 4. Then update dashboard cards with fetched profile info
        setProfile(sortProfileByDatetime(response.data));
      } catch (err) {
        promptErrToastWithText('Something went wrong');
        console.log(err);
      }
      closeBackdropCB();
    }
    wrap();
    // eslint-disable-next-line
  }, []);

  return (
    <>

    <Box sx={{
        display: 'grid',
        gridGap: 4
      }}>
        <ShadowBox p={5} style={{ position: 'relative' }}>
            <Text as="h1">
            {profile.name}
            </Text>
      <Box>
        <Box p={3} mt={4} bg={theme.colors.bcblue} style={{ position: 'relative' }}>
            <Text as="h3" color={theme.colors.contrast}>Project Information <Icon hover color={'contrast'} name={'edit'} width={1} height={1} /></Text>
        </Box>
       <ShadowBox p={3} key={profile.id} style={{ position: 'relative' }}>
        <ProjectCard title={profile.name} textBody={profile.description} ministry={profile.busOrgId} />
        </ShadowBox> 
      </Box>
      <Box>
        <ShadowBox p={3} mt={4} bg={theme.colors.bcblue} style={{ position: 'relative' }}>
            <Text as="h3" color={theme.colors.contrast}>Contact Information <Icon hover color={'contrast'} name={'edit'} width={1} height={1} /></Text>
            
        </ShadowBox>
        <ShadowBox p={3} key={profile.id} style={{ position: 'relative' }}>
        <ContactCard POName={profile.POName} POEmail={profile.POEmail} TCName={profile.TCName} TCEmail={profile.TCEmail} />
        </ShadowBox> 
      </Box>
    </ShadowBox>
    </Box>
    </>
  );
};


export default ProfileView;