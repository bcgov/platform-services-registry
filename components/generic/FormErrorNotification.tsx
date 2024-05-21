import { notifications } from '@mantine/notifications';
import { IconPoint } from '@tabler/icons-react';
import _get from 'lodash-es/get';
import React, { useEffect, ReactNode } from 'react';
import { useFormContext } from 'react-hook-form';

export default function FormErrorNotification() {
  const { formState } = useFormContext();

  useEffect(() => {
    const keys = Object.keys(formState.errors);
    if (keys.length > 0) {
      notifications.show({
        color: 'red',
        title: 'Please correct the following errors in the form:',
        autoClose: 5000,
        message: (
          <ul className="text-red-500 list-disc">
            {keys.map((key) => (
              <li key={key}>
                <IconPoint className="inline-block" />
                {_get(formState.errors, `${key}.message`) as ReactNode}
              </li>
            ))}
          </ul>
        ),
      });
    }
  }, [formState.submitCount]);

  return null;
}
