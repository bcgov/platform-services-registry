import { randomId } from '@mantine/hooks';
import { hideNotification, showNotification } from '@mantine/notifications';
import _isPlainObject from 'lodash-es/isPlainObject';
import _isString from 'lodash-es/isString';
import React from 'react';
import CopyableButton from '../generic/button/CopyableButton';
import { TimedRingProgress } from './TimedRingProgress';

export function success({ title = 'Success', message = 'Successfully completed!', autoClose = true } = {}) {
  const id = randomId();

  const color = 'success';

  showNotification({
    id,
    color,
    title,
    message,
    icon: autoClose && <TimedRingProgress color={color} duration={3000} onFinish={() => hideNotification(id)} />,
    autoClose: false,
  });
}

function processErrorMessage(error: any) {
  let title = '';
  let message = '';

  const copyButton = (
    <CopyableButton value={JSON.stringify(error.response.data.error)} updateContent className="text-sm text-red-500">
      Click to copy the details.
    </CopyableButton>
  );

  if (_isString(error.response.data.error)) {
    title = error.response.statusText;
    message = 'An unexpected error has occurred.';
  } else if (_isPlainObject(error.response.data.error)) {
    if (error.response.data.error.name === 'ZodError') {
      title = 'Form Validation Error';
      message = `${error.response.data.error.issues.length} error(s)`;
    } else {
      title = error.response.statusText;
    }
  }

  return {
    title,
    message: (
      <>
        <div>{message}</div>
        <div>{copyButton}</div>
      </>
    ),
  };
}

export function failure({
  title = 'Failure',
  message = 'Failed!',
  error,
  autoClose = false,
}: {
  title?: string;
  message?: React.ReactNode;
  error?: Error;
  autoClose?: boolean;
} = {}) {
  const id = randomId();

  if (error) {
    const ret = processErrorMessage(error);
    title = ret.title;
    message = ret.message;
  }

  const color = 'danger';

  showNotification({
    id,
    color,
    title,
    message,
    icon: autoClose && <TimedRingProgress color={color} duration={5000} onFinish={() => hideNotification(id)} />,
    autoClose: false,
  });
}
