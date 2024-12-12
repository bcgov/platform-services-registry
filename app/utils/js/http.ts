export async function fetchWithTimeout(
  resource: RequestInfo,
  init?: RequestInit & { body?: BodyInit | null | undefined; headers?: HeadersInit | undefined },
  options?: { timeout: number },
) {
  const { timeout = 5000 } = options ?? {};

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const response = await fetch(resource, {
    ...(init ?? {}),
    signal: controller.signal,
  });

  clearTimeout(id);

  return response;
}
