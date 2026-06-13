export const ROUTES = {
  // Public
  HOME: "/",
  FEATURES: "/features",
  HOW_IT_WORKS: "/how-it-works",
  PRICING: "/pricing",
  ABOUT: "/about",
  CONTACT: "/contact",
  PRIVACY_POLICY: "/privacy-policy",
  TERMS: "/terms",

  // Auth
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  ONBOARDING: "/onboarding",

  // Patient
  PATIENT_DASHBOARD: "/patient",
  PATIENT_UPLOAD: "/patient/prescriptions/new",
  PATIENT_PRESCRIPTIONS: "/patient/prescriptions",
  PATIENT_PRESCRIPTION_DETAIL: (id: string) => `/patient/prescriptions/${id}`,
  PATIENT_SCHEDULE: "/patient/schedule",
  PATIENT_MEDICINES: "/patient/medicines",
  PATIENT_BLOOD_REPORTS: "/patient/blood-report",
  PATIENT_AI_ASSISTANT: "/patient/ai-assistant",
  PATIENT_SETTINGS: "/patient/settings",

  // Admin
  ADMIN_DASHBOARD: "/admin",
  ADMIN_USERS: "/admin/users",
  ADMIN_API_LOGS: "/admin/api-logs",
  ADMIN_MEDICINE_CACHE: "/admin/medicine-cache",
} as const;
