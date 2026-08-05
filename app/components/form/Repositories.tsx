import { Button, Group, Radio, Stack, Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import HookFormTextInput from '@/components/generic/input/HookFormTextInput';

function getHasRepositoriesRadioValue(value: boolean | null | undefined): 'yes' | 'no' | '' {
  if (value === true) {
    return 'yes';
  }

  if (value === false) {
    return 'no';
  }

  return '';
}

export default function Repositories({
  disabled,
}: Readonly<{
  disabled?: boolean;
}>) {
  const { control, watch } = useFormContext();

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'repositories',
  });
  const hasRepositories = watch('hasRepositories');

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
        <Controller
          name="hasRepositories"
          control={control}
          render={({ field, fieldState }) => (
            <Radio.Group
              label="Does this product have repositories?"
              value={getHasRepositoriesRadioValue(field.value)}
              error={fieldState.error?.message}
              onChange={(value) => {
                const hasRepositoriesValue = value === 'yes';
                field.onChange(hasRepositoriesValue);
                if (!hasRepositoriesValue) {
                  replace([]);
                }
              }}
            >
              <Group mt="xs">
                <Radio value="yes" label="Yes" disabled={disabled} />
                <Radio value="no" label="No" disabled={disabled} />
              </Group>
            </Radio.Group>
          )}
        />
        <Text>Repositories may be hosted on any Git hosting service. Repository URLs must be valid and use HTTPS.</Text>
      </Stack>

      {hasRepositories === true && fields.length > 0 && (
        <div className="mb-3 grid grid-cols-[1fr_auto] gap-4 border-b pb-2 font-semibold">
          <Text fw={600}>Repository URL</Text>
          {!disabled && <Text fw={600}>Action</Text>}
        </div>
      )}

      {hasRepositories === true && (
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-[1fr_auto] items-start gap-4 border-b pb-3">
              <HookFormTextInput
                name={`repositories.${index}.url`}
                placeholder="https://git-host.example/bcgov/repository"
                disabled={disabled}
                error="Enter a valid B.C. government repository URL"
              />

              {!disabled && (
                <Button type="button" color="red" onClick={() => remove(index)}>
                  Delete
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {!disabled && hasRepositories === true && (
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

      {disabled && fields.length === 0 && hasRepositories === true && (
        <Text c="dimmed" fs="italic">
          No repositories have been added.
        </Text>
      )}
    </div>
  );
}
