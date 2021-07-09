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
import { Box } from 'rebass';
import Table from '../common/UI/Table';

const ProjectRequests: React.FC<any> = (props) => {
  const { profileDetails } = props;
  /* 
    - Columns is a simple array right now, but it will contain some logic later on. It is recommended by react-table to memoize the columns data
    - Here in this example, we have grouped our columns into two headers. react-table is flexible enough to create grouped table headers
  */
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
          accessor: 'busOrgId',
        },
        {
          Header: 'Cluster',
          accessor: 'primaryClusterDisplayName',
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
          Header: 'Namespace',
          accessor: 'namespacePrefix',
        },
        {
          Header: 'Quota',
          accessor: 'quotaSize',
        },
      ],
      [],
    );

  return (
    <div>
      <Box style={{ overflow: 'auto' }}>
        <Table columns={columns} data={profileDetails} linkedRows={true} title="Projects" />
      </Box>
    </div>
  );
};

export default ProjectRequests;
