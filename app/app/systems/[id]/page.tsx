'use client';

import { Button, Select } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import SystemForm from '@/components/system/SystemForm';
import { GlobalPermissions } from '@/constants';
import createClientPage from '@/core/client-page';
import { searchPrivateCloudProducts } from '@/services/backend/private-cloud/products';
import { searchPublicCloudProducts } from '@/services/backend/public-cloud/products';
import {
  attachPrivateCloudProduct,
  attachPublicCloudProduct,
  attachTeam,
  deleteSystem,
  detachPrivateCloudProduct,
  detachPublicCloudProduct,
  detachTeam,
  getSystem,
  updateSystem,
} from '@/services/backend/systems';
import { listTeams } from '@/services/backend/teams';
import { objectId } from '@/validation-schemas';

const pathParamsSchema = z.object({ id: objectId });

const Page = createClientPage({
  permissions: [GlobalPermissions.ViewSystems],
  validations: { pathParams: pathParamsSchema },
  fallbackUrl: '/systems',
});

export default Page(({ getPathParams, session }) => {
  const [id, setId] = useState('');
  const [teamId, setTeamId] = useState<string | null>(null);
  const [privateProductId, setPrivateProductId] = useState<string | null>(null);
  const [publicProductId, setPublicProductId] = useState<string | null>(null);

  useEffect(() => {
    getPathParams().then((params) => setId(params.id));
  }, [getPathParams]);

  const { data, refetch } = useQuery({
    queryKey: ['system', id],
    queryFn: () => getSystem(id),
    enabled: !!id,
  });

  const { data: teams } = useQuery({
    queryKey: ['teamsForSystemLink'],
    queryFn: () => listTeams(),
  });

  const { data: privateProducts } = useQuery({
    queryKey: ['systemPrivateProducts'],
    queryFn: async () => (await searchPrivateCloudProducts({ page: 1, pageSize: 1000 })).docs,
  });

  const { data: publicProducts } = useQuery({
    queryKey: ['systemPublicProducts'],
    queryFn: async () => (await searchPublicCloudProducts({ page: 1, pageSize: 1000 })).docs,
  });

  const linkedTeamIds = useMemo(() => new Set((data?.teamLinks ?? []).map((link) => link.teamId)), [data]);
  const linkedPrivateIds = useMemo(
    () => new Set((data?.privateCloudProductLinks ?? []).map((link) => link.privateCloudProductId)),
    [data],
  );
  const linkedPublicIds = useMemo(
    () => new Set((data?.publicCloudProductLinks ?? []).map((link) => link.publicCloudProductId)),
    [data],
  );

  if (!data) return null;

  return (
    <div className="pt-5 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl lg:text-2xl 2xl:text-4xl font-semibold">{data.name}</h1>
        {session?.permissions.manageSystems && (
          <Button
            color="red"
            variant="outline"
            onClick={async () => {
              await deleteSystem(data.id);
              window.location.href = '/systems';
            }}
          >
            Archive
          </Button>
        )}
      </div>

      <SystemForm
        initialValue={data}
        onSubmit={async (value) => {
          await updateSystem(data.id, value);
          await refetch();
        }}
        submitLabel="Update System"
      />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Linked Teams</h2>
        {session?.permissions.manageSystems && (
          <div className="flex gap-2 items-end">
            <Select
              className="grow"
              searchable
              data={(teams ?? [])
                .filter((team) => !linkedTeamIds.has(team.id))
                .map((team) => ({ value: team.id, label: `${team.name} (${team.code})` }))}
              value={teamId}
              onChange={setTeamId}
              label="Attach Team"
            />
            <Button
              disabled={!teamId}
              onClick={async () => {
                if (!teamId) return;
                await attachTeam(data.id, teamId);
                setTeamId(null);
                await refetch();
              }}
            >
              Attach
            </Button>
          </div>
        )}
        <ul className="list-disc pl-5">
          {data.teamLinks.map((link) => (
            <li key={link.id} className="flex items-center gap-2">
              <a className="underline" href={`/teams/${link.team.id}`}>
                {link.team.name}
              </a>
              {session?.permissions.manageSystems && (
                <Button
                  size="compact-xs"
                  variant="subtle"
                  color="red"
                  onClick={async () => {
                    await detachTeam(data.id, link.teamId);
                    await refetch();
                  }}
                >
                  Remove
                </Button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Linked Private Cloud Products</h2>
        {session?.permissions.manageSystems && (
          <div className="flex gap-2 items-end">
            <Select
              className="grow"
              searchable
              data={(privateProducts ?? [])
                .filter((product) => !linkedPrivateIds.has(product.id))
                .map((product) => ({ value: product.id, label: `${product.name} (${product.licencePlate})` }))}
              value={privateProductId}
              onChange={setPrivateProductId}
              label="Attach Private Cloud Product"
            />
            <Button
              disabled={!privateProductId}
              onClick={async () => {
                if (!privateProductId) return;
                await attachPrivateCloudProduct(data.id, privateProductId);
                setPrivateProductId(null);
                await refetch();
              }}
            >
              Attach
            </Button>
          </div>
        )}
        <ul className="list-disc pl-5">
          {data.privateCloudProductLinks.map((link) => (
            <li key={link.id} className="flex items-center gap-2">
              <a className="underline" href={`/private-cloud/products/${link.privateCloudProduct.licencePlate}/edit`}>
                {link.privateCloudProduct.name} ({link.privateCloudProduct.licencePlate})
              </a>
              {session?.permissions.manageSystems && (
                <Button
                  size="compact-xs"
                  variant="subtle"
                  color="red"
                  onClick={async () => {
                    await detachPrivateCloudProduct(data.id, link.privateCloudProductId);
                    await refetch();
                  }}
                >
                  Remove
                </Button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Linked Public Cloud Products</h2>
        {session?.permissions.manageSystems && (
          <div className="flex gap-2 items-end">
            <Select
              className="grow"
              searchable
              data={(publicProducts ?? [])
                .filter((product) => !linkedPublicIds.has(product.id))
                .map((product) => ({ value: product.id, label: `${product.name} (${product.licencePlate})` }))}
              value={publicProductId}
              onChange={setPublicProductId}
              label="Attach Public Cloud Product"
            />
            <Button
              disabled={!publicProductId}
              onClick={async () => {
                if (!publicProductId) return;
                await attachPublicCloudProduct(data.id, publicProductId);
                setPublicProductId(null);
                await refetch();
              }}
            >
              Attach
            </Button>
          </div>
        )}
        <ul className="list-disc pl-5">
          {data.publicCloudProductLinks.map((link) => (
            <li key={link.id} className="flex items-center gap-2">
              <a className="underline" href={`/public-cloud/products/${link.publicCloudProduct.licencePlate}/edit`}>
                {link.publicCloudProduct.name} ({link.publicCloudProduct.licencePlate})
              </a>
              {session?.permissions.manageSystems && (
                <Button
                  size="compact-xs"
                  variant="subtle"
                  color="red"
                  onClick={async () => {
                    await detachPublicCloudProduct(data.id, link.publicCloudProductId);
                    await refetch();
                  }}
                >
                  Remove
                </Button>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
});
