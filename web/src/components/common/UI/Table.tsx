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

import styled from '@emotion/styled';
import { Input } from '@rebass/forms';
import React, { useCallback, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useAsyncDebounce, useFilters, useGlobalFilter, useSortBy, useTable } from 'react-table';
import { Box, Flex, Heading } from 'rebass';
import useCommonState from '../../../hooks/useCommonState';
import useComponentVisible from '../../../hooks/useComponentVisible';
import theme from '../../../theme';
import { promptErrToastWithText } from '../../../utils/promptToastHelper';
import { flatten, transformJsonToCsv } from '../../../utils/transformDataHelper';
import Icon from './Icon';
import Tooltip from './Tooltip';

interface ITableProps {
  columns: any;
  data: Object[];
  linkedRows?: boolean;
  title: string;
  onSort: any;
}

const Styles = styled.div`
  padding: 1rem;

  table {
    border-spacing: 0;
    border: 1px solid black;

    tr {
      :last-of-type {
        td {
          border-bottom: 0;
        }
      }

      :nth-of-type(even) {
        background-color: #f2f2f2;
      }

      :hover {
        background-color: #ddd;
        cursor: pointer;
      }
    }
    th {
      background-color: ${theme.colors.bcblue};
      color: ${theme.colors.contrast};
      text-align: center;
      min-width: 9em;
    }
    th,
    td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;

      :last-of-type {
        border-right: 0;
      }
    }
  }

  /* thanks to: https://css-tricks.com/responsive-data-tables/ */
  @media screen and (max-width: 52em) {
    /* Force table to not be like tables anymore */
    table,
    thead,
    tbody,
    th,
    td,
    tr {
      display: block;
    }

    /* Hide table headers (but not display: none;, for accessibility) */
    thead tr {
      position: absolute;
      top: -9999px;
      left: -9999px;
    }

    tbody tr {
      border-bottom: 1px solid black;
    }

    td {
      /* Behave like a "row" */
      border: none !important;
      position: relative;
      padding-left: calc(30% + 10px) !important;
      text-align: left !important;
      white-space: pre-wrap;
      overflow-wrap: break-word;
    }

    td:before {
      /* Now like a table header */
      position: absolute;
      display: block;

      /* Top/left values mimic padding */
      left: 1rem;
      width: 30%;
      white-space: pre-wrap;
      overflow-wrap: break-word;
      text-align: left !important;
      font-weight: 600;
    }
    /*
	Label the data, hard coded for now.
  TODO (sb): dynamically link the column heading to these Row titles
	*/
    td:nth-of-type(1):before {
      content: 'Project Name';
    }
    td:nth-of-type(2):before {
      content: 'Description';
    }
    td:nth-of-type(3):before {
      content: 'Ministry';
    }
    td:nth-of-type(4):before {
      content: 'Cluster';
    }
    td:nth-of-type(5):before {
      content: 'Product Owner';
    }
    td:nth-of-type(6):before {
      content: 'Technical Contact';
    }
    td:nth-of-type(7):before {
      content: 'Status';
    }
  }
`;

