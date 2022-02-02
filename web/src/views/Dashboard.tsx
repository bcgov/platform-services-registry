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
import ProjectDetails from '../components/dashboard/ProjectDetails';
import ProjectRequests from '../components/dashboard/ProjectRequests';
import useCommonState from '../hooks/useCommonState';
import useInterval from '../hooks/useInterval';
import useRegistryApi from '../hooks/useRegistryApi';
import getDecodedToken from '../utils/getDecodedToken';
import { promptErrToastWithText } from '../utils/promptToastHelper';

const Dashboard: React.FC = () => {
  const api = useRegistryApi();
  const { keycloak } = useKeycloak();
  const { setOpenBackdrop } = useCommonState();

  const [profileDetails, setProfileDetails] = useState<any>([]);

  const decodedToken = getDecodedToken(`${keycloak?.token}`);
  // @ts-ignore
  const userRoles = decodedToken.resource_access['registry-web']
    ? // @ts-ignore
      decodedToken.resource_access['registry-web'].roles
    : [];

  useEffect(() => {
    async function wrap() {
      setOpenBackdrop(true);
      try {
        const dashboardProjects = await api.getDashboardProjects();
        let profileDetailsArray: any;
        if (dashboardProjects.data) {
          profileDetailsArray = [...dashboardProjects.data];
        } else {
          profileDetailsArray = [];
        }
        setProfileDetails(profileDetailsArray);
      } catch (err) {
        promptErrToastWithText('Something went wrong');
        console.log(err);
      }
      setOpenBackdrop(false);
    }
    wrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keycloak]);

  useInterval(() => {
    async function verifyProjects() {
      const updatedProfiles = await api.getDashboardProjects();
      const updatedProfileDetailsArray = updatedProfiles.data ? [...updatedProfiles.data] : [];
      const profileChanged =
        JSON.stringify(updatedProfileDetailsArray) !== JSON.stringify(profileDetails);

      if (profileChanged) {
        setProfileDetails([...updatedProfileDetailsArray]);
      }
    }
    verifyProjects();
  }, 1000 * 30);


  return (
    <>
      {(userRoles.includes('administrator') || userRoles.includes('read_only_administrator')) && (
        <ProjectRequests
          profileDetails={profileDetails}
          isAdminUser={userRoles.includes('administrator')}
        />
      )}

      <ProjectDetails profileDetails={profileDetails} linkedRows={true} />
    </>
  );
};

export default Dashboard;
