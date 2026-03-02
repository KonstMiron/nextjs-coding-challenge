"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";

interface TimerProps {
  endTime: Date;
  onTimeUp?: () => void;
}

export function Timer({ endTime, onTimeUp }: TimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const remaining = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000));
      setTimeRemaining(remaining);
      
      if (remaining === 0 && onTimeUp) {
        onTimeUp();
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [endTime, onTimeUp]);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center">
          <div className="text-sm text-muted-foreground mb-2">Time Remaining</div>
          <div className="text-4xl font-bold tabular-nums">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
