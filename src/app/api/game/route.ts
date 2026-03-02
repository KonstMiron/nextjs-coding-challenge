import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getRandomSentence } from "@/lib/game-utils";
import { pusherServer } from "@/lib/pusher";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizePlayerName } from "@/lib/validation";

const ROUND_DURATION = 60;

let currentSession: {
  id: string;
  sentence: string;
  startTime: Date;
  endTime: Date;
} | null = null;

async function createNewSession() {
  const sentence = getRandomSentence();
  const startTime = new Date();
  const endTime = new Date(startTime.getTime() + ROUND_DURATION * 1000);

  const session = await prisma.gameSession.create({
    data: {
      sentence,
      startTime,
      endTime,
      duration: ROUND_DURATION,
    },
  });

  currentSession = {
    id: session.id,
    sentence: session.sentence,
    startTime: session.startTime,
    endTime: session.endTime,
  };

  setTimeout(async () => {
    await createNewSession();
    const newGameState = await getGameState();
    await pusherServer.trigger("typing-game", "new-round", newGameState);
  }, ROUND_DURATION * 1000);

  return session;
}

async function getCurrentSession() {
  if (!currentSession || new Date() > currentSession.endTime) {
    const session = await createNewSession();
    return session;
  }

  return prisma.gameSession.findUnique({
    where: { id: currentSession.id },
  });
}

async function getGameState() {
  const session = await getCurrentSession();
  if (!session) throw new Error("No active session");

  const playerSessions = await prisma.playerSession.findMany({
    where: { sessionId: session.id },
    include: { player: true },
  });

  const players = playerSessions.map((ps) => ({
    id: ps.playerId,
    name: ps.player.name,
    currentProgress: ps.currentProgress,
    wpm: ps.wpm,
    accuracy: ps.accuracy,
    isComplete: ps.isComplete,
    keystrokesTotal: ps.keystrokesTotal,
    keystrokesCorrect: ps.keystrokesCorrect,
  }));

  const now = new Date();
  const timeRemaining = Math.max(
    0,
    Math.floor((session.endTime.getTime() - now.getTime()) / 1000)
  );

  return {
    sessionId: session.id,
    sentence: session.sentence,
    startTime: session.startTime,
    endTime: session.endTime,
    duration: session.duration,
    timeRemaining,
    players,
  };
}

export async function GET() {
  try {
    const gameState = await getGameState();
    return NextResponse.json(gameState);
  } catch (error) {
    console.error("Error getting game state:", error);
    return NextResponse.json(
      { error: "Failed to get game state" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const rateLimitResponse = rateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { playerName } = await request.json();

    if (!playerName || typeof playerName !== "string") {
      return NextResponse.json(
        { error: "Player name is required" },
        { status: 400 }
      );
    }

    const sanitizedName = sanitizePlayerName(playerName);
    
    if (sanitizedName.length < 1) {
      return NextResponse.json(
        { error: "Player name must not be empty" },
        { status: 400 }
      );
    }

    let player = await prisma.player.findFirst({
      where: { name: sanitizedName },
    });

    if (!player) {
      player = await prisma.player.create({
        data: { name: sanitizedName },
      });
    }

    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { error: "No active session" },
        { status: 500 }
      );
    }

    let playerSession = await prisma.playerSession.findUnique({
      where: {
        playerId_sessionId: {
          playerId: player.id,
          sessionId: session.id,
        },
      },
    });

    if (!playerSession) {
      playerSession = await prisma.playerSession.create({
        data: {
          playerId: player.id,
          sessionId: session.id,
        },
        include: {
          player: true,
        },
      });

      const playerData = {
        id: player.id,
        name: player.name,
        currentProgress: "",
        wpm: 0,
        accuracy: 0,
        isComplete: false,
        keystrokesTotal: 0,
        keystrokesCorrect: 0,
      };

      await pusherServer.trigger("typing-game", "player-update", playerData);
    }

    const gameState = await getGameState();

    return NextResponse.json({ playerId: player.id, gameState });
  } catch (error) {
    console.error("Error joining game:", error);
    return NextResponse.json(
      { error: "Failed to join game" },
      { status: 500 }
    );
  }
}
