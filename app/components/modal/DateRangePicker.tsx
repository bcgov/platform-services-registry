'use client';

import { Button, Divider, Grid } from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { useState } from 'react';
import { createModal } from '@/core/modal';
import { formatDate } from '@/utils/js';
import { getDateFromYyyyMmDd } from '@/utils/js';

interface ModalProps {
  allowSingleDate?: boolean;
  initialValue?: [Date | null, Date | null];
}

interface ModalState {
  dates: [Date | null, Date | null];
}

export const openDateRangePickerModal = createModal<ModalProps, ModalState>({
  settings: {
    size: 'sm',
    title: 'Select Date Range',
    classNames: {
      content: 'overflow-y-visible',
    },
  },
  Component: function ({ allowSingleDate, initialValue, state, closeModal }) {
    const [value, setValue] = useState<[Date | null, Date | null]>(initialValue ?? [null, null]);

    const dateCount = value.filter(Boolean).length;
    return (
      <>
        <div>
          <DatePicker
            type="range"
            value={value}
            onChange={(datestr) => {
              if (datestr[0] && datestr[1]) {
                setValue([getDateFromYyyyMmDd(datestr[0]), getDateFromYyyyMmDd(datestr[1])]);
              } else if (datestr[0]) {
                setValue([getDateFromYyyyMmDd(datestr[0]), null]);
              } else {
                setValue([null, null]);
              }
            }}
            classNames={{ levelsGroup: 'mx-auto w-fit' }}
          />
        </div>

        <div className="flex justify-center">
          <div className="flex items-center space-x-2 text-gray-700">
            <span className="font-semibold">
              {value[0] ? (
                formatDate(value[0], 'MMMM d, yyyy')
              ) : (
                <span className="font-medium text-gray-500 italic">unselected</span>
              )}
            </span>
            <span>-</span>
            <span className="font-semibold">
              {value[1] ? (
                formatDate(value[1], 'MMMM d, yyyy')
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
                setValue([null, null]);
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
                state.dates = value;
                closeModal();
              }}
              disabled={!allowSingleDate && dateCount === 1}
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
