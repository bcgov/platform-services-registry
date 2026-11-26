'use client';

import { Alert, Loader, SegmentedControl } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import dynamic from 'next/dynamic';
import { ReactNode, useState } from 'react';
import { getPrivateCloudProductAiUsageEmbed } from '@/services/backend/private-cloud/products';
import { getPublicCloudProductAiUsageEmbed } from '@/services/backend/public-cloud/products';
import { AiUsageReportKey } from '@/types/fabric';

// powerbi-client touches `window` on import, so it can only load in the browser.
const FabricReportEmbed = dynamic(() => import('./FabricReportEmbed'), { ssr: false, loading: () => <Loader /> });

const fetchers = {
  private: getPrivateCloudProductAiUsageEmbed,
  public: getPublicCloudProductAiUsageEmbed,
};

const views: Record<AiUsageReportKey, { label: string; heading: string; description: string; empty: string }> = {
  team: {
    label: 'Team Metrics',
    heading: 'Team AI Usage Metrics',
    description: 'Showing telemetry for team on project: ',
    empty: 'There are no valid GitHub usernames associated with the team members for this project.',
  },
  quality: {
    label: 'Code Quality',
    heading: 'Code Quality AI Usage Metrics',
    description: 'Showing code quality metrics for repositories on project: ',
    empty: 'No valid repositories configured. Add GitHub repository URLs to this product to view code quality metrics.',
  },
};

function getErrorMessage(error: unknown) {
  if (isAxiosError(error) && typeof error.response?.data?.error === 'string') {
    return error.response.data.error;
  }

  return 'Unable to load the AI usage report. Please try again later.';
}

export default function AiUsageReports({ cloud, licencePlate }: { cloud: 'private' | 'public'; licencePlate: string }) {
  const [view, setView] = useState<AiUsageReportKey>('team');
  const { heading, description, empty } = views[view];

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['aiUsageEmbed', cloud, licencePlate, view],
    queryFn: () => fetchers[cloud](licencePlate, view),
    enabled: !!licencePlate,
    // Embed tokens expire, so fetch a fresh one each time a view is shown rather than reusing a cached one.
    gcTime: 0,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  let content: ReactNode;

  if (isLoading) {
    content = <Loader />;
  } else if (isError || !data) {
    content = (
      <Alert color="red" title="Report unavailable">
        {getErrorMessage(error)}
      </Alert>
    );
  } else if (!data.available) {
    content = <Alert color="blue">{empty}</Alert>;
  } else {
    content = <FabricReportEmbed key={data.embedToken} info={data} onReload={() => refetch()} />;
  }

  return (
    <div className="rounded-lg bg-white p-6">
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="m-0 text-2xl font-semibold text-bcblue">{heading}</h2>
          <SegmentedControl
            aria-label="AI usage view"
            value={view}
            onChange={(value) => setView(value as AiUsageReportKey)}
            data={Object.entries(views).map(([value, { label }]) => ({ value, label }))}
          />
        </div>
        <p className="mt-2 text-gray-600">
          {description}
          <strong className="text-black">{licencePlate}</strong>
        </p>
      </div>
      {content}
    </div>
  );
}
