import { chats } from "../data/chats";
import ChatCard from "../components/ChatCard";

function ChatsPage() {
  return (
    <div className="animate-[fadeUp_0.3s_ease]">
      <h1 className="text-4xl font-black">Chats</h1>

      <p className="mt-2 text-slate-400">
        Communicate with support, students, or the local community.
      </p>

      <div className="mt-6 space-y-3">
        {chats.map((chat, index) => (
          <ChatCard key={index} chat={chat} />
        ))}
      </div>
    </div>
  );
}

export default ChatsPage;