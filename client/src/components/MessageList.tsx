import { useEffect, useState } from "react";

type Message = {
  id: number;
  title: string;
  body: string;
  timestamp: string;
};

export default function Messages() {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    fetch("http://localhost:4000/api/messages")
      .then(res => res.json())
      .then((data: Message[]) => setMessages(data));
  }, []);

  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id}>
          <h3>{msg.title}</h3>
          <p>{msg.body}</p>
          <small>{msg.timestamp}</small>
        </div>
      ))}
    </div>
  );
}
