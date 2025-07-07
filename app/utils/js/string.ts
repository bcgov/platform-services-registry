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

export function replaceString(input: string, searchString: string, replacementString: string) {
  const escapedSearchString = searchString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escapedSearchString, 'g');
  return input.replace(regex, replacementString);
}

export function styleObjectToString(style: Record<string, string>): string {
  return Object.entries(style)
    .map(([key, value]) => {
      const kebabKey = key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
      return `${kebabKey}: ${value};`;
    })
    .join(' ');
}

export function replaceClassNameToStyleObject(
  input: string,
  styleCallback: (className: string) => Record<string, string>,
) {
  const regex = /className\s*=\s*"([^"]*)"/;

  return input.replace(regex, (match, className) => {
    const styleObject = styleCallback(className);
    return `style={${JSON.stringify(styleObject)}}`;
  });
}

export function replaceClassToStyleString(input: string, styleCallback: (className: string) => Record<string, string>) {
  const regex = /class\s*=\s*"([^"]*)"/g;

  return input.replace(regex, (match, className) => {
    const styleObject = styleCallback(className);
    return `style="${styleObjectToString(styleObject)}"`;
  });
}

// remove trailing slashes from a URL
export function normalizeUrl(url: string): string {
  let end = url.length;
  while (end > 0 && url[end - 1] === '/') {
    end--;
  }
  return url.slice(0, end);
}

export function decodeEscapedNewlines(input: string): string {
  return input.replace(/\\n/g, '\n');
}
