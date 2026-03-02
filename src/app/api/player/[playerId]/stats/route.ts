import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCached, setCache } from "@/lib/cache";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ playerId: string }> }
) {
  try {
    const { playerId } = await params;

    const cacheKey = `player-stats-${playerId}`;
    const cached = getCached(cacheKey);
    
    if (cached) {
      return NextResponse.json(cached);
    }

    const player = await prisma.player.findUnique({
      where: { id: playerId },
      include: {
        sessions: {
          where: {
            isComplete: true,
          },
          orderBy: {
            completedAt: "desc",
          },
          take: 10,
        },
      },
    });

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    const completedSessions = player.sessions.filter((s) => s.isComplete);

    const stats = {
      totalGames: completedSessions.length,
      avgWpm:
        completedSessions.length > 0
          ? completedSessions.reduce((sum: number, s) => sum + s.wpm, 0) /
            completedSessions.length
          : 0,
      avgAccuracy:
        completedSessions.length > 0
          ? completedSessions.reduce((sum: number, s) => sum + s.accuracy, 0) /
            completedSessions.length
          : 0,
      bestWpm:
        completedSessions.length > 0
          ? Math.max(...completedSessions.map((s) => s.wpm))
          : 0,
      recentSessions: completedSessions,
    };

    setCache(cacheKey, stats);
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error getting player stats:", error);
    return NextResponse.json(
      { error: "Failed to get player stats" },
      { status: 500 }
    );
  }
}
