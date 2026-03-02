export function sanitizePlayerName(name: string): string {
  return name
    .trim()
    .slice(0, 50)
    .replace(/[<>]/g, '');
}

export function isValidProgress(progress: string, sentence: string): boolean {
  if (typeof progress !== 'string') return false;
  if (progress.length > sentence.length + 10) return false;
  return true;
}

export function isValidSessionId(sessionId: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(sessionId) && sessionId.length < 100;
}

export function isValidPlayerId(playerId: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(playerId) && playerId.length < 100;
}
