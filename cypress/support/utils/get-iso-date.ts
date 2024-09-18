export const getISODate = (): string => {
  const now = new Date();
  const vancouverTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Vancouver' }));
  return vancouverTime.toISOString();
};
