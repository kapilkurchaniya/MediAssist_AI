export const RISK_LEVELS = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
} as const;

export type RiskLevel = (typeof RISK_LEVELS)[keyof typeof RISK_LEVELS];

export const RISK_THRESHOLDS = {
  LOW: 25,
  MEDIUM: 50,
  HIGH: 75,
  CRITICAL: 100,
} as const;

export const RISK_LABELS: Record<RiskLevel, string> = {
  low: "Low Risk",
  medium: "Medium Risk",
  high: "High Risk",
  critical: "Critical Risk",
};

export const RISK_COLORS: Record<RiskLevel, { text: string; bg: string; border: string }> = {
  low: {
    text: "text-success",
    bg: "bg-success-light",
    border: "border-success",
  },
  medium: {
    text: "text-warning",
    bg: "bg-warning-light",
    border: "border-warning",
  },
  high: {
    text: "text-danger",
    bg: "bg-danger-light",
    border: "border-danger",
  },
  critical: {
    text: "text-red-900",
    bg: "bg-red-50",
    border: "border-red-900",
  },
};

export function calculateRiskLevel(score: number): RiskLevel {
  if (score <= RISK_THRESHOLDS.LOW) return RISK_LEVELS.LOW;
  if (score <= RISK_THRESHOLDS.MEDIUM) return RISK_LEVELS.MEDIUM;
  if (score <= RISK_THRESHOLDS.HIGH) return RISK_LEVELS.HIGH;
  return RISK_LEVELS.CRITICAL;
}

export const RISK_SCORE_FACTORS = {
  MISSING_DOSAGE: 10,
  UNKNOWN_MEDICINE: 10,
  DUPLICATE_MEDICINE: 15,
  MODERATE_INTERACTION: 20,
  HIGH_RISK_INTERACTION: 35,
  LOW_OCR_CONFIDENCE: 10,
  ALLERGY_CONFLICT: 15,
} as const;
