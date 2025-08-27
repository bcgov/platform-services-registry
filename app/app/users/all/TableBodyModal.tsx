'use client';

import { Table } from '@mantine/core';

interface TableProps {
  users: any[];
}

export default function TableBodyModal({ users }: TableProps) {
  const rows = users.length ? (
    users.map((item, index) => (
      <Table.Tr key={item.id}>
        <Table.Td>
          <div className="text-xs font-semibold opacity-50">{item.email}</div>
        </Table.Td>

        <Table.Td>{item.outcome}</Table.Td>
        <Table.Td className="italic">{item.error}</Table.Td>
      </Table.Tr>
    ))
  ) : (
    <Table.Tr>
      <Table.Td colSpan={5} className="italic">
        No users found
      </Table.Td>
    </Table.Tr>
  );

  return (
    <Table.ScrollContainer minWidth={800}>
      <Table verticalSpacing="sm">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>User email</Table.Th>
            <Table.Th>Outcome</Table.Th>
            <Table.Th>Error</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
