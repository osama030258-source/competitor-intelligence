'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { AnalysisLog, AnalysisOutput, ResearchOutput } from '@/lib/types';
import { StatusBadge } from './StatusBadge';
import { TierBadge } from './TierBadge';

interface IntelCardProps {
  log: AnalysisLog;
}

export function IntelCard({ log }: IntelCardProps) {
  const [expandedSection, setExpandedSection] = useState<'research' | 'analysis' | null>(null);

  const isLoading = log.status === 'researching' || log.status === 'analyzing';

  let researchData: ResearchOutput | null = null;
  let analysisData: AnalysisOutput | null = null;

  try {
    if (log.research_output) {
      researchData = JSON.parse(log.research_output);
    }
    if (log.analysis_output) {
      analysisData = JSON.parse(log.analysis_output);
    }
  } catch (e) {
    // Parse error, data remains null
  }

  const SkeletonLine = () => (
    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-full"></div>
  );

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{log.sector_keyword}</h3>
        <div className="flex gap-2">
          <StatusBadge status={log.status} />
          <TierBadge tier={log.category_tier} />
        </div>
      </div>

      {/* Timestamp */}
      <p className="text-sm text-gray-500 mb-4">
        {new Date(log.created_at).toLocaleDateString()} -{' '}
        {new Date(log.created_at).toLocaleTimeString()}
      </p>

      {/* Research Section */}
      <div className="mb-4 border-t pt-4">
        <button
          onClick={() =>
            setExpandedSection(expandedSection === 'research' ? null : 'research')
          }
          className="flex items-center justify-between w-full text-left hover:bg-gray-50 p-2 rounded transition"
        >
          <span className="font-semibold text-gray-800">Research Output</span>
          {expandedSection === 'research' ? (
            <ChevronUp size={20} />
          ) : (
            <ChevronDown size={20} />
          )}
        </button>

        {expandedSection === 'research' && (
          <div className="mt-3 ml-2 space-y-3 text-sm text-gray-700">
            {isLoading ? (
              <>
                <SkeletonLine />
                <SkeletonLine />
                <SkeletonLine />
              </>
            ) : researchData ? (
              <>
                <div>
                  <strong>Trends:</strong> {typeof researchData.competitor_trends === 'object' ? JSON.stringify(researchData.competitor_trends) : researchData.competitor_trends}
                </div>
                <div>
                  <strong>Market Size:</strong> {typeof researchData.market_size === 'object' ? JSON.stringify(researchData.market_size) : researchData.market_size}
                </div>
                <div>
                  <strong>Entry Barriers:</strong> {typeof researchData.entry_barriers === 'object' ? JSON.stringify(researchData.entry_barriers) : researchData.entry_barriers}
                </div>
                <div>
                  <strong>Top Players:</strong> {Array.isArray(researchData.top_players) ? researchData.top_players.join(', ') : (typeof researchData.top_players === 'object' ? JSON.stringify(researchData.top_players) : researchData.top_players)}
                </div>
                <div>
                  <strong>Opportunity:</strong> {typeof researchData.market_opportunity === 'object' ? JSON.stringify(researchData.market_opportunity) : researchData.market_opportunity}
                </div>
              </>
            ) : (
              <p className="text-gray-500">No research data available</p>
            )}
          </div>
        )}
      </div>

      {/* Analysis Section */}
      <div className="border-t pt-4">
        <button
          onClick={() =>
            setExpandedSection(expandedSection === 'analysis' ? null : 'analysis')
          }
          className="flex items-center justify-between w-full text-left hover:bg-gray-50 p-2 rounded transition"
        >
          <span className="font-semibold text-gray-800">Analysis & Recommendations</span>
          {expandedSection === 'analysis' ? (
            <ChevronUp size={20} />
          ) : (
            <ChevronDown size={20} />
          )}
        </button>

        {expandedSection === 'analysis' && (
          <div className="mt-3 ml-2 space-y-3 text-sm text-gray-700">
            {isLoading ? (
              <>
                <SkeletonLine />
                <SkeletonLine />
                <SkeletonLine />
              </>
            ) : analysisData ? (
              <>
                <div>
                  <strong>Tier:</strong> {analysisData.category_tier}
                </div>
                <div>
                  <strong>Rationale:</strong> {analysisData.rationale}
                </div>
                <div>
                  <strong>Recommendation 1:</strong> {typeof analysisData.recommendation_1 === 'object' ? JSON.stringify(analysisData.recommendation_1) : analysisData.recommendation_1}
                </div>
                <div>
                  <strong>Recommendation 2:</strong> {typeof analysisData.recommendation_2 === 'object' ? JSON.stringify(analysisData.recommendation_2) : analysisData.recommendation_2}
                </div>
                <div>
                  <strong>Recommendation 3:</strong> {typeof analysisData.recommendation_3 === 'object' ? JSON.stringify(analysisData.recommendation_3) : analysisData.recommendation_3}
                </div>
              </>
            ) : (
              <p className="text-gray-500">No analysis data available</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
