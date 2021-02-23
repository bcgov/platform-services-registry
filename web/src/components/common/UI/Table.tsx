// Table.js

import styled from '@emotion/styled';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { useSortBy, useTable } from 'react-table';
import theme from '../../../theme';

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
// @ts-ignore
export default function Table({ columns, data }) {
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
  // @ts-ignore
  const handleRowClick = (row) => {
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
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  className={
                    column.isSorted ? (column.isSortedDesc ? 'sort-desc' : 'sort-asc') : ''
                  }
                >
                  {column.render('Header')}
                  <span>{column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}</span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {data.length > 0 &&
            rows.map((row, i) => {
              prepareRow(row);
              console.log(row.original);
              return (
                <tr {...row.getRowProps()} onClick={() => handleRowClick(row)}>
                  {row.cells.map((cell) => <td {...cell.getCellProps()}>{cell.render('Cell')}</td>)}
                </tr>
              );
            })}
        </tbody>
      </table>
    </Styles>
  );
}
