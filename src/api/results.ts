import { apiClient } from './client';
import type { ResultsResponse } from './types';

export async function getResults(): Promise<ResultsResponse> {
  const response = await apiClient.get<ResultsResponse>('/results');
  return response.data;
}
