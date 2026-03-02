import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { calculateWPM, calculateAccuracy } from "@/lib/game-utils";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const rateLimitResponse = rateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { playerId, sessionId, currentProgress } = await request.json();

    if (!playerId || !sessionId || typeof currentProgress !== "string") {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    const playerSession = await prisma.playerSession.findUnique({
      where: {
        playerId_sessionId: {
          playerId,
          sessionId,
        },
      },
      include: {
        session: true,
        player: true,
      },
    });

    if (!playerSession) {
      return NextResponse.json(
        { error: "Player session not found" },
        { status: 404 }
      );
    }

    const sentence = playerSession.session.sentence;
    const oldProgress = playerSession.currentProgress;
    const newChar = currentProgress[currentProgress.length - 1];
    const expectedChar = sentence[currentProgress.length - 1];

    const keystrokesTotal = playerSession.keystrokesTotal + 1;
    const keystrokesCorrect =
      playerSession.keystrokesCorrect + (newChar === expectedChar ? 1 : 0);

    const correctChars = currentProgress
      .split("")
      .filter((char, idx) => char === sentence[idx]).length;

    const timeElapsed =
      (new Date().getTime() - playerSession.session.startTime.getTime()) / 1000;

    const wpm = calculateWPM(correctChars, timeElapsed);
    const accuracy = calculateAccuracy(keystrokesCorrect, keystrokesTotal);
    const isComplete = currentProgress === sentence;

    const updatedSession = await prisma.playerSession.update({
      where: {
        playerId_sessionId: {
          playerId,
          sessionId,
        },
      },
      data: {
        currentProgress,
        wpm,
        accuracy,
        keystrokesTotal,
        keystrokesCorrect,
        isComplete,
        completedAt: isComplete ? new Date() : null,
      },
      include: {
        player: true,
      },
    });

    const playerData = {
      id: playerId,
      name: updatedSession.player.name,
      currentProgress: updatedSession.currentProgress,
      wpm: updatedSession.wpm,
      accuracy: updatedSession.accuracy,
      isComplete: updatedSession.isComplete,
      keystrokesTotal: updatedSession.keystrokesTotal,
      keystrokesCorrect: updatedSession.keystrokesCorrect,
    };

    await pusherServer.trigger("typing-game", "player-update", playerData);

    return NextResponse.json(playerData);
  } catch (error) {
    console.error("Error updating progress:", error);
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    );
  }
}
