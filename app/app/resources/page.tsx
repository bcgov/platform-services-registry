'use client';

import { Card, SimpleGrid, Text, ThemeIcon } from '@mantine/core';
import { IconApps, IconCloud, IconServer2 } from '@tabler/icons-react';
import Link from 'next/link';
import EntityPageHeader from '@/components/system/EntityPageHeader';
import { GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';

type ResourceCard = {
  title: string;
  description: string;
  href: string;
  Icon: typeof IconApps;
};

const cards: ResourceCard[] = [
  {
    title: 'OpenShift Namespaces',
    description: 'Open the private cloud OpenShift area with breadcrumb navigation instead of the legacy top tabs.',
    href: '/resources/private-cloud-openshift',
    Icon: IconServer2,
  },
  {
    title: 'Public Cloud Accounts',
    description: 'Open the public cloud landing zone area with breadcrumb navigation instead of the legacy top tabs.',
    href: '/resources/public-cloud-landing-zone',
    Icon: IconCloud,
  },
];

const resourcesPage = createClientPage({
  roles: [GlobalRole.User],
  fallbackUrl: '/login?callbackUrl=/resources',
});

export default resourcesPage(() => {
  return (
    <div className="space-y-6 pt-5">
      <EntityPageHeader
        breadcrumbs={[{ label: 'Dashboard', href: '/home' }, { label: 'Resources' }]}
        title="Resources"
        description="Choose a resource area to continue into the current private-cloud and public-cloud product views."
      />

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        {cards.map((card) => (
          <Card
            key={card.title}
            component={Link}
            href={card.href}
            withBorder
            radius="md"
            padding="lg"
            className="group min-h-56 border-gray-200 transition-colors hover:border-gray-400"
          >
            <div className="flex h-full flex-col justify-between gap-10">
              <div className="space-y-4">
                <ThemeIcon size={48} radius="md" variant="light" color="gray">
                  <card.Icon size={24} />
                </ThemeIcon>
                <div className="space-y-2">
                  <Text fw={600} size="xl" c="dark">
                    {card.title}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {card.description}
                  </Text>
                </div>
              </div>
              <Text size="sm" fw={500} className="text-gray-700 group-hover:text-black">
                Open {card.title}
              </Text>
            </div>
          </Card>
        ))}
      </SimpleGrid>
    </div>
  );
});
