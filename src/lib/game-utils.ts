export const SENTENCES = [
  "The quick brown fox jumps over the lazy dog and runs away into the forest.",
  "Technology has revolutionized the way we communicate and share information across the globe.",
  "Practice makes perfect when learning to type faster and more accurately every day.",
  "A journey of a thousand miles begins with a single step forward.",
  "Programming is the art of telling another human what one wants the computer to do.",
  "The best time to plant a tree was twenty years ago and the second best time is now.",
  "Success is not final and failure is not fatal but the courage to continue is what counts.",
  "Innovation distinguishes between a leader and a follower in any field of work.",
  "The only way to do great work is to love what you do every single day.",
  "Life is what happens when you are busy making other plans for the future.",
];

export function getRandomSentence(): string {
  return SENTENCES[Math.floor(Math.random() * SENTENCES.length)];
}

export function calculateWPM(
  correctChars: number,
  timeElapsedSeconds: number
): number {
  if (timeElapsedSeconds === 0) return 0;
  const words = correctChars / 5;
  const minutes = timeElapsedSeconds / 60;
  return Math.round(words / minutes);
}

export function calculateAccuracy(
  correctKeystrokes: number,
  totalKeystrokes: number
): number {
  if (totalKeystrokes === 0) return 1;
  return correctKeystrokes / totalKeystrokes;
}
