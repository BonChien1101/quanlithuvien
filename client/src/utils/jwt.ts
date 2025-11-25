export function parseJwt(token: string): { roles: string[] } {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    const rolesRaw = decoded.roles || [];
    if (Array.isArray(rolesRaw)) return { roles: rolesRaw as string[] };
    return { roles: [] };
  } catch {
    return { roles: [] };
  }
}
