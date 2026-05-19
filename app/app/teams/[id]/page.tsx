'use client';

import { Button, Select, TextInput } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import EntityPageHeader from '@/components/system/EntityPageHeader';
import TeamForm from '@/components/system/TeamForm';
import { GlobalPermissions } from '@/constants';
import createClientPage from '@/core/client-page';
import { searchPrivateCloudProducts } from '@/services/backend/private-cloud/products';
import { searchPublicCloudProducts } from '@/services/backend/public-cloud/products';
import { listSystems } from '@/services/backend/systems';
import {
  attachPrivateCloudProduct,
  attachPublicCloudProduct,
  attachSystem,
  deleteTeam,
  detachPrivateCloudProduct,
  detachPublicCloudProduct,
  detachSystem,
  getTeam,
  updateTeam,
  updateTeamMembers,
} from '@/services/backend/teams';
import { searchUsers } from '@/services/backend/user';
import { objectId } from '@/validation-schemas';

const pathParamsSchema = z.object({ id: objectId });

const Page = createClientPage({
  permissions: [GlobalPermissions.ViewTeams],
  validations: { pathParams: pathParamsSchema },
  fallbackUrl: '/teams',
});

export default Page(({ getPathParams, session }) => {
  const [id, setId] = useState('');
  const [systemId, setSystemId] = useState<string | null>(null);
  const [privateProductId, setPrivateProductId] = useState<string | null>(null);
  const [publicProductId, setPublicProductId] = useState<string | null>(null);
  const [memberUserId, setMemberUserId] = useState<string | null>(null);
  const [memberRoles, setMemberRoles] = useState('');

  useEffect(() => {
    getPathParams().then((params) => setId(params.id));
  }, [getPathParams]);

  const { data, refetch } = useQuery({
    queryKey: ['team', id],
    queryFn: () => getTeam(id),
    enabled: !!id,
  });

  const { data: systems } = useQuery({
    queryKey: ['systemsForTeamLink'],
    queryFn: () => listSystems(),
  });

  const { data: privateProducts } = useQuery({
    queryKey: ['teamPrivateProducts'],
    queryFn: async () => (await searchPrivateCloudProducts({ page: 1, pageSize: 1000 })).docs,
  });

  const { data: publicProducts } = useQuery({
    queryKey: ['teamPublicProducts'],
    queryFn: async () => (await searchPublicCloudProducts({ page: 1, pageSize: 1000 })).docs,
  });

  const { data: users } = useQuery({
    queryKey: ['teamUserCandidates'],
    queryFn: async () => (await searchUsers({ page: 1, pageSize: 200, search: '', sortValue: '', roles: [] })).data,
  });

  const linkedSystemIds = useMemo(() => new Set((data?.systemLinks ?? []).map((link) => link.systemId)), [data]);
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
      <EntityPageHeader
        breadcrumbs={[{ label: 'Dashboard', href: '/home' }, { label: 'Teams', href: '/teams' }, { label: data.name }]}
        title={data.name}
        description={`Team detail for ${data.code}. Manage membership, linked systems, and linked cloud products here.`}
        actions={
          session?.permissions.manageTeams ? (
            <Button
              color="red"
              variant="outline"
              onClick={async () => {
                await deleteTeam(data.id);
                window.location.href = '/teams';
              }}
            >
              Archive
            </Button>
          ) : null
        }
      />

      <TeamForm
        initialValue={data}
        onSubmit={async (value) => {
          await updateTeam(data.id, {
            ...value,
            members: data.members.map((member) => ({ userId: member.userId, roles: member.roles })),
          });
          await refetch();
        }}
        submitLabel="Update Team"
      />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Members</h2>
        {session?.permissions.manageTeams && (
          <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
            <Select
              searchable
              data={(users ?? []).map((user) => ({
                value: user.id,
                label: `${user.email} ${user.firstName ?? ''} ${user.lastName ?? ''}`,
              }))}
              value={memberUserId}
              onChange={setMemberUserId}
              label="User"
            />
            <TextInput
              label="Roles (comma-separated)"
              value={memberRoles}
              onChange={(event) => setMemberRoles(event.currentTarget.value)}
            />
            <div className="self-end">
              <Button
                disabled={!memberUserId}
                onClick={async () => {
                  if (!memberUserId) return;
                  const nextMembers = [
                    ...data.members
                      .filter((member) => member.userId !== memberUserId)
                      .map((member) => ({
                        userId: member.userId,
                        roles: member.roles,
                      })),
                    {
                      userId: memberUserId,
                      roles: memberRoles
                        .split(',')
                        .map((role) => role.trim())
                        .filter(Boolean),
                    },
                  ];
                  await updateTeamMembers(data.id, nextMembers);
                  setMemberUserId(null);
                  setMemberRoles('');
                  await refetch();
                }}
              >
                Save Member
              </Button>
            </div>
          </div>
        )}
        <ul className="list-disc pl-5">
          {data.members.map((member) => (
            <li key={member.userId} className="flex items-center gap-2">
              <span>
                {member.user?.email ?? member.userId} - {member.roles.join(', ') || 'No roles'}
              </span>
              {session?.permissions.manageTeams && (
                <Button
                  size="compact-xs"
                  variant="subtle"
                  color="red"
                  onClick={async () => {
                    await updateTeamMembers(
                      data.id,
                      data.members
                        .filter((item) => item.userId !== member.userId)
                        .map((item) => ({
                          userId: item.userId,
                          roles: item.roles,
                        })),
                    );
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
        <h2 className="text-lg font-semibold">Linked Systems</h2>
        {session?.permissions.manageTeams && (
          <div className="flex gap-2 items-end">
            <Select
              className="grow"
              searchable
              data={(systems ?? [])
                .filter((system) => !linkedSystemIds.has(system.id))
                .map((system) => ({ value: system.id, label: `${system.name} (${system.code})` }))}
              value={systemId}
              onChange={setSystemId}
              label="Attach System"
            />
            <Button
              disabled={!systemId}
              onClick={async () => {
                if (!systemId) return;
                await attachSystem(data.id, systemId);
                setSystemId(null);
                await refetch();
              }}
            >
              Attach
            </Button>
          </div>
        )}
        <ul className="list-disc pl-5">
          {data.systemLinks.map((link) => (
            <li key={link.id} className="flex items-center gap-2">
              <a className="underline" href={`/systems/${link.system.id}`}>
                {link.system.name}
              </a>
              {session?.permissions.manageTeams && (
                <Button
                  size="compact-xs"
                  variant="subtle"
                  color="red"
                  onClick={async () => {
                    await detachSystem(data.id, link.systemId);
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
        {session?.permissions.manageTeams && (
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
              {session?.permissions.manageTeams && (
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
        {session?.permissions.manageTeams && (
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
              {session?.permissions.manageTeams && (
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
