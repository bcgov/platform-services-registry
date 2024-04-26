import axios from 'axios';
import { instance as baseInstance } from '../axios';

export const instance = axios.create({
  ...baseInstance.defaults,
  baseURL: `${baseInstance.defaults.baseURL}/private-cloud`,
});
