import { useEffect, useState } from "react";

type Message = {
  id: number;
  title: string;
  body: string;
  timestamp: string;
  vote:number;
};

export default function Messages() {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = () => {
    fetch("http://localhost:4000/api/messages")
      .then(res => res.json())
      .then((data: Message[]) => setMessages(data));
  };

  const vote = async (id:number, delta: number) => {
    await fetch (`http://localhost:4000/api/messages/${id}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ delta }),
    });
    loadMessages();
  };

  return (
    <div>
      {messages.map(msg => (
        <div className="border-[#999999] border flex flex-col p-4 gap-2 mb-3 relative " key={msg.id}>
          <span className="text-[#bb7eca] gap-2 text-accent">
            <p className="text-lg font-extrabold">{msg.title}</p>
          </span>
          <p className="flex gap-2 text-sm ">{msg.body}</p>
          <small className="flex gap-2 absolute -bottom-3 right-2 bg-black text-[#999999] px-2"> {new Date(msg.timestamp).toLocaleString()}</small>
          <div className="flex gap-2 absolute -bottom-3 left-2 bg-black px-2 items-center">
            <button
              onClick={() => vote(msg.id, +1)}
              className="text-green-400 hover:text-green-300 cursor-pointer text-xl"
            >
              ⇧
            </button>
            <div>{msg.vote}</div>
            <button
              onClick={() => vote(msg.id, -1)}
              className="text-red-400 hover:text-red-300 cursor-pointer text-xl"
            >
              ⇩
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}