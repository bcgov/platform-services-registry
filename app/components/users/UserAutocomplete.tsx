import { Combobox, Loader, Avatar, Group, Text, TextInput, useCombobox, Badge } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import _throttle from 'lodash-es/throttle';
import { useRef, useState, ReactNode } from 'react';
import { formatFullName } from '@/helpers/user';
import { getUserImageData } from '@/helpers/user-image';
import { searchMSUsers } from '@/services/backend/msgraph';
import { SearchedUser } from '@/types/user';

function UserOption({ data }: { data: SearchedUser }) {
  return (
    <Group gap="sm">
      <Avatar src={getUserImageData(data.image)} size={36} radius="xl" />
      <div>
        <Text size="sm">{formatFullName(data)}</Text>
        <Text size="xs" opacity={0.5}>
          {data.email}
        </Text>
      </div>
    </Group>
  );
}

function UserOptionDetail({ data }: { data: SearchedUser }) {
  return (
    <Group gap="sm">
      <Avatar src={getUserImageData(data.image)} size={56} radius="xl" />
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

export default function UserAutocomplete({
  onSelect,
  initialValue,
}: {
  onSelect: (user?: SearchedUser) => void;
  initialValue?: SearchedUser | null;
}) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SearchedUser[]>([]);
  const [value, setValue] = useState<SearchedUser>();
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const throttled = useRef(
    _throttle(
      async (query: string) => {
        setLoading(true);
        const result = await searchMSUsers(query);
        setData(result.data);
        setLoading(false);
        return result.data;
      },
      500,
      { trailing: true },
    ),
  );

  const fetchOptions = (query: string) => {
    throttled.current(query);
  };

  const options = (data || []).map((item) => (
    <Combobox.Option value={item.id} key={item.id}>
      <UserOption data={item} />
    </Combobox.Option>
  ));

  let selectedUser: ReactNode = null;

  if (searched) {
    if (!searching && value) {
      selectedUser = (
        <div className="mt-2 p-3 border-1 border-slate-200 rounded-sm">
          <UserOptionDetail data={value} />
        </div>
      );
    }
  } else if (initialValue) {
    selectedUser = (
      <div className="mt-2 p-3 border-1 border-slate-200 rounded-sm">
        <UserOptionDetail data={initialValue} />
      </div>
    );
  }

  return (
    <Combobox
      onOptionSubmit={(optionValue) => {
        const selected = data.find((v) => v.id === optionValue);
        if (selected) {
          setValue(selected);
          onSelect(selected);
        }

        setSearching(false);
        combobox.closeDropdown();
      }}
      withinPortal={false}
      store={combobox}
      floatingStrategy="fixed"
    >
      <Combobox.Target>
        <div className="email-input">
          <TextInput
            label=""
            placeholder="Enter email..."
            className="w-full"
            value={value ? value.email : undefined}
            onChange={(event) => {
              const searchKey = event.currentTarget.value;
              const selected = data.find((v) => v.id === searchKey);
              if (selected) {
                setValue(selected);
              }

              fetchOptions(searchKey);
              setSearched(true);
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
          {selectedUser}
        </div>
      </Combobox.Target>

      {loading || data?.length === 0 ? (
        <Combobox.Dropdown className="">
          <Combobox.Options>
            <Combobox.Empty>No results found</Combobox.Empty>
          </Combobox.Options>
        </Combobox.Dropdown>
      ) : (
        <Combobox.Dropdown className="max-h-80 overflow-y-scroll z-50">
          <Combobox.Options>{options}</Combobox.Options>
        </Combobox.Dropdown>
      )}
    </Combobox>
  );
}
