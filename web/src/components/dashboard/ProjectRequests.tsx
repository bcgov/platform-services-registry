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
import React, { useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Heading } from 'rebass';
import { useApproveRequestModal, useRejectRequestModal } from '../../hooks/useModal';
import { Modal } from '../common/modal/modal';
import Table from '../common/UI/Table';
import { ApproveRequestModal } from './ApproveRequestModal';
import { RejectRequestModal } from './RejectRequestModal';


const ProjectRequests: React.FC<any> = (props) => {
  const { profileDetails } = props  
  
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
        Header: 'Status',
        accessor: 'provisioned',
        Cell: ({ row: { values } }: any) => (values.provisioned ? 'Provisioned' : 'Pending'),
      },
      {
        Header: 'Response',
        accessor: 'id',
        Cell: ({ row: { values } }: any) => (
          <Box>
            <button value="test" onClick={toggleApproval}>
            Approve
          </button>
          <button value="test" onClick={toggleReject}>
            Reject
          </button>
          </Box>
        )
      },
    ],
    [],
  );

  const { isApprovalShown, toggleApproval } = useApproveRequestModal();
  const { isRejectShown, toggleReject } = useRejectRequestModal();

  const onConfirmApproval = () => toggleApproval();
  const onCancelApproval = () => toggleApproval();

  const onConfirmReject = () => toggleReject();
  const onCancelReject = () => toggleReject();

  return (
    <div>
      <Modal
        isShown={isApprovalShown}
        hide={toggleApproval}
        headerText='Confirmation'
        modalContent={
          <ApproveRequestModal 
            onConfirm={onConfirmApproval} 
            onCancel={onCancelApproval}
            message='Are you sure you want to approve this project request?'
          />
        }
      />
      <Modal
        isShown={isRejectShown}
        hide={toggleReject}
        headerText='Reject'
        modalContent={
          <RejectRequestModal 
            onConfirm={onConfirmReject} 
            onCancel={onCancelReject}
            message='Are you sure you want to reject this project request?'
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


export const approveRequest = (id: any) => {
  console.log(`Approve ${id}`);
}

export const rejectRequest = (id: any) => {
  console.log(`Reject ${id}`);
}
  
