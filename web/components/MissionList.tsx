"use client";

import { completeMissionAction } from "@/app/actions/missions";
import { useState, useEffect } from "react";

type Mission = {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  moneyReward: number;
  status: string; // AVAILABLE, COMPLETED, COOLDOWN
  nextAvailableAt: Date | null;
  rewards: {
    item: {
      name: string;
      icon: string | null;
    };
    quantity: number;
  }[];
};

function MissionCard({ mission }: { mission: Mission }) {
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    // Calculate initial time left
    const calculateTimeLeft = () => {
      if (!mission.nextAvailableAt) return 0;
      const diff = new Date(mission.nextAvailableAt).getTime() - Date.now();
      return Math.max(0, Math.ceil(diff / 1000));
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      
      // Optional: If we wanted to auto-refresh data when cooldown ends
      // if (remaining <= 0) { ... }
    }, 1000);

    return () => clearInterval(interval);
  }, [mission.nextAvailableAt]);

  const handleComplete = async () => {
    setLoading(true);
    try {
      await completeMissionAction(mission.id);
    } catch (error) {
      console.error("Failed to complete mission:", error);
      alert("Failed to complete mission");
    } finally {
      setLoading(false);
    }
  };

  // Determine if the mission is effectively in cooldown
  // We use the server status initially, but override if we have a local timer that says it's ready
  // Actually, if mission.status is COOLDOWN, we check our local timer.
  // If local timer is 0, we consider it available (optimistically).
  // If mission.status is AVAILABLE, it's available.
  
  const isServerCooldown = mission.status === 'COOLDOWN';
  const isLocalReady = timeLeft !== null && timeLeft <= 0;
  
  // If we haven't calculated timeLeft yet (SSR/Hydration), trust the server status.
  // If we have calculated timeLeft, trust that.
  const isCooldown = timeLeft === null ? isServerCooldown : (timeLeft > 0);

  let buttonText = "Complete Mission";
  let buttonDisabled = false;

  if (loading) {
    buttonText = "Completing...";
    buttonDisabled = true;
  } else if (isCooldown) {
    // If timeLeft is null (SSR), show generic "Cooldown".
    // If timeLeft is set, show seconds.
    buttonText = timeLeft === null ? "Cooldown" : `Cooldown (${timeLeft}s)`;
    buttonDisabled = true;
  }

  return (
    <div 
      className={`border rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors ${
        isCooldown
          ? 'bg-gray-50 dark:bg-gray-900/10 border-gray-200 dark:border-gray-700 opacity-75' 
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
      }`}
    >
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{mission.title}</h3>
          {isCooldown && (
            <span className="px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 text-xs font-medium">
              Cooldown
            </span>
          )}
        </div>
        <p className="text-gray-500 dark:text-gray-400 mb-4">{mission.description}</p>
        
        <div className="flex flex-wrap gap-4 text-sm">
          {mission.xpReward > 0 && (
            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
              <span>✨</span>
              <span>{mission.xpReward} XP</span>
            </div>
          )}
          {mission.moneyReward > 0 && (
            <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 font-medium">
              <span>💰</span>
              <span>{mission.moneyReward} Gold</span>
            </div>
          )}
          {mission.rewards.map((reward, idx) => (
            <div key={idx} className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-medium">
              <span>{reward.item.icon || "🎁"}</span>
              <span>{reward.quantity}x {reward.item.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <button
          onClick={handleComplete}
          disabled={buttonDisabled}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            buttonDisabled 
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}

export function MissionList({ missions }: { missions: Mission[] }) {
  return (
    <div className="grid grid-cols-1 gap-6">
      {missions.map((mission) => (
        <MissionCard key={mission.id} mission={mission} />
      ))}
      {missions.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No missions available.
        </div>
      )}
    </div>
  );
}
