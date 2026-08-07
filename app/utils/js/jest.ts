import { convert } from 'html-to-text';
import _castArray from 'lodash-es/castArray';

const normalizeText = (v: string) =>
  v
    .toLowerCase()
    .trim()
    .replace(/[\n\r]/g, ' ');

export function compareEmailText(html: string, targets: string | string[]) {
  const converted = normalizeText(convert(html));
  let pass = true;
  let message = '';

  targets = _castArray(targets);
  targets.forEach((target) => {
    target = normalizeText(target);
    if (!converted.includes(target)) {
      pass = false;
      message = `expected <<${target}>> in <<${converted}>>`;
      console.log(message);
      return false;
    }
  });

  return {
    message: () => message,
    pass,
  };
}

export function emailTextContaining(targets: string | string[]) {
  return {
    asymmetricMatch(received: unknown): boolean {
      if (typeof received !== 'string') {
        return false;
      }

      return compareEmailText(received, targets).pass;
    },

    toString(): string {
      return 'emailTextContaining';
    },

    getExpectedType(): string {
      return 'string';
    },

    toAsymmetricMatcher(): string {
      return `emailTextContaining(${JSON.stringify(targets)})`;
    },
  };
}
