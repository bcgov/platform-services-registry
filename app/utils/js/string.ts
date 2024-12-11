export function capitalizeFirstLetter(name: string) {
  const words = name.split(' ');
  const capitalizedWords = words.map((word) => {
    if (word.length > 0) {
      return word[0].toUpperCase() + word.slice(1);
    }
    return word;
  });
  const result = capitalizedWords.join(' ');

  return result;
}

export function extractNumbers(inputString: string) {
  if (!inputString) return [];

  const pattern = /\d+(?:_\d+)?/g;
  const matches = inputString.match(pattern);

  if (matches) {
    const numbers = matches.map((match) => parseFloat(match.replace(/_/g, '.')));
    return numbers;
  }

  return [];
}

export function isEmail(email: string) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function camelCaseToWords(text: string) {
  return text
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]+/g, ' ')
    .replace(/^[a-z]/, (char) => char.toUpperCase())
    .trim();
}
