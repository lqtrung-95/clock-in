export const MOTIVATIONAL_MESSAGES = [
  "Every minute counts. Keep going!",
  "You're building momentum. Stay focused!",
  "Small steps, big results. Keep tracking!",
  "Consistency beats intensity. You've got this!",
  "Your future self will thank you for this effort.",
  "Progress, not perfection. You're doing great!",
  "The time will pass anyway. Invest it wisely!",
  "Focus is a muscle. You're getting stronger!",
  "One more session. One more step forward.",
  "Great work today! Every effort matters.",
] as const;

/** Get a message based on current streak or random */
export function getMotivationalMessage(streak: number): string {
  if (streak >= 30) return "30+ day streak! You're unstoppable!";
  if (streak >= 7) return "Week-long streak! Keep the momentum!";
  if (streak >= 3) return "3-day streak! You're on fire!";
  const idx = Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length);
  return MOTIVATIONAL_MESSAGES[idx];
}
