export function normalizeUsername(username: string): string {
  return username.normalize("NFKC").trim();
}

export function usernamePath(username: string): string {
  return `/${encodeURIComponent(normalizeUsername(username))}`;
}
