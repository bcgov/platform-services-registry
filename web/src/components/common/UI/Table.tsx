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
import { Checkbox, Input, Label } from '@rebass/forms';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { useAsyncDebounce, useFilters, useGlobalFilter, useSortBy, useTable } from 'react-table';
import { Box, Flex, Heading } from 'rebass';
import useComponentVisible from '../../../hooks/useComponentVisible';
import theme from '../../../theme';
import Icon from './Icon';

interface ITableProps {
  columns: any;
  data: Object[];
  linkedRows?: boolean;
  title: string;
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
      content: 'Product Owner';
    }
    td:nth-of-type(5):before {
      content: 'Technical Contact';
    }
    td:nth-of-type(6):before {
      content: 'Status';
    }
  }
`;

// Define a default UI for filtering
const GlobalFilter: React.FC<any> = ({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter,
}:any) => {
  const count = preGlobalFilteredRows.length
  const [value, setValue] = React.useState(globalFilter)
  const onChange = useAsyncDebounce(value => {
    setGlobalFilter(value || undefined)
  }, 200)

  return (
    <Flex flexDirection="row">
      <Label width={1/3}>Search:{' '}</Label>
      <Input
        value={value || ""}
        onChange={e => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
        placeholder={`${count} records...`}
        width={2/3}
      />
    </Flex>
  )
}

const Table: React.FC<ITableProps> = (props) => {
  const { columns, data, linkedRows, title } = props;
  
  const filterTypes = React.useMemo(
    () => ({
      text: (rows:any, id:any, filterValue:any) => {
        return rows.filter((row:any) => {
          const rowValue = row.values[id]
          return rowValue !== undefined
            ? String(rowValue)
                .toLowerCase()
                .startsWith(String(filterValue).toLowerCase())
            : true
        })
      },
    }),
    []
  )

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
    getToggleHideAllColumnsProps,
  } = useTable(
    {
      columns,
      data,
      filterTypes,
      initialState: {
        hiddenColumns: ['namespacePrefix', 'quotaSize']
      }
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
  );

  const history = useHistory();

  const handleRowClick = (row: any) => {
    history.push(`/profile/${row.original.id}/overview`);
  };
  const StyledDropdown = styled.div`
  display: block;
  position: absolute;
  min-width: 100px;
  margin-right: 15px;
  padding: 5px;
  background-color: ${theme.colors.contrast};
  border: 1px solid #000;
  zindex: ${theme.zIndices[2]};
`;
  const { isComponentVisible, setIsComponentVisible } = useComponentVisible(false);
  const handleDDDesktop = () => {
    setIsComponentVisible(!isComponentVisible);
  };
  
  /* 
    Render the UI for your table
    - react-table doesn't have UI, it's headless. We just need to put the react-table props from the Hooks, and it will do its magic automatically
  */
  return (
    <Styles>
      <Flex flexWrap="wrap">
        <Heading>{title}</Heading>
        <Box mx='auto' />

        <Box>
        <Icon
          hover
          color="primary"
          name='menuStack'
          width={1.4}
          height={1.4}
          style={{margin: '14px 5px 5px 0', transform: 'rotate(90deg)', zIndex: 5}}
          onClick={handleDDDesktop}
        />
        {isComponentVisible && (
          <StyledDropdown>
            <div>
              {allColumns.map(column => (
                <div key={column.id}>
                  <label>
                    <Flex flexDirection="row">
                      <Checkbox variant="inlineCheckbox" type="checkbox" {...column.getToggleHiddenProps()} />{' '}
                      <Label>{column.Header}</Label>
                    </Flex>
                  </label>
                </div>
              ))}
              <br />
            </div>
          </StyledDropdown>
        )}</Box>
        <GlobalFilter
          preGlobalFilteredRows={preGlobalFilteredRows}
          globalFilter={state.globalFilter}
          setGlobalFilter={setGlobalFilter}
        />
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
