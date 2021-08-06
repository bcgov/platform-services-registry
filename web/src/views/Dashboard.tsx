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
import React, { useEffect, useMemo, useState } from 'react';
import { Box, Heading } from 'rebass';
import mockProfiles from '../../src/__tests__/fixtures/profiles.json';
import { Button } from '../components/common/UI/Button';
import Table from '../components/common/UI/Table';
import ProjectRequests from '../components/dashboard/ProjectRequests';
import { CREATE_COMMUNITY_ISSUE_URL } from '../constants';
import useCommonState from '../hooks/useCommonState';
import useRegistryApi from '../hooks/useRegistryApi';
import getDecodedToken from '../utils/getDecodedToken';
import { promptErrToastWithText } from '../utils/promptToastHelper';
import {
  convertSnakeCaseToSentence,
  flatten,
  parseEmails,
  transformJsonToCsv
} from '../utils/transformDataHelper';

const Dashboard: React.FC = () => {
  const api = useRegistryApi();
  const { keycloak } = useKeycloak();
  const { setOpenBackdrop } = useCommonState();

  const [profileDetails, setProfileDetails] = useState<any>([]);
  const [tableView, setTableView] = useState(true);

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
        const profileDetailsArray = [...dashboardProjects.data.profiles];
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

  // useInterval(() => {
  //   const promisesForNamespaces: any = [];
  //   for (const p of profile) {
  //     promisesForNamespaces.push(api.getNamespacesByProfileId(p.id));
  //   }

  //   Promise.all(promisesForNamespaces).then((namespacesResponses: any) => {
  //     for (let i: number = 0; i < profile.length; i++) {
  //       profile[i].provisioned = isProfileProvisioned(profile[i], namespacesResponses[i].data);
  //     }
  //     setProfile([...profile]);
  //   });
  // }, 1000 * 30);

  const downloadCSV = () => {
    setOpenBackdrop(true);
    try {
      const flattened = mockProfiles.map((profile: any) => flatten(profile));
      const csv = transformJsonToCsv(flattened);
      window.open(`data:text/csv;charset=utf-8,${escape(csv)}`);
    } catch (err) {
      promptErrToastWithText('Something went wrong');
      console.log(err);
    }
    setOpenBackdrop(false);
  };

  const toggleView = () => {
    setTableView(!tableView);
  };

  const columns = useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'name',
      },
      {
        Header: 'Description',
        accessor: 'description',
      },
      {
        Header: 'Ministry',
        accessor: 'ministry',
      },
      {
        Header: 'Cluster',
        accessor: 'clusters',
        Cell: ({ cell: { value } }: any) => value.join(', '),
      },
      {
        Header: 'Product Owner',
        accessor: 'productOwners',
        Cell: ({ cell: { value } }: any) => parseEmails(value),
      },
      {
        Header: 'Technical Lead(s)',
        accessor: 'technicalLeads',
        Cell: ({ cell: { value } }: any) => parseEmails(value),
      },
      {
        Header: 'Status',
        accessor: 'profileStatus',
        Cell: ({ cell: { value } }: any) => convertSnakeCaseToSentence(value),
      },
    ],
    [],
  );

  return (
    <>
      {profileDetails.length > 0 && <Button onClick={downloadCSV}>Download CSV</Button>}
      <Button onClick={toggleView}>{tableView ? 'Card View' : 'Table View'} </Button>
      <Button
        onClick={() => {
          window.open(CREATE_COMMUNITY_ISSUE_URL, '_blank');
        }}
      >
        Report a bug/Request a feature
      </Button>

      {userRoles.includes('administrator') ? (
        <ProjectRequests profileDetails={profileDetails} />
      ) : (
        ''
      )}

      {tableView ? (
        <Box style={{ overflow: 'auto' }}>
          <Heading>Projects</Heading>
          <Table columns={columns} data={profileDetails} linkedRows={true} />
        </Box>
      ) : (
        <div>
          {/* Project Cards */}
          {/* <Box
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
          </Box> */}
        </div>
      )}
    </>
  );
};

export default Dashboard;
