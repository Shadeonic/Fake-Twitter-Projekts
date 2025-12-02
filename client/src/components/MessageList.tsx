import { useEffect } from 'react';
import { useMessagesStore } from '../stores/messagesStore';

type MessageListProps = {
  page: number;
  limit: number;
  onTotalPages?: (n: number) => void;
};

export default function Messages({
  page,
  limit,
  onTotalPages,
}: MessageListProps) {
  const { messages, loadMessages, vote } = useMessagesStore();
  const totalPages = Math.ceil(messages.length / limit);

  useEffect(() => {
    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    onTotalPages?.(totalPages);
  }, [messages, totalPages, onTotalPages]);

  const start = (page - 1) * limit;
  const paginated = messages.slice(start, start + limit);

  return (
    <div>
      {paginated.map((msg) => (
        <div
          key={msg._id}
          className="border-[#999999] border flex flex-col p-4 gap-2 mb-3 relative"
        >
          <span className="text-[#bb7eca] gap-2 text-accent">
            <p className="text-lg font-extrabold break-words break-all whitespace-pre-wrap">
              {msg.title}
            </p>
          </span>
          <p className="gap-2 text-sm break-words break-all whitespace-pre-wrap">
            {msg.body}
          </p>
          <small className="flex gap-2 absolute -bottom-3 right-2 bg-black text-[#999999] px-2">
            {new Date(msg.timestamp).toLocaleString()}
          </small>
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
