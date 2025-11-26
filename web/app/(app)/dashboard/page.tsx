import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getXpProgress } from "@/lib/game-mechanics";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) return null;

  const activities = await prisma.userActivity.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const otherUsers = await prisma.user.findMany({
    where: {
      id: { not: user.id },
    },
    select: {
      id: true,
      name: true,
      level: true,
      sessions: {
        where: {
          expiresAt: { gt: new Date() },
        },
        select: {
          id: true,
        },
      },
    },
    take: 10,
  });

  const xpProgress = getXpProgress(user.experience, user.level);

  function timeAgo(date: Date) {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Welcome back, {user.name}.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Stat Card 1 */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {/* Icon */}
                <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                   <span className="text-xl font-bold">L</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Level</dt>
                  <dd>
                    <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{user.level}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                 <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                   <span className="text-xl font-bold">$</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Money</dt>
                  <dd>
                    <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{user.money}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

         {/* Stat Card 3 */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm col-span-1 sm:col-span-2">
          <div className="p-5">
            <div className="flex items-center mb-2">
              <div className="flex-shrink-0">
                 <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                   <span className="text-xl font-bold">XP</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Experience</dt>
                  <dd>
                    <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {xpProgress.current} / {xpProgress.max} XP
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div className="bg-purple-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${xpProgress.percentage}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-gray-100">Recent Activity</h3>
          </div>
          <div className="p-6">
            {activities.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity.</p>
            ) : (
              <ul className="space-y-4">
                {activities.map((activity: any) => (
                  <li key={activity.id} className="flex gap-4">
                    <div className="relative mt-1 flex h-2 w-2 flex-none items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-400 dark:bg-blue-500 ring-1 ring-white dark:ring-gray-900" />
                    </div>
                    <div className="flex-auto py-0.5 text-xs leading-5 text-gray-500 dark:text-gray-400">
                      <span className="font-medium text-gray-900 dark:text-gray-100 block">{activity.description}</span>
                      <span className="whitespace-nowrap">{timeAgo(activity.createdAt)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Other Users */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-gray-100">Other Users</h3>
          </div>
          <div className="p-6">
            {otherUsers.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No other users found.</p>
            ) : (
              <ul className="space-y-4">
                {otherUsers.map((u: { id: string; name: string; level: number; sessions: { id: string }[] }) => {
                  const isOnline = u.sessions.length > 0;
                  return (
                    <li key={u.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-2.5 w-2.5 rounded-full ${
                            isOnline ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                          }`}
                          title={isOnline ? "Online" : "Offline"}
                        />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {u.name}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Lvl {u.level}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
