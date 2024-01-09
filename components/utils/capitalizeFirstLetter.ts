export const capitalizeFirstLetter = (name: string): string => {
  const words = name.split(' ');
  const capitalizedWords = words.map((word) => {
    if (word.length > 0) {
      return word[0].toUpperCase() + word.slice(1);
    }
    return word;
  });
  const result = capitalizedWords.join(' ');

  return result;
};
