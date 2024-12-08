export type PrizeLimit = {
  name: string;
  limit: number | "unlimited";
  count: number;
};

export const initialPrizeLimits: PrizeLimit[] = [
  { name: "Crocs Jibbitz", limit: 1, count: 0 },
  { name: "Pop Mart", limit: 1, count: 0 },
  { name: "Socks", limit: 1, count: 0 },
  { name: "Cup", limit: 1, count: 0 },
  { name: "Tote Bag", limit: "unlimited", count: 0 },
  { name: "10% OFF", limit: "unlimited", count: 0 },
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
