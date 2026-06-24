/** Normalize access/refresh tokens from CCC API envelopes (`data` wrapper or flat). */
export function unwrapAuthTokens(
  payload: unknown,
): { accessToken: string; refreshToken: string } | null {
  if (!payload || typeof payload !== 'object') return null;

  const pick = (record: Record<string, unknown>) => {
    const accessToken = record.accessToken ?? record.access_token;
    const refreshToken = record.refreshToken ?? record.refresh_token;
    if (typeof accessToken === 'string' && typeof refreshToken === 'string') {
      return { accessToken, refreshToken };
    }
    return null;
  };

  const root = payload as Record<string, unknown>;
  const top = pick(root);
  if (top) return top;

  const nested = root.data;
  if (nested && typeof nested === 'object') {
    return pick(nested as Record<string, unknown>);
  }

  return null;
}
