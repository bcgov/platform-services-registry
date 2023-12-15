export const EMAIL_PREFIX = (process.env.APP_ENV || 'localdev') === 'prod' ? '' : `[${process.env.APP_ENV}] `;
