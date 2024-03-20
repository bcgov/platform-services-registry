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
  const pattern = /\d+(?:_\d+)?/g;
  const matches = inputString.match(pattern);

  if (matches) {
    const numbers = matches.map((match) => parseFloat(match.replace(/_/g, '.')));
    return numbers;
  }
  return [];
}
