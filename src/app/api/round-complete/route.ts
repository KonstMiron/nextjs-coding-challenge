import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { clearCache } from "@/lib/cache";

export async function POST(request: NextRequest) {
  try {
    const { playerId, sessionId } = await request.json();

    if (!playerId || !sessionId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await prisma.playerSession.updateMany({
      where: {
        playerId,
        sessionId,
        isComplete: false,
      },
      data: {
        isComplete: true,
        completedAt: new Date(),
      },
    });

    clearCache(`player-stats-${playerId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error completing round:", error);
    return NextResponse.json(
      { error: "Failed to complete round" },
      { status: 500 }
    );
  }
}
