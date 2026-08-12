export const PERMISSION_DEFS = [
  { key: "invite_members", label: "Invite campaign managers" },
  { key: "edit_account_template", label: "Edit account template" },
  { key: "manage_brand", label: "Edit brand brain" },
  { key: "manage_features", label: "Edit features" },
  { key: "manage_billing", label: "Manage billing" },
  { key: "manage_publish_time", label: "Change publish time" },
  { key: "regenerate_company_code", label: "Regenerate company code" },
] as const;

export type PermissionKey = (typeof PERMISSION_DEFS)[number]["key"];

export type Permissions = Partial<Record<PermissionKey, boolean>>;
