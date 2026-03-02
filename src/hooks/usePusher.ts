"use client";

import { useEffect, useState } from "react";
import { pusherClient } from "@/lib/pusher";
import type { PlayerData, GameState } from "@/types/game";

export function usePusher(channelName: string) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const channel = pusherClient.subscribe(channelName);

    channel.bind("pusher:subscription_succeeded", () => {
      setIsConnected(true);
    });

    channel.bind("game-state-update", (data: GameState) => {
      setGameState(data);
    });

    channel.bind("player-update", (data: PlayerData) => {
      setGameState((prev) => {
        if (!prev) return prev;
        const updatedPlayers = prev.players.map((p) =>
          p.id === data.id ? data : p
        );
        if (!updatedPlayers.find((p) => p.id === data.id)) {
          updatedPlayers.push(data);
        }
        return { ...prev, players: updatedPlayers };
      });
    });

    channel.bind("new-round", (data: GameState) => {
      setGameState(data);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [channelName]);

  return { gameState, isConnected };
}
