'use client';

import { Alert, Group, Avatar, Text, Accordion } from '@mantine/core';
import { $Enums } from '@prisma/client';
import {
  IconInfoCircle,
  IconCircleLetterO,
  IconCircleLetterR,
  IconCircleLetterD,
  IconProps,
  Icon,
} from '@tabler/icons-react';
import { ForwardRefExoticComponent, RefAttributes } from 'react';
import { z } from 'zod';
import ProductComparison from '@/components/ProductComparison';
import createClientPage from '@/core/client-page';
import { usePrivateProductState } from '@/states/global';
import { DiffChange } from '@/utils/diff';

const pathParamSchema = z.object({
  id: z.string(),
});

interface AccordionLabelProps {
  label: string;
  LeftIcon: ForwardRefExoticComponent<Omit<IconProps, 'ref'> & RefAttributes<Icon>>;
  description: string;
}

function AccordionLabel({ label, LeftIcon, description }: AccordionLabelProps) {
  return (
    <Group wrap="nowrap">
      <LeftIcon className="inline-block" />
      <div>
        <Text>{label}</Text>
        <Text size="sm" c="dimmed" fw={400}>
          {description}
        </Text>
      </div>
    </Group>
  );
}

const Layout = createClientPage({
  roles: ['user'],
  validations: { pathParams: pathParamSchema },
});
export default Layout(({ pathParams, queryParams, session, router, children }) => {
  const [privateCloudState, privateCloudStateSnap] = usePrivateProductState();
  const { id } = pathParams;

  const tabsByType = {
    [$Enums.RequestType.CREATE]: ['request'],
    [$Enums.RequestType.EDIT]: ['original', 'request', 'decision'],
    [$Enums.RequestType.DELETE]: [],
  };

  let dataSet = [
    {
      id: 'original',
      LeftIcon: IconCircleLetterO,
      label: 'Original Data to User Request Data',
      description: 'Data changes between the original data and the user requested data',
      data: privateCloudStateSnap.dataChangeOriginalRequest?.changes,
    },
  ];

  if (
    privateCloudStateSnap.currentRequest?.decisionStatus === $Enums.DecisionStatus.APPROVED ||
    privateCloudStateSnap.currentRequest?.decisionStatus === $Enums.DecisionStatus.PROVISIONED
  ) {
    dataSet.push(
      {
        id: 'request',
        LeftIcon: IconCircleLetterR,
        label: 'User Request Data to Admin Decision Data',
        description: 'Data changes between the user requested data and the admin decision data',
        data: privateCloudStateSnap.dataChangeRequestDecision?.changes,
      },
      {
        id: 'decision',
        LeftIcon: IconCircleLetterD,
        label: 'Original Data to Admin Decision Data',
        description: 'Data changes between the original data and the admin decision data',
        data: privateCloudStateSnap.dataChangeOriginalDecision?.changes,
      },
    );
  }

  dataSet = dataSet.filter((tab) => {
    if (!privateCloudStateSnap.currentRequest) return false;

    return (tabsByType[privateCloudStateSnap.currentRequest.type] as string[]).includes(tab.id);
  });

  const items = dataSet.map((item) => (
    <Accordion.Item value={item.id} key={item.label}>
      <Accordion.Control>
        <AccordionLabel {...item} />
      </Accordion.Control>
      <Accordion.Panel>
        <ProductComparison data={item.data as DiffChange[]} />
      </Accordion.Panel>
    </Accordion.Item>
  ));

  return (
    <div>
      {privateCloudStateSnap.currentRequest?.decisionStatus === $Enums.DecisionStatus.PENDING && (
        <Alert variant="light" color="blue" title="" icon={<IconInfoCircle />}>
          This request is currently under admin review.
        </Alert>
      )}

      <div className="mb-2"></div>

      {dataSet.length > 0 && (
        <Accordion chevronPosition="right" variant="contained">
          {items}
        </Accordion>
      )}
    </div>
  );
});
