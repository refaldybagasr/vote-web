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
