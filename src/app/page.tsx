"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { JoinGameForm } from "@/components/game/JoinGameForm";
import { TypingArea } from "@/components/game/TypingArea";
import { PlayersTable } from "@/components/game/PlayersTable";
import { Timer } from "@/components/game/Timer";
import { Button } from "@/components/ui/Button";
import { useGameStore } from "@/store/gameStore";
import { usePusher } from "@/hooks/usePusher";

export default function GamePage() {
  const {
    playerId,
    playerName,
    gameState,
    isLoading,
    error,
    setPlayerId,
    setPlayerName,
    setGameState,
    setLoading,
    setError,
    reset,
  } = useGameStore();

  const { gameState: pusherGameState, isConnected } = usePusher("typing-game");
  const [lastProgressUpdate, setLastProgressUpdate] = useState(0);
  const lastSessionIdRef = useRef<string | null>(null);
  const [playerStats, setPlayerStats] = useState<{
    totalGames: number;
    avgWpm: number;
    avgAccuracy: number;
    bestWpm: number;
    recentSessions: Array<{
      wpm: number;
      accuracy: number;
      completedAt: string | null;
      isComplete: boolean;
    }>;
  } | null>(null);

  useEffect(() => {
    if (pusherGameState) {
      const isNewRound = pusherGameState.sessionId !== lastSessionIdRef.current;
      setGameState(pusherGameState);
      
      if (isNewRound && playerId && playerName) {
        lastSessionIdRef.current = pusherGameState.sessionId;
        
        const isPlayerInSession = pusherGameState.players.some((p) => p.id === playerId);
        
        if (!isPlayerInSession) {
          fetch("/api/game", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ playerName }),
          }).catch((err) => {
            console.error("Failed to join new round:", err);
          });
        }
      }
    }
  }, [pusherGameState, playerId, playerName, setGameState]);

  useEffect(() => {
    const loadGameState = async () => {
      if (playerId && !gameState) {
        try {
          const response = await fetch("/api/game");
          if (response.ok) {
            const data = await response.json();
            setGameState(data);
          }
        } catch (err) {
          console.error("Failed to load game state:", err);
        }
      }
    };
    loadGameState();
  }, [playerId, gameState, setGameState]);

  useEffect(() => {
    const loadPlayerStats = async () => {
      if (playerId) {
        try {
          const response = await fetch(`/api/player/${playerId}/stats`);
          if (response.ok) {
            const data = await response.json();
            setPlayerStats(data);
          }
        } catch (err) {
          console.error("Failed to load player stats:", err);
        }
      }
    };
    loadPlayerStats();
  }, [playerId, gameState?.sessionId]);

  const handleJoinGame = async (name: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName: name }),
      });

      if (!response.ok) {
        throw new Error("Failed to join game");
      }

      const data = await response.json();
      setPlayerId(data.playerId);
      setPlayerName(name);
      setGameState(data.gameState);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join game");
    } finally {
      setLoading(false);
    }
  };

  const handleProgress = useCallback(
    async (progress: string) => {
      if (!playerId || !gameState) return;

      const now = Date.now();
      if (now - lastProgressUpdate < 100) return;
      setLastProgressUpdate(now);

      try {
        await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            playerId,
            sessionId: gameState.sessionId,
            currentProgress: progress,
          }),
        });
      } catch (err) {
        console.error("Failed to update progress:", err);
      }
    },
    [playerId, gameState, lastProgressUpdate]
  );

  const handleNewRound = useCallback(async () => {
    if (playerId && gameState?.sessionId) {
      try {
        await fetch("/api/round-complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            playerId,
            sessionId: gameState.sessionId,
          }),
        });
      } catch (err) {
        console.error("Failed to complete round:", err);
      }
    }
  }, [playerId, gameState?.sessionId]);

  if (!playerId || !playerName) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl space-y-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">TypeRace Competition</h1>
            <p className="text-muted-foreground">
              Test your typing speed against other players in real-time!
            </p>
          </div>
          <JoinGameForm onJoin={handleJoinGame} isLoading={isLoading} />
          {error && (
            <div className="text-center text-red-600 text-sm">{error}</div>
          )}
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Loading game...</div>
          {!isConnected && (
            <div className="text-sm text-muted-foreground mt-2">
              Connecting to server...
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="text-center relative">
          <h1 className="text-4xl font-bold mb-2">TypeRace Competition</h1>
          <p className="text-muted-foreground">
            Welcome, {playerName}! {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
          </p>
          <Button 
            onClick={reset} 
            variant="outline" 
            className="absolute top-0 right-0 text-sm"
          >
            Leave Game
          </Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Timer endTime={new Date(gameState.endTime)} onTimeUp={handleNewRound} />
            <TypingArea
              sentence={gameState.sentence}
              onProgress={handleProgress}
              disabled={false}
              sessionId={gameState.sessionId}
            />
          </div>

          <div className="space-y-6">
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Current Round</h3>
              <div className="space-y-1 text-sm">
                {(() => {
                  const myStats = gameState.players.find((p) => p.id === playerId);
                  if (!myStats) return <div className="text-muted-foreground">No stats yet</div>;
                  return (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">WPM:</span>
                        <span className="font-semibold">{Math.round(myStats.wpm)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Accuracy:</span>
                        <span className="font-semibold">{(myStats.accuracy * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Progress:</span>
                        <span className="font-semibold">{myStats.currentProgress.length}/{gameState.sentence.length}</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Your History</h3>
              {playerStats && playerStats.totalGames > 0 ? (
                <div className="space-y-3">
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Games Played:</span>
                      <span className="font-semibold">{playerStats.totalGames}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Best WPM:</span>
                      <span className="font-semibold">{Math.round(playerStats.bestWpm)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg WPM:</span>
                      <span className="font-semibold">{Math.round(playerStats.avgWpm)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg Accuracy:</span>
                      <span className="font-semibold">{(playerStats.avgAccuracy * 100).toFixed(1)}%</span>
                    </div>
                  </div>

                  {playerStats.recentSessions.length > 0 && (
                    <div className="pt-3 border-t">
                      <h4 className="text-sm font-medium mb-2">Recent Games</h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {playerStats.recentSessions.slice(0, 5).map((session, idx) => (
                          <div
                            key={idx}
                            className="text-xs bg-muted/50 rounded p-2 flex justify-between items-center"
                          >
                            <div className="flex gap-3">
                              <span className="font-medium">{Math.round(session.wpm)} WPM</span>
                              <span className="text-muted-foreground">
                                {(session.accuracy * 100).toFixed(0)}%
                              </span>
                            </div>
                            {session.completedAt && (
                              <span className="text-muted-foreground">
                                {new Date(session.completedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Complete a round to see your stats!
                </p>
              )}
            </div>
          </div>
        </div>

        <PlayersTable players={gameState.players} currentPlayerId={playerId} />
      </div>
    </div>
  );
}
