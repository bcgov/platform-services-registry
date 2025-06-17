'use client';

import { Button, Divider, Grid } from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { useState } from 'react';
import { createModal } from '@/core/modal';
import { formatDate, getDateFromYyyyMmDd } from '@/utils/js';

interface ModalProps {
  initialValue?: Date | null;
}

interface ModalState {
  date: Date | null;
}

export const openDatePickerModal = createModal<ModalProps, ModalState>({
  settings: {
    size: 'sm',
    title: 'Select Date Range',
    classNames: {
      content: 'overflow-y-visible',
    },
  },
  Component: function ({ initialValue, state, closeModal }) {
    const [value, setValue] = useState<Date | null>(initialValue ?? null);

    return (
      <>
        <div>
          <DatePicker
            value={value}
            onChange={(datestr) => setValue(datestr ? getDateFromYyyyMmDd(datestr) : new Date())}
            classNames={{ levelsGroup: 'mx-auto w-fit' }}
          />
        </div>

        <div className="flex justify-center">
          <div className="flex items-center space-x-2 text-gray-700">
            <span className="font-semibold">
              {value ? (
                formatDate(value, 'MMMM d, yyyy')
              ) : (
                <span className="font-medium text-gray-500 italic">unselected</span>
              )}
            </span>
          </div>
        </div>

        <Divider my="md" />

        <Grid>
          <Grid.Col span={4}>
            <Button
              color="warning"
              onClick={() => {
                setValue(null);
              }}
              className="mr-1"
            >
              Reset
            </Button>
          </Grid.Col>
          <Grid.Col span={8} className="text-right">
            <Button color="secondary" onClick={() => closeModal()} className="mr-1">
              Close
            </Button>
            <Button
              color="primary"
              onClick={() => {
                state.date = value;
                closeModal();
              }}
            >
              Select
            </Button>
          </Grid.Col>
        </Grid>
      </>
    );
  },
  onClose: () => {},
});
