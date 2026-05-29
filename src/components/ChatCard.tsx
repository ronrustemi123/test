import type { Chat } from "../types";

type ChatCardProps = {
  chat: Chat;
};

function ChatCard({ chat }: ChatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-3xl border border-white/10 bg-white/10 p-4">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-sky-400 to-violet-600 font-black">
        {chat.name.charAt(0)}
      </div>

      <div className="flex-1">
        <h4 className="font-bold">{chat.name}</h4>
        <p className="text-sm text-slate-400 mt-1">{chat.message}</p>
      </div>

      <span className="text-xs text-slate-500">{chat.time}</span>
    </div>
  );
}

export default ChatCard;