/**
 * Recommender module for stacksnap.
 * Provides functionality to analyze project configurations and recommend
 * appropriate dev container snapshots and tooling.
 */
export { recommendSnapshot, formatRecommendations } from './recommendSnapshot';
export type { RecommendationResult, ToolRecommendation, RecommendationRule } from './types';
