import { create } from "zustand";
import type { GameState, PlayerData } from "@/types/game";

interface GameStore {
  playerId: string | null;
  playerName: string | null;
  gameState: GameState | null;
  isLoading: boolean;
  error: string | null;
  setPlayerId: (id: string) => void;
  setPlayerName: (name: string) => void;
  setGameState: (state: GameState) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updatePlayer: (player: PlayerData) => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  playerId: typeof window !== 'undefined' ? localStorage.getItem('playerId') : null,
  playerName: typeof window !== 'undefined' ? localStorage.getItem('playerName') : null,
  gameState: null,
  isLoading: false,
  error: null,
  setPlayerId: (id) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('playerId', id);
    }
    set({ playerId: id });
  },
  setPlayerName: (name) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('playerName', name);
    }
    set({ playerName: name });
  },
  setGameState: (state) => set({ gameState: state }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  updatePlayer: (player) =>
    set((state) => {
      if (!state.gameState) return state;
      const updatedPlayers = state.gameState.players.map((p) =>
        p.id === player.id ? player : p
      );
      if (!updatedPlayers.find((p) => p.id === player.id)) {
        updatedPlayers.push(player);
      }
      return {
        gameState: {
          ...state.gameState,
          players: updatedPlayers,
        },
      };
    }),
  reset: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('playerId');
      localStorage.removeItem('playerName');
    }
    set({
      playerId: null,
      playerName: null,
      gameState: null,
      isLoading: false,
      error: null,
    });
  },
}));
