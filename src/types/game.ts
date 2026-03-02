export type PlayerData = {
  id: string;
  name: string;
  currentProgress: string;
  wpm: number;
  accuracy: number;
  isComplete: boolean;
  keystrokesTotal: number;
  keystrokesCorrect: number;
};

export type GameState = {
  sessionId: string;
  sentence: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  timeRemaining: number;
  players: PlayerData[];
};

export type UpdatePlayerProgress = {
  playerId: string;
  sessionId: string;
  currentProgress: string;
  wpm: number;
  accuracy: number;
  keystrokesTotal: number;
  keystrokesCorrect: number;
};
