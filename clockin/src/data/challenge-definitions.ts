export interface ChallengeDefinition {
  key: string;
  name: string;
  description: string;
  target_minutes: number;
  period: "daily" | "weekly";
}

export const DAILY_CHALLENGES: ChallengeDefinition[] = [
  { key: "daily_1h", name: "One Hour Focus", description: "Log at least 1 hour today", target_minutes: 60, period: "daily" },
  { key: "daily_2h", name: "Two Hour Push", description: "Log at least 2 hours today", target_minutes: 120, period: "daily" },
  { key: "daily_4h", name: "Half Day Hero", description: "Log at least 4 hours today", target_minutes: 240, period: "daily" },
];

export const WEEKLY_CHALLENGES: ChallengeDefinition[] = [
  { key: "weekly_10h", name: "Steady Week", description: "Log 10 hours this week", target_minutes: 600, period: "weekly" },
  { key: "weekly_20h", name: "Productive Week", description: "Log 20 hours this week", target_minutes: 1200, period: "weekly" },
  { key: "weekly_40h", name: "Full-time Focus", description: "Log 40 hours this week", target_minutes: 2400, period: "weekly" },
];
