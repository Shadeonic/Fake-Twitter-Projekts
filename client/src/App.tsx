import { useEffect, useState } from "react";
import MessageForm from './components/MessageForm';
import MessageList from './components/MessageList';

export default function App() {
  const [messageSent, setMessageSent] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit ] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-mono text-sm">
      <div className="relative h-[5.5rem]"></div>
      {/* Banner */}
      {messageSent && (
        <div className="border border-green-600 text-center text-green-600 px-2 py-2 max-w-[37rem] mx-auto relative">
          <span>Message sent.</span>
          <button
            type="button"
            onClick={() => setMessageSent(false)}
            className="ml-2 text-white/80  hover:!text-red-500 hover:scale-125 transition-all duration-200 cursor-pointer absolute inset-y-0 right-0 w-16"
          >
            ✕
          </button>
        </div>
      )}
        
      <div className="max-w-[37.95rem] mx-auto px-2">
        <MessageForm
          onMessagePosted={() => {
            setMessageSent(true);
            setTimeout(() => setMessageSent(false), 10000);
          }}
        />
        <div className="relative h-[3.5rem]"></div>
        <MessageList page={page} limit={limit} onTotalPages={setTotalPages}/>
      </div>
      <div className="relative h-[2rem]"></div>
      <div className="flex justify-center gap-4 mt-4">
        <button
          onClick={() => setPage(p => Math.max(p - 1, 1))}
          className="px-3 py-1 border border-gray-500 rounded"
        >
          Prev
        </button>

        <span>Page: {page}</span>

        <button
           onClick={() => setPage(p => Math.min(p + 1, totalPages))}
          className="px-3 py-1 border border-gray-500 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}