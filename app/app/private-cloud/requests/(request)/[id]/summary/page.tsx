'use client';

import { Alert, Group, Avatar, Text, Accordion, Table, Badge, Button } from '@mantine/core';
import { DecisionStatus, RequestType } from '@prisma/client';
import {
  IconInfoCircle,
  IconCircleLetterO,
  IconCircleLetterR,
  IconCircleLetterD,
  IconAddressBook,
} from '@tabler/icons-react';
import { z } from 'zod';
import PageAccordion, { PageAccordionItem } from '@/components/generic/accordion/PageAccordion';
import ProductComparison from '@/components/ProductComparison';
import { GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';
import { usePrivateProductState } from '@/states/global';
import { DiffChange } from '@/utils/diff';

const tabsByType = {
  [RequestType.CREATE]: ['request'],
  [RequestType.EDIT]: ['original', 'request', 'decision'],
  [RequestType.DELETE]: [],
};

const pathParamSchema = z.object({
  id: z.string(),
});

const Layout = createClientPage({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema },
});
export default Layout(({ pathParams, queryParams, session, router, children }) => {
  const [, privateCloudSnap] = usePrivateProductState();
  const { id } = pathParams;

  let dataSet = [
    {
      id: 'original',
      LeftIcon: IconCircleLetterO,
      label: 'Original Data to User Request Data',
      description: 'Data changes between the original data and the user requested data',
      data: privateCloudSnap.dataChangeOriginalRequest?.changes,
    },
  ];

  if (
    privateCloudSnap.currentRequest?.decisionStatus === DecisionStatus.APPROVED ||
    privateCloudSnap.currentRequest?.decisionStatus === DecisionStatus.AUTO_APPROVED ||
    privateCloudSnap.currentRequest?.decisionStatus === DecisionStatus.PROVISIONED
  ) {
    dataSet.push(
      {
        id: 'request',
        LeftIcon: IconCircleLetterR,
        label: 'User Request Data to Admin Decision Data',
        description: 'Data changes between the user requested data and the admin decision data',
        data: privateCloudSnap.dataChangeRequestDecision?.changes,
      },
      {
        id: 'decision',
        LeftIcon: IconCircleLetterD,
        label: 'Original Data to Admin Decision Data',
        description: 'Data changes between the original data and the admin decision data',
        data: privateCloudSnap.dataChangeOriginalDecision?.changes,
      },
    );
  }

  dataSet = dataSet.filter((tab) => {
    if (!privateCloudSnap.currentRequest) return false;
    return (tabsByType[privateCloudSnap.currentRequest.type] as string[]).includes(tab.id);
  });

  const accordionItems: PageAccordionItem[] = dataSet.map((item) => ({
    LeftIcon: item.LeftIcon,
    label: item.label,
    description: item.description,
    Component: ProductComparison,
    componentArgs: {
      data: item.data as DiffChange[],
    },
  }));

  if (privateCloudSnap.currentRequest?.quotaContactName) {
    accordionItems.push({
      LeftIcon: IconAddressBook,
      label: 'Quota Contact & Justification',
      description: 'The contact information responsible for the justification with their detailed comments',
      Component: () => (
        <Table highlightOnHover verticalSpacing="sm" className="bg-white">
          <Table.Tbody>
            <Table.Tr>
              <Table.Td>Contact Name</Table.Td>
              <Table.Td>{privateCloudSnap.currentRequest?.quotaContactName}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>Contact Email</Table.Td>
              <Table.Td>{privateCloudSnap.currentRequest?.quotaContactEmail}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>Justification</Table.Td>
              <Table.Td>{privateCloudSnap.currentRequest?.quotaJustification}</Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      ),
      componentArgs: {},
    });
  }

  return (
    <div>
      {privateCloudSnap.currentRequest?.decisionStatus === DecisionStatus.PENDING && (
        <Alert variant="light" color="blue" title="" icon={<IconInfoCircle />}>
          This request is currently under admin review.
        </Alert>
      )}

      <div className="mb-2"></div>

      <PageAccordion items={accordionItems} />
    </div>
  );
});
