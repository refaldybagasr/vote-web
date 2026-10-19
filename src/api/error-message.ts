import { isAxiosError } from 'axios';
import type { ApiErrorBody } from './types';

const FRIENDLY_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: 'Incorrect username or password.',
  RATE_LIMITED: 'Too many attempts. Please wait a moment and try again.',
  ALREADY_VOTED: 'You already voted for someone else.',
  CANDIDATE_NOT_FOUND: 'That candidate no longer exists. Please pick another one.',
};

const FALLBACK_MESSAGE = 'Something went wrong. Please try again.';

export function getErrorMessage(error: unknown): string {
  if (isAxiosError<ApiErrorBody>(error) && error.response?.data?.error) {
    const { code, message } = error.response.data.error;
    return FRIENDLY_MESSAGES[code] ?? message ?? FALLBACK_MESSAGE;
  }
  return FALLBACK_MESSAGE;
}
