export type StatusType = 'pending' | 'researching' | 'analyzing' | 'completed' | 'failed';
export type TierType = 'High Growth Market' | 'Niche/Saturated' | 'Strategic Pivot Required';

export interface AnalysisLog {
  id: string;
  sector_keyword: string;
  status: StatusType;
  research_output: string | null;
  analysis_output: string | null;
  category_tier: TierType | null;
  created_at: string;
  completed_at: string | null;
}

export interface ResearchOutput {
  competitor_trends: string;
  market_size: string;
  entry_barriers: string;
  top_players: string;
  market_opportunity: string;
}

export interface AnalysisOutput {
  category_tier: TierType;
  recommendation_1: string;
  recommendation_2: string;
  recommendation_3: string;
  rationale: string;
}
