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
import { promptErrToastWithText, promptSuccessToastWithText } from '../../utils/promptToastHelper';
import { Modal } from '../common/modal/modal';
import Table from '../common/UI/Table';
import { ReviewRequestModal } from './ReviewRequestModal';


const ProjectRequests: React.FC<any> = (props) => {
  const { profileDetails } = props  

  const api = useRegistryApi();
  const { setOpenBackdrop } = useCommonState();

  const [profileId, setProfileId ] = useState(0);
  
  const requestColumns = useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'name',
        Cell: ({ row: {values} }: any) => (<RouterLink to={{ pathname: `/profile/${values.id}/overview` }}>{values.name}</RouterLink>)
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
        accessor: 'provisioned',
        Cell: ({ row: { values } }: any) => (values.provisioned ? 'Provisioned' : 'Pending'),
      },
      {
        Header: 'Response',
        accessor: 'id',
        Cell: ({ row: { values } }: any) => (
          <Box>
            <button value={values.id} onClick={() => {
              setProfileId(values.id);
              toggle();
            }}>
              Review
            </button>
          </Box>
        )
      },
    ],
    [],
  );

  useEffect(() => {
    async function wrap() {
      setOpenBackdrop(true);
      try {
        console.log('entered')
        // 1. First fetch the list of profiles requiring human action
        const response = await api.getAllHumanActionRequest();
        console.log(response)
        // 2. Filter profileDetails by profiles in response
        
      } catch (err) {
        promptErrToastWithText('Something went wrong');
        console.log(err);
      }
      setOpenBackdrop(false);
    }
    wrap();
  }, []);

  const { isShown, toggle } = useModal();

  const onApprove = async () => {
    setOpenBackdrop(true);
    try {
      if (!profileId) {
        throw new Error('Unable to get profile id');
      }

      // // 1. Prepare quota edit request body.
      // const requestBody = {"type": "approval", "comment": "Temp"};

      // // 2. Request the profile quota edit.
      // await api.updateProjectRequest(String(profileId), requestBody);

      // 3. All good? Redirect back to overview and tell the user.
      promptSuccessToastWithText('The project approval was successful');
    } catch (err) {
      promptErrToastWithText(err.message);
      console.log(err);
    }
    setOpenBackdrop(false);
  }

  const onReject = () => toggle();

  return (
    <div>
      <Modal
        isShown={isShown}
        hide={toggle}
        headerText='Review'
        modalContent={
          <ReviewRequestModal 
            onApprove={onApprove} 
            onReject={onReject}
            message='Review the project request details'
          />
        }
      />
      <Box style={{ overflow: 'auto' }}>
        <Heading>Project Requests</Heading>
        <Table columns={requestColumns} data={profileDetails}/>
      </Box>
    </div>
  )
};

export default ProjectRequests;  
