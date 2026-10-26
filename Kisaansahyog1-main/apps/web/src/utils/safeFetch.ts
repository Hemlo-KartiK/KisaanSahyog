export interface SafeFetchResult<T> {
  ok: boolean;
  data: T;
  source: 'live' | 'fallback';
  fetchedAt: number;
  error?: string;
}

export async function safeFetch<T>(
  url: string,
  options: RequestInit = {},
  fallbackData: T,
  timeoutMs: number = 1500,
): Promise<SafeFetchResult<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        ok: false,
        data: fallbackData,
        source: 'fallback',
        fetchedAt: Date.now(),
        error: `HTTP ${response.status}`,
      };
    }

    const result = (await response.json()) as T;
    return {
      ok: true,
      data: result,
      source: 'live',
      fetchedAt: Date.now(),
    };
  } catch (err) {
    clearTimeout(timeoutId);
    const errorMessage =
      err instanceof Error ? err.message : 'Unknown network error';
    return {
      ok: false,
      data: fallbackData,
      source: 'fallback',
      fetchedAt: Date.now(),
      error: errorMessage,
    };
  }
}
