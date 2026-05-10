export function normalizeRole(rawRole) {
  const value = String(rawRole || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (["administrador", "admin", "superadmin", "super admin"].includes(value)) {
    return "Administrador";
  }

  if (["adminagencia", "admin agencia", "admin de agencia"].includes(value)) {
    return "AdminAgencia";
  }

  if (["agente", "agent"].includes(value)) {
    return "Agente";
  }

  if (["cliente", "client", "usuario", "user"].includes(value)) {
    return "Cliente";
  }

  return value;
}

export function getDashboardRouteByRole(rawRole) {
  const role = normalizeRole(rawRole);

  if (role === "Administrador") return "/admin/dashboard";
  if (role === "AdminAgencia") return "/admin-agencia/dashboard";
  if (role === "Agente") return "/agente/dashboard";
  return "/cliente/dashboard";
}
