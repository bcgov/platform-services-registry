'use client';

import { Alert, Button } from '@mantine/core';
import { models, Report } from 'powerbi-client';
import { EventHandler, PowerBIEmbed } from 'powerbi-client-react';
import { useEffect, useState } from 'react';
import { FabricEmbedToken, FabricReportFilter } from '@/types/fabric';

// setTimeout overflows above ~24.8 days; embed tokens last about an hour, so this only guards bad input.
const MAX_TIMEOUT_MS = 2 ** 31 - 1;

const DEFAULT_ASPECT_RATIO = 16 / 9;

type EmbedInfo = FabricEmbedToken & { filters: FabricReportFilter[] };

function buildEmbedConfig(info: EmbedInfo) {
  const filters: models.IBasicFilter[] = info.filters.map(({ table, column, values }) => ({
    $schema: 'http://powerbi.com/product/schema#basic',
    target: { table, column },
    operator: 'In',
    values,
    filterType: models.FilterType.Basic,
    requireSingleSelection: false,
  }));

  const config: models.IReportEmbedConfiguration = {
    type: 'report',
    id: info.reportId,
    embedUrl: info.embedUrl,
    accessToken: info.embedToken,
    tokenType: models.TokenType.Embed,
    filters,
    settings: {
      // Fit to page so Power BI doesn't reserve scrollbar gutters (which fit-to-width does, leaving strips of
      // wallpaper on the right and bottom). The container is sized to the page's aspect ratio once it loads.
      layoutType: models.LayoutType.Custom,
      customLayout: { displayOption: models.DisplayOption.FitToPage },
      panes: {
        filters: { visible: false },
        pageNavigation: { visible: false },
      },
    },
  };

  return config;
}

// The embed config is fixed at mount because PowerBIEmbed reloads the report whenever it changes.
// To pick up a new token, the parent remounts this component (e.g. keyed by the token).
export default function FabricReportEmbed({ info, onReload }: { info: EmbedInfo; onReload: () => void }) {
  const [embedConfig] = useState(() => buildEmbedConfig(info));
  const [expired, setExpired] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState(DEFAULT_ASPECT_RATIO);

  const [eventHandlers] = useState(
    () =>
      new Map<string, EventHandler>([
        [
          'loaded',
          (_event, embed) => {
            // Report pages are often not 16:9, so match the container to the active page to avoid letterboxing.
            (embed as Report | undefined)
              ?.getActivePage()
              .then(({ defaultSize }) => {
                if (defaultSize?.width && defaultSize?.height) setAspectRatio(defaultSize.width / defaultSize.height);
              })
              .catch(() => undefined);
          },
        ],
        [
          'error',
          (event) => {
            const detail = event?.detail as { message?: string; detailedMessage?: string } | undefined;
            if (detail?.message === 'TokenExpired') {
              setExpired(true);
              return;
            }

            setReportError(detail?.detailedMessage || detail?.message || 'The report failed to load.');
          },
        ],
      ]),
  );

  useEffect(() => {
    const msUntilExpiry = new Date(info.expiration).getTime() - Date.now();
    if (Number.isNaN(msUntilExpiry)) return;

    const timer = setTimeout(() => setExpired(true), Math.min(Math.max(msUntilExpiry, 0), MAX_TIMEOUT_MS));
    return () => clearTimeout(timer);
  }, [info.expiration]);

  return (
    <>
      {expired && (
        <Alert color="yellow" title="Report session expired" className="mb-4">
          <div className="flex items-center justify-between gap-4">
            <span>Reload the report to continue viewing up-to-date data.</span>
            <Button size="xs" onClick={onReload}>
              Reload
            </Button>
          </div>
        </Alert>
      )}
      {reportError && (
        <Alert color="red" title="Report error" className="mb-4">
          {reportError}
        </Alert>
      )}
      <div className="w-full" style={{ aspectRatio }}>
        <PowerBIEmbed embedConfig={embedConfig} eventHandlers={eventHandlers} cssClassName="h-full w-full" />
      </div>
    </>
  );
}
