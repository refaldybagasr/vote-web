export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  username: string;
  role: UserRole;
}

export interface AuthResult {
  accessToken: string;
  user: User;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
  };
}

export interface Candidate {
  id: string;
  name: string;
}

export interface Vote {
  candidateId: string;
  candidateName: string;
  createdAt: string;
}

export interface VoteStatus {
  hasVoted: boolean;
  vote: Vote | null;
}

export type CastVoteRequest = { candidateId: string } | { name: string };
