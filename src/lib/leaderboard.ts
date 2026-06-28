// NOTE: All code must stay in English, even when requirements arrive in Spanish.

export type LeaderboardEntry = {
  wallet: string;
  displayName: string;
  cornPerHour: number;
  playerLevel: number;
  unlockedRows: number;
  isFounder: boolean;
  updatedAt: number;
};

export type LeaderboardPrizeTier = {
  rankMin: number;
  rankMax: number;
  prizeLabel: string;
  prizeCorn: number;
};

export const LEADERBOARD_STORE_FILE = "leaderboard.json";

/** Weekly prizes for top producers (paid from treasury at season end). */
export const WEEKLY_PRIZE_TIERS: LeaderboardPrizeTier[] = [
  { rankMin: 1, rankMax: 1, prizeLabel: "1st place", prizeCorn: 300_000 },
  { rankMin: 2, rankMax: 2, prizeLabel: "2nd place", prizeCorn: 150_000 },
  { rankMin: 3, rankMax: 3, prizeLabel: "3rd place", prizeCorn: 90_000 },
  { rankMin: 4, rankMax: 10, prizeLabel: "Top 10", prizeCorn: 30_000 },
];

export const LEADERBOARD_TOP_COUNT = 50;

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

/** Anchor week starts on Monday 00:00 UTC. */
const WEEK_EPOCH = Date.UTC(2025, 0, 6);

export function getCurrentWeekId(now = Date.now()): string {
  const weekIndex = Math.floor((now - WEEK_EPOCH) / MS_PER_WEEK);
  return `week-${weekIndex}`;
}

export function getWeekEndTimestamp(now = Date.now()): number {
  const weekIndex = Math.floor((now - WEEK_EPOCH) / MS_PER_WEEK);
  return WEEK_EPOCH + (weekIndex + 1) * MS_PER_WEEK;
}

export function formatWeekCountdown(remainingMs: number): string {
  const totalHours = Math.max(0, Math.ceil(remainingMs / (60 * 60 * 1000)));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
}

export function shortenWallet(wallet: string): string {
  if (wallet.length <= 10) return wallet;
  return `${wallet.slice(0, 4)}…${wallet.slice(-4)}`;
}

export function getPrizeForRank(rank: number): LeaderboardPrizeTier | undefined {
  return WEEKLY_PRIZE_TIERS.find(
    (tier) => rank >= tier.rankMin && rank <= tier.rankMax,
  );
}

export function sortLeaderboard(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  return [...entries].sort((a, b) => {
    if (b.cornPerHour !== a.cornPerHour) return b.cornPerHour - a.cornPerHour;
    return a.updatedAt - b.updatedAt;
  });
}

export type LeaderboardStore = {
  weekId: string;
  entries: LeaderboardEntry[];
};

export function createEmptyLeaderboardStore(now = Date.now()): LeaderboardStore {
  return { weekId: getCurrentWeekId(now), entries: [] };
}

export function normalizeLeaderboardStore(
  store: LeaderboardStore,
  now = Date.now(),
): LeaderboardStore {
  const currentWeek = getCurrentWeekId(now);
  if (store.weekId !== currentWeek) {
    return createEmptyLeaderboardStore(now);
  }
  return store;
}
