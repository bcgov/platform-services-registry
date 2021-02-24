// Table.js

import styled from '@emotion/styled';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { useSortBy, useTable } from 'react-table';
import theme from '../../../theme';
import Icon from './Icon';

interface ITableProps {
  columns: any;
  data: Object[];
}

const Styles = styled.div`
  padding: 1rem;

  table {
    border-spacing: 0;
    border: 1px solid black;

    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }

      :nth-child(even) {
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

      :last-child {
        border-right: 0;
      }
    }
  }
`;

const Table: React.FC<ITableProps> = (props) => {
  const { columns, data } = props;
  // Use the useTable Hook to send the columns and data to build the table
  const {
    getTableProps, // table props from react-table
    getTableBodyProps, // table body props from react-table
    headerGroups, // headerGroups, if your table has groupings
    rows, // rows for the table based on the data passed
    prepareRow, // Prepare the row (this function needs to be called for each row before getting the row props)
  } = useTable(
    {
      columns,
      data,
    },
    useSortBy,
  );

  const history = useHistory();

  const handleRowClick = (row: any) => {
    history.push(`/profile/${row.original.id}/overview`);
  };

  /* 
    Render the UI for your table
    - react-table doesn't have UI, it's headless. We just need to put the react-table props from the Hooks, and it will do its magic automatically
  */
  return (
    <Styles>
      <table {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
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
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {data.length > 0 &&
            rows.map((row, i) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} onClick={() => handleRowClick(row)} key={row.id}>
                  {row.cells.map((cell) => (
                    <td {...cell.getCellProps()} key={cell.value}>
                      {cell.render('Cell')}
                    </td>
                  ))}
                </tr>
              );
            })}
        </tbody>
      </table>
    </Styles>
  );
};

export default Table;
