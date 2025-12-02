import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

export type Message = {
  _id: string;
  title: string;
  body: string;
  timestamp: string;
  vote: number;
};

type MessagesState = {
  messages: Message[];
  cooldown: number;
  loadMessages: () => Promise<void>;
  vote: (_id: string, delta: number) => Promise<void>;
  postMessage: (title: string, body: string) => Promise<{ ok: boolean; error?: string }>;
};

// Singleton socket to avoid multiple connections
let socket: Socket | null = null;
function getSocket() {
  if (!socket) {
    socket = io('http://localhost:4000', { transports: ['websocket'] });
  }
  return socket;
}

export const useMessagesStore = create<MessagesState>((set) => {
  const s = getSocket();

  // Attach listeners once
  s.off('newMessage').on('newMessage', (msg: Message) => {
    set((state) => ({ messages: [msg, ...state.messages] }));
  });

  s.off('voteUpdate').on('voteUpdate', (updated: Message) => {
    set((state) => ({
      messages: state.messages.map((m) => (m._id === updated._id ? updated : m)),
    }));
  });

  s.off('messagesUpdate').on('messagesUpdate', (msgs: Message[]) => {
    set({ messages: msgs });
  });

  return {
    messages: [],
    cooldown: 0,

    loadMessages: async () => {
      const res = await fetch('http://localhost:4000/api/messages');
      const data: Message[] = await res.json();
      set({ messages: data });
    },

    vote: async (_id, delta) => {
      await fetch(`http://localhost:4000/api/messages/${_id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta }),
      });
    },

    postMessage: async (title, body) => {
      try {
        const res = await fetch('http://localhost:4000/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, body }),
        });
        const data = await res.json();
        if (!res.ok) {
          const match = /Please wait (\d+)s/.exec(data.error || '');
          if (match) {
            const seconds = Number(match[1]);
            set({ cooldown: seconds });
            const interval = setInterval(() => {
              set((st) => {
                if (st.cooldown <= 1) {
                  clearInterval(interval);
                  return { cooldown: 0 };
                }
                return { cooldown: st.cooldown - 1 };
              });
            }, 1000);
          }
          return { ok: false, error: data.error };
        }

        // Success: start cooldown
        set({ cooldown: 10 });
        const interval = setInterval(() => {
          set((st) => {
            if (st.cooldown <= 1) {
              clearInterval(interval);
              return { cooldown: 0 };
            }
            return { cooldown: st.cooldown - 1 };
          });
        }, 1000);

        return { ok: true };
      } catch {
        return { ok: false, error: 'Network error' };
      }
    },
  };
});
