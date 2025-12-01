import { useEffect, useState } from "react";
import { io } from "socket.io-client"; 

type Message = {
  _id: string;
  title: string;
  body: string;
  timestamp: string;
  vote: number;
};

type MessageListProps = {
  page: number;
  limit: number;
  onTotalPages?: (n: number) => void;
};

export default function Messages({ page, limit, onTotalPages}: MessageListProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const totalPages = Math.ceil(messages.length / limit);


  useEffect(() => {
    loadMessages();

    const socket = io("http://localhost:4000", { transports: ["websocket"] });

    socket.on("newMessage", (msg: Message) => {
      setMessages(prev => [msg, ...prev]);
    });

    socket.on("voteUpdate", (updated: Message) => {
      setMessages(prev =>
        prev.map(m => (m._id === updated._id ? updated : m))
      );
    });

    socket.on("messagesUpdate", (msgs: Message[]) => {
      setMessages(msgs);
    });

    return () => {
      socket.disconnect();
    };

    
  }, []);
  useEffect(() => {
    if (onTotalPages) {
      onTotalPages(totalPages);
    }
  }, [messages]);


  const loadMessages = () => {
    fetch("http://localhost:4000/api/messages")
      .then(res => res.json())
      .then((data: Message[]) => setMessages(data));
  };

  const vote = async (_id: string, delta: number) => {
    await fetch(`http://localhost:4000/api/messages/${_id}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ delta }),
    });
  };

  const start = (page - 1) * limit;
  const paginated = messages.slice(start, start + limit);

  return (
    <div>
      {paginated.map(msg => (
        <div className="border-[#999999] border flex flex-col p-4 gap-2 mb-3 relative " key={msg._id}>
          <span className="text-[#bb7eca] gap-2 text-accent">
            <p className="text-lg font-extrabold">{msg.title}</p>
          </span>
          <p className="flex gap-2 text-sm ">{msg.body}</p>
          <small className="flex gap-2 absolute -bottom-3 right-2 bg-black text-[#999999] px-2"> {new Date(msg.timestamp).toLocaleString()}</small>
          <div className="flex gap-2 absolute -bottom-3 left-2 bg-black px-2 items-center">
            <button
              onClick={() => vote(msg._id, +1)}
              className="text-green-400 hover:text-green-300 cursor-pointer text-xl"
            >
              ⇧
            </button>
            <div>{msg.vote}</div>
            <button
              onClick={() => vote(msg._id, -1)}
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