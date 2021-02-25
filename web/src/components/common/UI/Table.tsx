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
                <tr {...row.getRowProps()} onClick={() => handleRowClick(row)} key={row.id}>
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