// Define a default UI for filtering
const GlobalFilter: React.FC<any> = ({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter,
}: any) => {
  const count = preGlobalFilteredRows.length;
  const [value, setValue] = React.useState(globalFilter);
  const onChange = useAsyncDebounce((filterValue) => {
    setGlobalFilter(filterValue || undefined);
  }, 200);

  return (
    <Flex flexDirection="row">
      <Input
        value={value || ''}
        onChange={(e) => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
        placeholder={`${count} records...`}
        autoFocus={true}
        sx={{ textTransform: 'none' }}
      />
    </Flex>
  );
};

// Define a default UI for filtering
const ColumnFilter: React.FC<any> = ({ allColumns }: any) => {
  const { ref, isComponentVisible, setIsComponentVisible } = useComponentVisible(false);
  const handleOpenColumn = () => {
    setIsComponentVisible(!isComponentVisible);
  };

  const DropDownContainer = styled('div')``;

  const DropDownHeader = styled('div')``;

  const DropDownListContainer = styled('div')``;

  const DropDownList = styled('ul')`
    padding: 0;
    margin: 0;
    padding: 0.5em;
    background: #ffffff;
    border: 2px solid #e5e5e5;
    box-sizing: border-box;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    position: absolute;
    right: 100px;
    z-index: 5;
  `;

  const ListItem = styled('li')`
    list-style: none;
    margin: 0.5em;
  `;

  return (
    <>
      <DropDownContainer>
        <DropDownHeader onClick={handleOpenColumn}>
          <Tooltip text="Select Columns">
            {isComponentVisible ? (
              <Icon
                hover
                color="primary"
                name="close"
                style={{ margin: '14px 5px 5px' }}
                width={1.4}
                height={1.4}
              />
            ) : (
              <Icon
                hover
                color="primary"
                name="menuStack"
                width={1.4}
                height={1.4}
                style={{ margin: '14px 5px 5px', transform: 'rotate(90deg)' }}
              />
            )}
          </Tooltip>
        </DropDownHeader>
        {isComponentVisible && (
          <DropDownListContainer ref={ref}>
            <DropDownList>
              {allColumns.map((column: any) => (
                <ListItem onClick={() => column.toggleHidden()} key={column.id}>
                  {column.Header}{' '}
                  {column.isVisible && <Icon hover color="primary" name="checkmark" />}
                </ListItem>
              ))}
            </DropDownList>
          </DropDownListContainer>
        )}
      </DropDownContainer>
    </>
  );
};

const Table: React.FC<ITableProps> = (props) => {
  const { columns, data, linkedRows, title, onSort } = props;
  const { setOpenBackdrop } = useCommonState();

  const downloadCSV = () => {
    setOpenBackdrop(true);
    try {
      const flattened = data.map((profile: any) => flatten(profile));
      const csv = transformJsonToCsv(flattened);
      window.open(`data:text/csv;charset=utf-8,${escape(csv)}`);
    } catch (err) {
      promptErrToastWithText('Something went wrong');
      console.log(err);
    }
    setOpenBackdrop(false);
  };

  const filterTypes = React.useMemo(
    () => ({
      text: (rowDetails: any, id: any, filterValue: any) => {
        return rowDetails.filter((row: any) => {
          const rowValue = row.values[id];
          return rowValue !== undefined
            ? String(rowValue).toLowerCase().startsWith(String(filterValue).toLowerCase())
            : true;
        });
      },
    }),
    [],
  );

  const findRowByRoleInfo = (rolesToSearch: object[], searchKey: string) => {
    return rolesToSearch.find(
      (role: any) =>
        role.firstName.toLocaleLowerCase().includes(searchKey) ||
        role.lastName.toLocaleLowerCase().includes(searchKey) ||
        role.email.toLocaleLowerCase().includes(searchKey),
    );
  };

  const ourGlobalFilterFunction = useCallback((rows: any, ids: any, query: string) => {
    const caseInsenstiveSearchKeyWord = query.toLocaleLowerCase();
    return rows.filter((row: any) => {
      return (
        row.values.busOrgId?.toLowerCase().includes(caseInsenstiveSearchKeyWord) ||
        row.values.name?.toLowerCase().includes(caseInsenstiveSearchKeyWord) ||
        row.values.description?.toLowerCase().includes(caseInsenstiveSearchKeyWord) || // ProjectDetail Table doesn't have description field
        row.values.clusters?.find((cluster: string) =>
          cluster.toLocaleLowerCase().includes(caseInsenstiveSearchKeyWord),
        ) ||
        (row.values.productOwners &&
          findRowByRoleInfo(row.values.productOwners, caseInsenstiveSearchKeyWord)) ||
        (row.values.technicalLeads &&
          findRowByRoleInfo(row.values.technicalLeads, caseInsenstiveSearchKeyWord))
      );
    });
  }, []);
  // Use the useTable Hook to send the columns and data to build the table
  const {
    getTableProps, // table props from react-table
    getTableBodyProps, // table body props from react-table
    headerGroups, // headerGroups, if your table has groupings
    rows, // rows for the table based on the data passed
    prepareRow, // Prepare the row (this function needs to be called for each row before getting the row props)
    state,
    preGlobalFilteredRows,
    setGlobalFilter,
    allColumns,
    state: { sortBy },
  } = useTable(
    {
      columns,
      data,
      filterTypes,
      globalFilter: ourGlobalFilterFunction,
      initialState: {
        hiddenColumns: ['namespacePrefix', 'quotaSize'],
      },
      manualSortBy: true,
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
  );

  useEffect(() => {
    onSort(sortBy);
  }, [onSort, sortBy]);

  const history = useHistory();

  const handleRowClick = (row: any) => {
    history.push(`/profile/${row.original.id}/overview`);
  };

  const { ref, isComponentVisible, setIsComponentVisible } = useComponentVisible(false);
  const handleOpenSearch = () => {
    setIsComponentVisible(!isComponentVisible);
  };

  /* 
    Render the UI for your table
    - react-table doesn't have UI, it's headless. We just need to put the react-table props from the Hooks, and it will do its magic automatically
  */
  return (
    <Styles>
      <Flex flexWrap="wrap" alignContent="center">
        <Heading>{title}</Heading>
        <Box mx="auto" />
        <ColumnFilter allColumns={allColumns} />
        <Tooltip text="Search Table">
          <Icon
            hover
            color="primary"
            width={1.4}
            height={1.4}
            name="search"
            onClick={handleOpenSearch}
            style={{ margin: '14px 5px 5px' }}
          />
        </Tooltip>
        {isComponentVisible && (
          <Box ref={ref}>
            <GlobalFilter
              preGlobalFilteredRows={preGlobalFilteredRows}
              globalFilter={state.globalFilter}
              setGlobalFilter={setGlobalFilter}
            />
          </Box>
        )}
        <Tooltip text="Download CSV">
          <Icon
            hover
            color="primary"
            width={1.4}
            height={1.4}
            name="download"
            onClick={downloadCSV}
            style={{ margin: '14px 5px 5px' }}
          />
        </Tooltip>
      </Flex>
      <table {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup) => {
            const { key, ...restHeaderGroupProps } = headerGroup.getHeaderGroupProps();
            return (
              <tr key={key} {...restHeaderGroupProps}>
                {headerGroup.headers.map((column) => (
                  <th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    className={
                      // eslint-disable-next-line
                      column.isSorted ? (column.isSortedDesc ? 'sort-desc' : 'sort-asc') : ''
                    }
                    key={column.id}
                  >
                    {column.render('Header')}
                    <Icon color="contrast" name="sort" style={{ float: 'right', margin: '2px' }} />
                  </th>
                ))}
              </tr>
            );
          })}
        </thead>
        <tbody {...getTableBodyProps()}>
          {data.length > 0 &&
            rows.map((row, i) => {
              prepareRow(row);
              return (
                <tr
                  {...row.getRowProps()}
                  onClick={() => linkedRows && handleRowClick(row)}
                  key={row.id}
                >
                  {row.cells.map((cell) => {
                    const { key, ...restCellProps } = cell.getCellProps();
                    return (
                      <td key={key} {...restCellProps}>
                        {cell.render('Cell')}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
        </tbody>
      </table>
    </Styles>
  );
};

export default Table;
