export interface ToolRecommendation {
  tool: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

export interface RecommendationResult {
  snapshot_id: string;
  generated_at: string;
  recommendations: ToolRecommendation[];
  score_before: number;
  estimated_score_after: number;
}

export interface RecommendationRule {
  id: string;
  description: string;
  check: (tools: Record<string, string | null>) => ToolRecommendation | null;
}
