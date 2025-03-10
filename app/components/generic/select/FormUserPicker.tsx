'use client';

import { randomId } from '@mantine/hooks';
import { User } from '@prisma/client';
import _kebabCase from 'lodash-es/kebabCase';
import { useState } from 'react';
import { openUserPickerModal } from '@/components/modal/userPicker';
import UserProfile, { UserPickerData } from '@/components/users/UserProfile';
import { cn } from '@/utils/js';
import Label from '../Label';

export interface FormUserPickerProps {
  id?: string;
  label?: string;
  onChange: (value?: User | null) => void;
  value?: User;
  disabled?: boolean;
  classNames?: {
    wrapper?: string;
    label?: string;
  };
}

export default function FormUserPicker({
  id,
  label,
  classNames,
  onChange,
  value,
  disabled = false,
}: FormUserPickerProps) {
  const [user, setUser] = useState<User | null>(value ?? null);
  if (!id) id = randomId();

  return (
    <div className={cn(classNames?.wrapper)}>
      {label && (
        <Label htmlFor={id} className={classNames?.label}>
          {label}
        </Label>
      )}

      <div className="flex">
        <UserProfile
          data={user as UserPickerData}
          text="Click to select user"
          onClick={async () => {
            const { state } = await openUserPickerModal({ initialValue: user }, { initialState: { user } });
            setUser(state.user ?? null);
            onChange(state.user ?? null);
          }}
        />
      </div>
    </div>
  );
}
