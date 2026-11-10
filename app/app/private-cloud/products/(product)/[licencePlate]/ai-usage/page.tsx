'use client';

import { Alert, SegmentedControl } from '@mantine/core';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useAppState, usePrivateProductState } from '@/states/global';

export default function AIUsagePage() {
  const { licencePlate } = useParams();
  const [view, setView] = useState('team');
  const [, snap] = usePrivateProductState();
  const [, appSnap] = useAppState();

  const product = snap.currentProduct;
  const isCodeQuality = view === 'quality';
  const heading = isCodeQuality ? 'Code Quality AI Usage Metrics' : 'Team AI Usage Metrics';
  const teamUsers = product
    ? [product.projectOwner, product.primaryTechnicalLead, product.secondaryTechnicalLead, ...product.members]
    : [];
  const teamGitHubUsernames = Array.from(
    new Set(
      teamUsers
        .map((user) => user?.githubAccount?.username?.trim())
        .filter((username): username is string =>
          /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(username ?? ''),
        ),
    ),
  );
  const repositoryNames = Array.from(
    new Set(
      (product?.repositories ?? [])
        .map(({ url }) => {
          const trimmedUrl = url.trim();
          const normalizedUrl = trimmedUrl.startsWith('http') ? trimmedUrl : `https://${trimmedUrl}`;
          if (!URL.canParse(normalizedUrl)) return undefined;
          return new URL(normalizedUrl).pathname
            .replace(/\/+$/, '')
            .split('/')
            .pop()
            ?.replace(/\.git$/, '');
        })
        .filter((name): name is string => Boolean(name) && /^[A-Za-z0-9._-]{1,100}$/.test(name ?? '')),
    ),
  );
  const filterValues = isCodeQuality ? repositoryNames : teamGitHubUsernames;
  const reportUrl = isCodeQuality ? appSnap.info.POWER_BI_CODE_QUALITY_URL : appSnap.info.POWER_BI_TEAM_METRICS_URL;
  const embedUrl = URL.canParse(reportUrl) ? new URL(reportUrl) : null;
  const validReportUrl =
    embedUrl?.origin === 'https://app.powerbi.com' &&
    embedUrl.pathname === '/reportEmbed' &&
    !embedUrl.username &&
    !embedUrl.password &&
    /^[a-fA-F0-9]{8}(?:-[a-fA-F0-9]{4}){3}-[a-fA-F0-9]{12}$/.test(embedUrl.searchParams.get('reportId') ?? '');

  let message = '';
  if (!product || product.licencePlate !== licencePlate) {
    message = 'Product information is unavailable. Please reload the page.';
  } else if (filterValues.length === 0) {
    message = isCodeQuality
      ? 'No valid repositories configured. Add repository URLs to this product to view code quality metrics.'
      : 'There are no valid GitHub usernames associated with the team members for this project.';
  } else if (!validReportUrl) {
    message = 'The dashboard URL is missing or invalid. Please contact the Registry team.';
  }

  if (embedUrl && !message) {
    const formattedValues = filterValues.map((value) => `'${value.replace(/'/g, "''")}'`).join(',');
    embedUrl.searchParams.set(
      'filter',
      `ai_credit_usage/${isCodeQuality ? 'repository' : 'username'} in (${formattedValues})`,
    );
    embedUrl.searchParams.set('autoAuth', 'true');
    embedUrl.searchParams.set('filterPaneEnabled', 'false');
    embedUrl.searchParams.set('navContentPaneEnabled', 'false');
    // Power BI URL filters require %20 for spaces; URLSearchParams encodes them as '+'.
    embedUrl.search = embedUrl.search.replace(/\+/g, '%20');
  }

  return (
    <div className="rounded-lg bg-white p-6">
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="m-0 text-2xl font-semibold text-bcblue">{heading}</h2>
          <SegmentedControl
            aria-label="AI usage view"
            value={view}
            onChange={setView}
            data={[
              { label: 'Team Metrics', value: 'team' },
              { label: 'Code Quality', value: 'quality' },
            ]}
          />
        </div>
        <p className="mt-2 text-gray-600">
          {isCodeQuality
            ? 'Showing code quality metrics for repositories on project: '
            : 'Showing telemetry for team on project: '}
          <strong className="text-black">{licencePlate}</strong>
        </p>
      </div>
      {message ? (
        <Alert color="blue">{message}</Alert>
      ) : (
        <>
          <div className="mb-6">
            <a href={embedUrl?.href} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">
              Open full dashboard
            </a>
          </div>
          <div className="aspect-video w-full overflow-hidden rounded-lg border border-gray-200">
            <iframe
              key={view}
              title={isCodeQuality ? 'Code Quality AI Usage Report' : 'Team Centric AI Usage Report'}
              src={embedUrl?.href}
              width="100%"
              height="100%"
              className="border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              referrerPolicy="no-referrer"
              allowFullScreen
            />
          </div>
        </>
      )}
    </div>
  );
}
