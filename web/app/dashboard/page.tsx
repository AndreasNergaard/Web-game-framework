import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <span>Welcome, {session.user.email}</span>
          <LogoutButton />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-gray-100 rounded-lg dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-2">Game Stats</h2>
          <p>Level: 0</p>
          <p>Experience: 0</p>
          <p>Money: 0</p>
        </div>
        <div className="p-6 bg-gray-100 rounded-lg dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-2">Recent Activity</h2>
          <p>No recent activity</p>
        </div>
        <div className="p-6 bg-gray-100 rounded-lg dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-2">Settings</h2>
          <button className="px-4 py-2 bg-blue-500 text-white rounded">Edit Profile</button>
        </div>
      </div>
    </div>
  );
}
