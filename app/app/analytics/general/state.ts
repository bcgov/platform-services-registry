import { EventType } from '@prisma/client';
import { proxy } from 'valtio';
import { deepClone } from 'valtio/utils';
import { LoginSearchBody } from '@/validation-schemas/logins';

const initialValue = {
  types: [EventType.LOGIN],
  dates: [new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString(), new Date().toISOString()],
  userId: '',
};

export const pageState = proxy<LoginSearchBody>(deepClone(initialValue));
