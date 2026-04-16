export interface ExpiryRule {
  maxAgeDays: number;
  applyToCategories?: string[];
}

export interface ExpiryResult {
  expired: string[];
  kept: string[];
  totalChecked: number;
}
