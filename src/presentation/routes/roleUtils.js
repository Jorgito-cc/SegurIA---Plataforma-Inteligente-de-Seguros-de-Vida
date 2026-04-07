export function normalizeRole(rawRole) {
  const value = String(rawRole || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (['administrador', 'admin', 'superadmin', 'super admin'].includes(value)) {
    return 'administrador';
  }

  if (['agente', 'agent'].includes(value)) {
    return 'agente';
  }

  if (['cliente', 'client', 'usuario', 'user'].includes(value)) {
    return 'cliente';
  }

  return value;
}

export function getDashboardRouteByRole(rawRole) {
  const role = normalizeRole(rawRole);

  if (role === 'administrador') return '/admin/dashboard';
  if (role === 'agente') return '/agente/dashboard';
  return '/cliente/dashboard';
}
