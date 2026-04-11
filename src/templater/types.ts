export interface TemplateVariable {
  key: string;
  description: string;
  defaultValue?: string;
}

export interface SnapshotTemplate {
  id: string;
  name: string;
  description: string;
  tags: string[];
  requiredTools: string[];
  variables: TemplateVariable[];
  createdAt: string;
}

export interface ApplyTemplateResult {
  matched: string[];
  missing: string[];
  applied: boolean;
}
