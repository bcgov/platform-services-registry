export function wrapAsync(fn: () => void) {
  Promise.resolve().then(() => fn());
}
