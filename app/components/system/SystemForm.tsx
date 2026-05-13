'use client';

import { Button, Select, TextInput, Textarea } from '@mantine/core';
import { useState } from 'react';
import { SystemStatus } from '@/prisma/client';
import { useAppState } from '@/states/global';
import { SystemBody } from '@/validation-schemas/system';
import { parseJsonField, stringifyJsonField } from './shared';

export default function SystemForm({
  initialValue,
  onSubmit,
  submitLabel = 'Save',
}: {
  initialValue?: Partial<SystemBody>;
  onSubmit: (value: SystemBody) => Promise<void>;
  submitLabel?: string;
}) {
  const [, appSnapshot] = useAppState();
  const [name, setName] = useState(initialValue?.name ?? '');
  const [code, setCode] = useState(initialValue?.code ?? '');
  const [description, setDescription] = useState(initialValue?.description ?? '');
  const [status, setStatus] = useState<SystemStatus>((initialValue?.status as SystemStatus) ?? SystemStatus.ACTIVE);
  const [organizationId, setOrganizationId] = useState<string | null>(initialValue?.organizationId ?? null);
  const [metadata, setMetadata] = useState(stringifyJsonField(initialValue?.metadata));
  const [rules, setRules] = useState(stringifyJsonField(initialValue?.rules));
  const [policies, setPolicies] = useState(stringifyJsonField(initialValue?.policies));
  const [mappings, setMappings] = useState(stringifyJsonField(initialValue?.mappings));
  const [error, setError] = useState('');

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        try {
          setError('');
          await onSubmit({
            name,
            code,
            description,
            status,
            organizationId,
            metadata: parseJsonField(metadata),
            rules: parseJsonField(rules),
            policies: parseJsonField(policies),
            mappings: parseJsonField(mappings),
          });
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Unable to save system');
        }
      }}
    >
      <TextInput label="Name" value={name} onChange={(event) => setName(event.currentTarget.value)} required />
      <TextInput label="Code" value={code} onChange={(event) => setCode(event.currentTarget.value)} required />
      <Textarea
        label="Description"
        value={description ?? ''}
        onChange={(event) => setDescription(event.currentTarget.value)}
        minRows={2}
      />
      <Select
        label="Status"
        data={Object.values(SystemStatus)}
        value={status}
        onChange={(value) => setStatus((value as SystemStatus) ?? SystemStatus.ACTIVE)}
      />
      <Select
        label="Organization"
        clearable
        searchable
        data={(appSnapshot.info?.ORGANIZATIONS ?? []).map((org) => ({
          value: org.id,
          label: `${org.code} - ${org.name}`,
        }))}
        value={organizationId}
        onChange={setOrganizationId}
      />
      <Textarea
        label="Metadata (JSON)"
        value={metadata}
        onChange={(event) => setMetadata(event.currentTarget.value)}
        minRows={4}
      />
      <Textarea
        label="Rules (JSON)"
        value={rules}
        onChange={(event) => setRules(event.currentTarget.value)}
        minRows={4}
      />
      <Textarea
        label="Policies (JSON)"
        value={policies}
        onChange={(event) => setPolicies(event.currentTarget.value)}
        minRows={4}
      />
      <Textarea
        label="Mappings (JSON)"
        value={mappings}
        onChange={(event) => setMappings(event.currentTarget.value)}
        minRows={4}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}
