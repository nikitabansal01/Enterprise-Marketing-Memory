export type StudioRole = 'admin' | 'brand' | 'marketer'

export type RoleDefinition = {
  id: StudioRole
  label: string
  short: string
  initials: string
  focus: string
  canCreate: boolean
  canApprove: boolean
  canManageWorkspace: boolean
  canManageConnectors: boolean
  canManageMemory: boolean
  canComment: boolean
}

export const STUDIO_ROLES: RoleDefinition[] = [
  {
    id: 'admin',
    label: 'Company Admin',
    short: 'Admin',
    initials: 'CA',
    focus: 'Workspace, governance, and enterprise memory',
    canCreate: true,
    canApprove: true,
    canManageWorkspace: true,
    canManageConnectors: true,
    canManageMemory: true,
    canComment: true,
  },
  {
    id: 'brand',
    label: 'Brand Lead',
    short: 'Brand',
    initials: 'BL',
    focus: 'Approve brand fit and protect voice',
    canCreate: false,
    canApprove: true,
    canManageWorkspace: false,
    canManageConnectors: false,
    canManageMemory: false,
    canComment: true,
  },
  {
    id: 'marketer',
    label: 'Marketer',
    short: 'Marketer',
    initials: 'MK',
    focus: 'Create campaigns on the canvas',
    canCreate: true,
    canApprove: false,
    canManageWorkspace: false,
    canManageConnectors: false,
    canManageMemory: false,
    canComment: true,
  },
]

export function roleById(id: StudioRole): RoleDefinition {
  return STUDIO_ROLES.find((role) => role.id === id) ?? STUDIO_ROLES[2]
}
