import { apiClient } from './client';
import type { CastVoteRequest, Candidate, Vote, VoteStatus } from './types';

export async function listCandidates(): Promise<Candidate[]> {
  const response = await apiClient.get<Candidate[]>('/candidates');
  return response.data;
}

export async function createCandidate(name: string): Promise<Candidate> {
  const response = await apiClient.post<Candidate>('/candidates', { name });
  return response.data;
}

export async function getMyVoteStatus(): Promise<VoteStatus> {
  const response = await apiClient.get<VoteStatus>('/votes/me');
  return response.data;
}

export async function castVote(request: CastVoteRequest): Promise<Vote> {
  const response = await apiClient.post<Vote>('/votes', request);
  return response.data;
}
