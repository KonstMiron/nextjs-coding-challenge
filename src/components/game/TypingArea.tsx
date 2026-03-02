"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface TypingAreaProps {
  sentence: string;
  onProgress: (progress: string) => void;
  disabled?: boolean;
  sessionId?: string;
}

export function TypingArea({ sentence, onProgress, disabled, sessionId }: TypingAreaProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const lastSessionIdRef = useRef<string | undefined>(sessionId);

  useEffect(() => {
    if (sessionId && sessionId !== lastSessionIdRef.current) {
      setInput("");
      lastSessionIdRef.current = sessionId;
    }
  }, [sessionId]);

  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= sentence.length) {
      setInput(value);
      onProgress(value);
    }
  };

  const renderSentence = () => {
    return sentence.split("").map((char, idx) => {
      let className = "text-gray-400";
      
      if (idx < input.length) {
        className = input[idx] === char ? "text-green-600" : "text-red-600";
      }
      
      if (idx === input.length) {
        className += " bg-blue-200";
      }

      return (
        <span key={idx} className={className}>
          {char}
        </span>
      );
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Type the sentence below</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-muted rounded-lg font-mono text-lg leading-relaxed min-h-[100px]">
          {renderSentence()}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          disabled={disabled}
          placeholder="Start typing..."
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-lg ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      </CardContent>
    </Card>
  );
}
