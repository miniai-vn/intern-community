export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  image: string | null;
  approvedSubmissions: number;
}

export interface LeaderboardResult {
  monthStartUtc: string;
  nextMonthStartUtc: string;
  generatedAtUtc: string;
  items: LeaderboardEntry[];
}
