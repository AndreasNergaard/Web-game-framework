export const XP_BASE = 100;

export function getXpForLevel(level: number): number {
  // Quadratic scaling: 100 * (level^2)
  // Level 1 -> 2 requires 100 XP total.
  // Level 2 -> 3 requires 400 XP total.
  // This means at level 1 you need 100 XP to reach level 2.
  // At level 2 you need 400 XP (total) to reach level 3.
  // So delta is:
  // L1->L2: 100
  // L2->L3: 300 (400 - 100)
  // L3->L4: 500 (900 - 400)
  return XP_BASE * Math.pow(level, 2);
}

export function calculateLevel(totalXp: number): number {
  // Inverse of getXpForLevel
  // totalXp = 100 * level^2
  // level^2 = totalXp / 100
  // level = sqrt(totalXp / 100)
  // But since we start at level 1 with 0 XP, we need to adjust.
  
  // Let's redefine:
  // XP required to REACH level L from level 1.
  // Level 1: 0 XP
  // Level 2: 100 XP
  // Level 3: 400 XP
  
  // Level = floor(sqrt(XP / 100)) + 1
  return Math.floor(Math.sqrt(totalXp / XP_BASE)) + 1;
}

export function getXpProgress(totalXp: number, currentLevel: number) {
  const currentLevelXp = getXpForLevel(currentLevel - 1); // XP required to reach current level
  const nextLevelXp = getXpForLevel(currentLevel); // XP required to reach next level
  
  const xpInLevel = totalXp - currentLevelXp;
  const xpRequiredForNext = nextLevelXp - currentLevelXp;
  
  const progress = Math.min(100, Math.max(0, (xpInLevel / xpRequiredForNext) * 100));
  
  return {
    current: xpInLevel,
    max: xpRequiredForNext,
    percentage: progress
  };
}
