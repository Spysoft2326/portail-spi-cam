export const Role = {
  PUBLIC: 'PUBLIC',
  AGENT_SAISIE: 'AGENT_SAISIE',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN'
} as const;

export type Role = typeof Role[keyof typeof Role];

export const ROLES_HIERARCHY: Record<Role, number> = {
  PUBLIC: 0,
  AGENT_SAISIE: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
};

export function hasRole(userRole: Role, requiredRole: Role): boolean {
  return ROLES_HIERARCHY[userRole] >= ROLES_HIERARCHY[requiredRole];
}

export function canAccess(userRole: Role, minRole: Role): boolean {
  return hasRole(userRole, minRole);
}

// Permissions spécifiques
export const PERMISSIONS = {
  // Consultation
  VIEW_PUBLIC: [Role.PUBLIC, Role.AGENT_SAISIE, Role.ADMIN, Role.SUPER_ADMIN],
  VIEW_ENTERPRISE_DETAILS: [Role.AGENT_SAISIE, Role.ADMIN, Role.SUPER_ADMIN],
  VIEW_PRODUCTION_DATA: [Role.ADMIN, Role.SUPER_ADMIN],
  VIEW_DASHBOARD: [Role.AGENT_SAISIE, Role.ADMIN, Role.SUPER_ADMIN],

  // Saisie
  CREATE_PRODUCTION: [Role.AGENT_SAISIE, Role.ADMIN, Role.SUPER_ADMIN],
  EDIT_OWN_PRODUCTION: [Role.AGENT_SAISIE, Role.ADMIN, Role.SUPER_ADMIN],

  // Validation
  VALIDATE_DATA: [Role.ADMIN, Role.SUPER_ADMIN],
  REJECT_DATA: [Role.ADMIN, Role.SUPER_ADMIN],

  // Gestion entreprises
  CREATE_ENTERPRISE: [Role.ADMIN, Role.SUPER_ADMIN],
  EDIT_ENTERPRISE: [Role.ADMIN, Role.SUPER_ADMIN],
  DELETE_ENTERPRISE: [Role.SUPER_ADMIN],

  // Notes de conjoncture
  WRITE_NOTE: [Role.ADMIN, Role.SUPER_ADMIN],
  PUBLISH_NOTE: [Role.SUPER_ADMIN],

  // Administration
  MANAGE_USERS: [Role.SUPER_ADMIN],
  VIEW_AUDIT_LOGS: [Role.SUPER_ADMIN],
  CONFIGURE_SYSTEM: [Role.SUPER_ADMIN],
  EXPORT_DATA: [Role.SUPER_ADMIN],
} as const;

export function hasPermission(userRole: Role, permission: keyof typeof PERMISSIONS): boolean {
  return PERMISSIONS[permission].includes(userRole);
}
