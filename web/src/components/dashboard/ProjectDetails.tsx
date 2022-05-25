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

import React, { useMemo, useState } from 'react';
import { Box } from 'rebass';
import { convertSnakeCaseToSentence, parseEmails } from '../../utils/transformDataHelper';
import Table from '../common/UI/Table';
import { useHandleSort } from '../../hooks/useHandleSort';
import useRegistryApi from '../../hooks/useRegistryApi';
import { promptErrToastWithText } from '../../utils/promptToastHelper';

const ProjectDetails: React.FC<any> = (props) => {
  const { profileDetails } = props;
  const [data, setData] = useState([]);
  const api = useRegistryApi();

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
      {
        Header: 'License Plate',
        accessor: 'namespacePrefix',
      },
    ],
    [],
  );

  const csvData = async () => {
    try {
      const dashboardProjects = await api.getDashboardProjects();
      const updatedProfileDetailsArray = dashboardProjects.data ? dashboardProjects.data : [];

      return updatedProfileDetailsArray;
    } catch (err) {
      console.log(err);
      promptErrToastWithText(`${err}`);
    }
  };

  return (
    <>
      <Box>
        <Table
          columns={columns}
          data={data}
          linkedRows={true}
          title="Products"
          onSort={useHandleSort(setData, profileDetails).ourHandleSort}
          getCsvData={csvData}
        />
      </Box>
    </>
  );
};

export default ProjectDetails;
