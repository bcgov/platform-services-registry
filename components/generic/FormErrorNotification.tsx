import { notifications } from '@mantine/notifications';
import { IconPoint } from '@tabler/icons-react';
import _startCase from 'lodash-es/startCase';
import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { numberToWords } from '@/utils/number';

const NUM_TO_DISPLAY = 5;

export default function FormErrorNotification() {
  const { formState } = useFormContext();

  useEffect(() => {
    const keys = Object.keys(formState.errors);
    if (keys.length > 0) {
      const keysToDisplay = keys.slice(0, NUM_TO_DISPLAY);
      const remaining = keys.length - NUM_TO_DISPLAY;

      notifications.show({
        color: 'red',
        title: 'Please correct the following errors in the form:',
        autoClose: 5000,
        message: (
          <ul className="text-red-500 list-disc">
            {keysToDisplay.map((key) => (
              <li key={key}>
                <IconPoint className="inline-block" />
                {_startCase(key)}
              </li>
            ))}
            {remaining > 0 && (
              <li key="remaining">
                <IconPoint className="inline-block" />
                and {numberToWords(remaining)} other errors.
              </li>
            )}
          </ul>
        ),
      });
    }
  }, [formState.submitCount, formState.errors]);

  return null;
}
