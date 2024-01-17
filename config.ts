export const APP_ENV = process.env.APP_ENV || 'localdev';
export const IS_LOCAL = APP_ENV === 'localdev';
export const IS_DEV = APP_ENV === 'dev';
export const IS_TEST = APP_ENV === 'test';
export const IS_PROD = APP_ENV === 'prod';
export const EMAIL_PREFIX = IS_PROD ? '' : `[${process.env.APP_ENV}] `;
export const DEPLOYMENT_TAG = process.env.DEPLOYMENT_TAG || 'local';
