export type PrizeLimit = {
  name: string;
  limit: number | "unlimited";
  count: number;
};

export const initialPrizeLimits: PrizeLimit[] = [
  { name: "5 Pieces of Jibbitzs", limit: 12, count: 0 },
  { name: "Hacipupu", limit: 2, count: 0 },
  { name: "Socks", limit: 20, count: 0 },
  { name: "Bottle", limit: 4, count: 0 },
  { name: "Tote Bag", limit: 8, count: 0 },
  { name: "10% OFF", limit: 6, count: 0 },
];

export function resetPrizeCounts(prizeLimits: PrizeLimit[]): PrizeLimit[] {
  return prizeLimits.map((prize) => ({ ...prize, count: 0 }));
}

export function updatePrizeLimit(
  prizeLimits: PrizeLimit[],
  prizeName: string,
  newLimit: number | "unlimited"
): PrizeLimit[] {
  return prizeLimits.map((prize) =>
    prize.name === prizeName ? { ...prize, limit: newLimit } : prize
  );
}
