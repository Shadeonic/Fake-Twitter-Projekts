import { useEffect, useState } from "react";
import MessageForm from './components/MessageForm';
import MessageList from './components/MessageList';

// type Health = { ok: boolean; timestamp: string };

export default function App() {
  const [refresh, setRefresh] = useState(0);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans text-sm">
      <div className="relative h-[5.5rem]"></div>
      <div className="max-w-[39.25rem] mx-auto px-2">
        <MessageForm onMessagePosted={() => setRefresh(r => r + 1)}/>
        <MessageList key={refresh} />
      </div>
    </div>
  );
}
