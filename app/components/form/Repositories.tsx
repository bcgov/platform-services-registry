import { Button, Stack, Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import HookFormTextInput from '@/components/generic/input/HookFormTextInput';

export default function Repositories({ disabled }: { disabled?: boolean }) {
  const { control } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'repositories',
  });
  console.log('fields', fields);
  return (
    <div>
      <Stack gap="sm" mb="lg">
        <Text>
          Add the source-code, infrastructure, and GitOps repositories associated with this product. Repository
          information is not required, but{' '}
          <Text span fw={600}>
            highly recommended
          </Text>
          .
        </Text>

        <Text>
          Repositories may be hosted on GitHub, Bitbucket or GitLab hosting service. Repository URLs must use HTTPS and
          belong to the{' '}
          <Text span fw={600}>
            bcgov, bcgov-c, or bc-gov
          </Text>{' '}
          organization.
        </Text>
      </Stack>

      {fields.length > 0 && (
        <div className="mb-3 grid grid-cols-[1fr_auto] gap-4 border-b pb-2 font-semibold">
          <Text fw={600}>Repository URL</Text>
          {!disabled && <Text fw={600}>Action</Text>}
        </div>
      )}

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-[1fr_auto] items-start gap-4 border-b pb-3">
            <HookFormTextInput
              name={`repositories.${index}.url`}
              placeholder="https://git-host.example/bcgov/repository"
              disabled={disabled}
              error="Enter a valid BC Government repository URL"
            />

            {!disabled && (
              <Button type="button" color="red" onClick={() => remove(index)}>
                Delete
              </Button>
            )}
          </div>
        ))}
      </div>

      {!disabled && (
        <Button
          type="button"
          color="green"
          leftSection={<IconPlus size={18} />}
          className="mt-4"
          onClick={() => append({ url: '' })}
        >
          Add repository
        </Button>
      )}

      {disabled && fields.length === 0 && (
        <Text c="dimmed" fs="italic">
          No repositories have been added.
        </Text>
      )}
    </div>
  );
}
