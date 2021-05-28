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
import React, { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Heading } from 'rebass';
import useCommonState from '../../hooks/useCommonState';
import { useModal } from '../../hooks/useModal';
import useRegistryApi from '../../hooks/useRegistryApi';
import { promptErrToastWithText } from '../../utils/promptToastHelper';
import { Modal } from '../common/modal/modal';
import Table from '../common/UI/Table';
import { ReviewRequestModal } from './ReviewRequestModal';

const ProjectRequests: React.FC<any> = (props) => {
  const { profileDetails } = props;

  const api = useRegistryApi();
  const { setOpenBackdrop } = useCommonState();

  const [profileId, setProfileId] = useState(0);
  const [requests, setRequests] = useState<any>([]);

  const [submitRefresh, setSubmitRefresh] = useState<any>(0);

  const handleSubmitRefresh = () => {
    setSubmitRefresh(submitRefresh + 1);
  };

  const requestColumns = useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'name',
        Cell: ({ row: { values } }: any) => (
          <RouterLink to={{ pathname: `/profile/${values.profileId}/overview` }}>
            {values.name}
          </RouterLink>
        ),
      },
      {
        Header: 'Ministry',
        accessor: 'busOrgId',
      },
      {
        Header: 'Product Owner',
        accessor: 'POEmail',
      },
      {
        Header: 'Technical Contact',
        accessor: 'TCEmail',
      },
      {
        Header: 'Request Type',
        accessor: 'type',
        Cell: ({ row: { values } }: any) => values.type,
      },
      {
        Header: 'Response',
        accessor: 'profileId',
        Cell: ({ row: { values } }: any) => (
          <Box>
            <button
              type="button"
              value={values.profileId}
              onClick={() => {
                setProfileId(values.profileId);
                toggle();
              }}
            >
              Review
            </button>
          </Box>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    async function wrap() {
      setOpenBackdrop(true);
      try {
        // Step 1: GET all active requests requiring human action
        const humanActionRequests = await api.getHumanActionRequests();

        // Step 2: Filter profiles that have outstanding requests requiring human action
        const results = profileDetails.filter((profile: any) =>
          humanActionRequests.data.some((request: any) => request.profileId === profile.id),
        );

        // Step 3: Combine request details with profile details for review modal
        const profileRequests = results.map((profile: any) => ({
          ...profile,
          ...humanActionRequests.data.find((request: any) => request.profileId === profile.id),
        }));
        setRequests(profileRequests);
      } catch (err) {
        promptErrToastWithText('Something went wrong');
        console.log(err);
      }
      setOpenBackdrop(false);
    }
    wrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileDetails, submitRefresh]);

  const { isShown, toggle } = useModal();

  return (
    <div>
      <Modal
        isShown={isShown}
        hide={toggle}
        headerText="Review"
        modalContent={
          <ReviewRequestModal
            profileId={profileId}
            profiles={requests}
            hide={toggle}
            handleSubmitRefresh={handleSubmitRefresh}
          />
        }
      />
      <Box style={{ overflow: 'auto' }}>
        <Heading>Project Requests</Heading>
        <Table columns={requestColumns} data={requests} />
      </Box>
    </div>
  );
};

export default ProjectRequests;
