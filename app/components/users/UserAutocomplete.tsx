import { Combobox, Loader, Avatar, Group, Text, TextInput, useCombobox, Badge } from '@mantine/core';
import { User } from '@prisma/client';
import { IconSearch } from '@tabler/icons-react';
import _throttle from 'lodash-es/throttle';
import { useRef, useState } from 'react';
import { formatFullName } from '@/helpers/user';
import { searchUsers } from '@/services/backend/users';

function UserOption({ data }: { data: User }) {
  return (
    <Group gap="sm">
      <Avatar src={data.image} size={36} radius="xl" />
      <div>
        <Text size="sm">{formatFullName(data)}</Text>
        <Text size="xs" opacity={0.5}>
          {data.email}
        </Text>
      </div>
    </Group>
  );
}

function UserOptionDetail({ data }: { data: User }) {
  return (
    <Group gap="sm">
      <Avatar src={data.image} size={56} radius="xl" />
      <div>
        {data.jobTitle && (
          <Text size="sm" tt="uppercase" c="dimmed">
            {data.jobTitle} {data.officeLocation && <span>/ {data.officeLocation}</span>}
          </Text>
        )}
        <Text size="md" className="font-semibold">
          {formatFullName(data)}
          {data.ministry && (
            <Badge color="dark" variant="light" className="ml-1">
              {data.ministry}
            </Badge>
          )}
        </Text>
        <Text size="sm" opacity={0.5}>
          {data.email}
        </Text>
      </div>
    </Group>
  );
}

export default function UserAutocomplete({ onSelect }: { onSelect: (user?: User) => void }) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<User[]>([]);
  const [value, setValue] = useState<User>();
  const [searching, setSearching] = useState(false);
  const throttled = useRef(_throttle((query: string) => searchUsers(query), 500, { trailing: true }));

  const fetchOptions = (query: string) => {
    setLoading(true);

    throttled
      .current(query)
      ?.then((result) => {
        setData(result.data);
        setLoading(false);
      })
      .catch(() => {});
  };

  const options = (data || []).map((item) => (
    <Combobox.Option value={item.id} key={item.id}>
      <UserOption data={item} />
    </Combobox.Option>
  ));

  return (
    <Combobox
      onOptionSubmit={(optionValue) => {
        const selected = data.find((v) => v.id === optionValue);
        setValue(selected);
        onSelect(selected);
        setSearching(false);
        combobox.closeDropdown();
      }}
      withinPortal={false}
      store={combobox}
      floatingStrategy="fixed"
    >
      <Combobox.Target>
        <div>
          <TextInput
            label=""
            placeholder="Enter email..."
            className="w-full"
            value={value ? value.email : undefined}
            onChange={(event) => {
              const searchKey = event.currentTarget.value;
              const selected = data.find((v) => v.id === searchKey);
              setValue(selected);
              fetchOptions(searchKey);
              combobox.resetSelectedOption();
              combobox.openDropdown();
            }}
            onClick={() => combobox.openDropdown()}
            onFocus={() => {
              setSearching(true);
              combobox.openDropdown();
            }}
            onMouseDown={() => setSearching(true)}
            onBlur={() => combobox.closeDropdown()}
            rightSection={loading ? <Loader size={18} /> : <IconSearch size={18} />}
          />
          {value && !searching && (
            <div className="mt-2 p-3 border-1 border-slate-200 rounded-sm">
              <UserOptionDetail data={value} />
            </div>
          )}
        </div>
      </Combobox.Target>

      {data?.length ? (
        <Combobox.Dropdown className="max-h-80 overflow-y-scroll z-50">
          <Combobox.Options>{options}</Combobox.Options>
        </Combobox.Dropdown>
      ) : (
        <Combobox.Dropdown className="">
          <Combobox.Options>
            <Combobox.Empty>No results found</Combobox.Empty>
          </Combobox.Options>
        </Combobox.Dropdown>
      )}
    </Combobox>
  );
}
