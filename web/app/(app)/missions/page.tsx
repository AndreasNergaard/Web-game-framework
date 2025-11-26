import { getMissions } from "@/lib/missions";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { MissionList } from "@/components/MissionList";
import { seedMissionsAction } from "@/app/actions/missions";

export default async function MissionsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return <div className="p-8 text-center">Please log in to view missions</div>;
  }

  const missions = await getMissions(session.user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h2 className="text-2xl font-bold tracking-tight">Missions</h2>
            <p className="text-gray-500 dark:text-gray-400">
            Complete tasks to earn rewards and experience.
            </p>
        </div>
        <form action={seedMissionsAction}>
            <button className="text-sm text-blue-600 hover:text-blue-500 hover:underline">
                Generate Demo Missions
            </button>
        </form>
      </div>

      <MissionList missions={missions} />
    </div>
  );
}
