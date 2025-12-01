import { useEffect, useState } from "react";
import MessageForm from './components/MessageForm';
import MessageList from './components/MessageList';

export default function App() {
  const [refresh, setRefresh] = useState(0);
  const [messageSent, setMessageSent] = useState(false);
  
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-mono text-sm">
      <div className="relative h-[5.5rem]"></div>

      {/* Banner */}
      {messageSent && (
        <div className="border border-green-600 text-center text-green-600 px-2 py-2 max-w-[37rem] mx-auto">
          <span>Message sent.</span>
          <button
            type="button"
            onClick={() => setMessageSent(false)}
            className="ml-2 text-white/80 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}
        
      <div className="max-w-[37.95rem] mx-auto px-2">
        <MessageForm
          onMessagePosted={() => {
            setRefresh(r => r + 1);
            setMessageSent(true);
            setTimeout(() => setMessageSent(false), 10000);
          }}
        />
        <div className="relative h-[3.5rem]"></div>
        <MessageList key={refresh} />
      </div>
      <div className="relative h-[2rem]"></div>
    </div>
  );
}
