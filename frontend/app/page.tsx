'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { AnalysisLog, TierType } from '@/lib/types';
import { runAgents, getStatus, getHistory } from '@/lib/api';
import { IntelCard } from '@/components/IntelCard';

const TIERS: TierType[] = [
  'High Growth Market',
  'Niche/Saturated',
  'Strategic Pivot Required',
];

export default function Home() {
  const [sector, setSector] = useState('');
  const [logs, setLogs] = useState<AnalysisLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState<TierType | null>(null);
  const [keywordFilter, setKeywordFilter] = useState('');
  const [pollingIds, setPollingIds] = useState<Set<string>>(new Set());

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  // Polling effect
  useEffect(() => {
    if (pollingIds.size === 0) return;

    const interval = setInterval(async () => {
      const updated = await Promise.all(
        Array.from(pollingIds).map((id) => getStatus(id))
      );

      setLogs((prev) => {
        const newLogs = [...prev];
        updated.forEach((updatedLog) => {
          const index = newLogs.findIndex((l) => l.id === updatedLog.id);
          if (index >= 0) {
            newLogs[index] = updatedLog;
          }
        });
        return newLogs;
      });

      // Stop polling for completed or failed logs
      const stillPolling = new Set(pollingIds);
      updated.forEach((log) => {
        if (log.status === 'completed' || log.status === 'failed') {
          stillPolling.delete(log.id);
        }
      });
      setPollingIds(stillPolling);
    }, 3000);

    return () => clearInterval(interval);
  }, [pollingIds]);

  const loadHistory = async () => {
    try {
      const history = await getHistory(selectedTier || undefined, keywordFilter || undefined);
      setLogs(history);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const handleRunAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sector.trim()) return;

    setLoading(true);
    try {
      const result = await runAgents(sector);
      const newLog: AnalysisLog = {
        id: result.log_id,
        sector_keyword: sector,
        status: 'pending',
        research_output: null,
        analysis_output: null,
        category_tier: null,
        created_at: new Date().toISOString(),
        completed_at: null,
      };

      setLogs((prev) => [newLog, ...prev]);
      setPollingIds((prev) => new Set([...prev, result.log_id]));
      setSector('');
    } catch (error) {
      console.error('Failed to run analysis:', error);
      alert('Failed to start analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTierFilter = (tier: TierType | null) => {
    setSelectedTier(tier);
  };

  const handleKeywordFilter = (keyword: string) => {
    setKeywordFilter(keyword);
  };

  // Apply filters client-side
  const filteredLogs = logs.filter((log) => {
    const tierMatch = !selectedTier || log.category_tier === selectedTier;
    const keywordMatch =
      !keywordFilter ||
      log.sector_keyword.toLowerCase().includes(keywordFilter.toLowerCase());
    return tierMatch && keywordMatch;
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Competitor Intelligence
          </h1>
          <p className="text-gray-600">
            Analyze market sectors with AI-powered research and strategic insights
          </p>
        </div>

        {/* Input Section */}
        <form
          onSubmit={handleRunAnalysis}
          className="bg-white rounded-lg shadow-md p-6 mb-8"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              placeholder="Enter sector (e.g., Fintech, Healthcare, E-commerce)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !sector.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Running...' : 'Run Analysis'}
            </button>
          </div>
        </form>

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Filters</h2>

          {/* Tier Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Tier:
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleTierFilter(null)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedTier === null
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                All
              </button>
              {TIERS.map((tier) => (
                <button
                  key={tier}
                  onClick={() => handleTierFilter(tier)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    selectedTier === tier
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          {/* Keyword Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search by Keyword:
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                value={keywordFilter}
                onChange={(e) => handleKeywordFilter(e.target.value)}
                placeholder="Search sectors..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Analysis Results
            {filteredLogs.length > 0 && (
              <span className="text-gray-500 ml-2">({filteredLogs.length})</span>
            )}
          </h2>

          {filteredLogs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-600 text-lg">
                {logs.length === 0
                  ? 'No analyses yet. Run one to get started!'
                  : 'No results match your filters.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredLogs.map((log) => (
                <IntelCard key={log.id} log={log} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
