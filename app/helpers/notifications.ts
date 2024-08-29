import { notifications, NotificationData } from '@mantine/notifications';
import _isPlainObject from 'lodash-es/isPlainObject';
import _isString from 'lodash-es/isString';

export function showSuccessNotification(message: string, data: Partial<NotificationData> = {}) {
  notifications.show({
    color: 'green',
    title: 'Success',
    message,
    autoClose: 5000,
    ...data,
  });
}

export function showErrorNotification(error: any, prefix = '', data: Partial<NotificationData> = {}) {
  let message = prefix;

  if (_isString(error.response.data.error)) {
    message += error.response.data.error;
  } else if (_isPlainObject(error.response.data.error)) {
    if (error.response.data.error.name === 'ZodError') {
      message += 'Form Validation Error';
    }
  }

  notifications.show({
    color: 'red',
    title: 'Error',
    message,
    autoClose: 5000,
    ...data,
  });
}
