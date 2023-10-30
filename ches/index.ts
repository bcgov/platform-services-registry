import dotenv from 'dotenv';
dotenv.config();
import ChesService from './chesService';

export default new ChesService({
  tokenUrl: process.env.CHES_TOKEN_URL || 'default',
  clientId: process.env.CHES_CLIENT_ID || 'default',
  clientSecret: process.env.CHES_CLIENT_SECRET || 'default',
  apiUrl: process.env.CHES_API_URL || 'default',
});
