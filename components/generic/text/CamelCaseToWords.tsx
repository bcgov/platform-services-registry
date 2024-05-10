export const camelCaseToWords = (text: string) => {
  return text
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]+/g, ' ')
    .replace(/^[a-z]/, (char) => char.toUpperCase())
    .trim();
};
