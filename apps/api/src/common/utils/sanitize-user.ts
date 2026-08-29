export function sanitizeUser<T extends { passwordHash?: string | null }>(
  user: T,
) {
  const { passwordHash, ...safe } = user;
  return safe;
}
