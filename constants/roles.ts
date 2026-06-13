export const ROLES = {
  PATIENT: "patient",
  ADMIN: "admin",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<UserRole, string> = {
  patient: "Patient",
  admin: "Admin",
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  patient: "I want to understand my prescriptions, track medicines, and check safety.",
  admin: "System administrator with full access.",
};
