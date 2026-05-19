'use client';

import { Card, SimpleGrid, Text, ThemeIcon } from '@mantine/core';
import { IconApps, IconBox, IconChecklist, IconTopologyStar3, IconUsers } from '@tabler/icons-react';
import Link from 'next/link';

type DashboardCard = {
  title: string;
  description: string;
  href: string;
  Icon: typeof IconApps;
};

const cards: DashboardCard[] = [
  {
    title: 'Teams',
    description: 'View and manage the teams connected to systems and products.',
    href: '/teams',
    Icon: IconUsers,
  },
  {
    title: 'Systems',
    description: 'Browse system containers and the resources linked to them.',
    href: '/systems',
    Icon: IconTopologyStar3,
  },
  {
    title: 'Resources',
    description: 'Open the resource areas for private cloud namespaces and public cloud accounts.',
    href: '/resources',
    Icon: IconBox,
  },
  {
    title: 'Requests',
    description: 'Review private-cloud and public-cloud request queues in one place.',
    href: '/requests',
    Icon: IconChecklist,
  },
];

export default function RegistryDashboard() {
  return (
    <div className="space-y-6 pt-5">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-gray-500">Dashboard</p>
        <h1 className="text-2xl font-semibold text-gray-900 lg:text-3xl 2xl:text-4xl">Registry Dashboard</h1>
        <p className="max-w-3xl text-sm text-gray-600 lg:text-base">
          Start from a top-level view of the registry and jump into teams, systems, or the resource areas.
        </p>
      </div>

      <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }} spacing="lg">
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
}
