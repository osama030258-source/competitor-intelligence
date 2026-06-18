import axios from 'axios';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api$/, '')
  : 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Run Analysis
export async function runAgents(sector: string) {
  const response = await apiClient.post('/api/agents/run', { sector });
  return response.data;
}

// Check Status
export async function getStatus(logId: string) {
  const response = await apiClient.get(`/api/agents/status/${logId}`);
  return response.data;
}

// Get History
export async function getHistory(tier?: string, keyword?: string) {
  const params = new URLSearchParams();
  if (tier) params.append('tier', tier);
  if (keyword) params.append('keyword', keyword);

  const url = `/api/agents/history${params.toString() ? '?' + params.toString() : ''}`;
  const response = await apiClient.get(url);
  return response.data;
}

export default apiClient;
