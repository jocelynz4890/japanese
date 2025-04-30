// no "use client"

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import Lessons from "./components/Lessons";
import Timeline from "./components/Timeline";
import Presets from "./components/Presets";
import ChatBox from "./components/ChatBox";
import TeacherDashboard from "./components/TeacherDashboard";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session?.user) return <p>Please sign in</p>;

  if (session.user.role === "teacher") {
    return <TeacherDashboard />;
  }

  return (
    <div className="flex flex-row w-full h-full overflow-hidden">
      <Lessons/>
      <div className="flex flex-col w-full">
        <Presets />
        <div className="flex flex-row w-full h-full">
          <Timeline />
          <ChatBox chatId="placeholder" />
        </div>
      </div>
    </div>
  );
}
