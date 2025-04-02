import Lessons from "./components/Lessons";
import Timeline from "./components/Timeline";
import Presets from "./components/Presets";
import ChatBox from "./components/ChatBox";

export default function Home() {
  return (
    <div className="flex flex-row w-full h-full">
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
