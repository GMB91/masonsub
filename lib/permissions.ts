export type Role = "system_admin" | "admin" | "manager" | "contractor" | "client" | null;

export const can = {
  viewAdmin: (r: Role) => r === "admin" || r === "system_admin",
  viewSystem: (r: Role) => r === "system_admin",
  editUsers: (r: Role) => r === "admin" || r === "system_admin",
  editClaimants: (r: Role) => r === "admin" || r === "system_admin" || r === "manager",
  viewFinancials: (r: Role) => r === "admin" || r === "system_admin",
  manageWorkflows: (r: Role) => r === "admin" || r === "system_admin",
  accessSystemTools: (r: Role) => r === "admin" || r === "system_admin",
  viewAuditLogs: (r: Role) => r === "admin" || r === "system_admin",
};

export function getUserRole(): Role {
  // This will be populated from Supabase auth context
  // For now, return a default for development
  if (typeof window === "undefined") return null;
  
  const role = localStorage.getItem("user_role") as Role;
  return role || "admin"; // Default to admin for testing
}

export function hasPermission(user: any, key?: string): boolean {
  if (!user) return false;
  
  const role = user.role || user.user_metadata?.role;
  
  // Admin and system_admin have all permissions
  if (role === "admin" || role === "system_admin") return true;
  
  // If no specific permission key, allow
  if (!key) return true;
  
  // Check specific permission
  return Boolean(user.permissions?.[key]);
}

export function checkPermission(permission: keyof typeof can, role?: Role): boolean {
  const userRole = role || getUserRole();
  return can[permission](userRole);
}
