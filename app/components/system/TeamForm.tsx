'use client';

import { Button, TextInput, Textarea } from '@mantine/core';
import { useState } from 'react';
import { TeamBody } from '@/validation-schemas/team';
import { parseJsonField, stringifyJsonField } from './shared';

export default function TeamForm({
  initialValue,
  onSubmit,
  submitLabel = 'Save',
}: {
  initialValue?: Partial<TeamBody>;
  onSubmit: (value: TeamBody) => Promise<void>;
  submitLabel?: string;
}) {
  const [name, setName] = useState(initialValue?.name ?? '');
  const [code, setCode] = useState(initialValue?.code ?? '');
  const [description, setDescription] = useState(initialValue?.description ?? '');
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
            metadata: parseJsonField(metadata),
            rules: parseJsonField(rules),
            policies: parseJsonField(policies),
            mappings: parseJsonField(mappings),
            members: initialValue?.members ?? [],
          });
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Unable to save team');
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
