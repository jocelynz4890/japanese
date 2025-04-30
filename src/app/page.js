import Lessons from "./components/Lessons";
import Timeline from "./components/Timeline";
import Presets from "./components/Presets";
import ChatBox from "./components/ChatBox";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  if (session?.user?.role === "teacher") {
    return <TeacherDashboard />;
  }

  return (
    <div className="flex flex-row w-full h-full overflow-hidden">
      <Lessons/>
      <div className="flex flex-col w-full">
        <Presets></Presets>
        <div className="flex flex-row w-full h-full">
          <Timeline/>
          <ChatBox chatId="placeholder"></ChatBox>
        </div>
      </div>
    </div>
  );
}