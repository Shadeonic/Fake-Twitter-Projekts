import { useEffect, useState } from "react";

type Health = { ok: boolean; timestamp: string };

export default function App() {
  const [health, setHealth] = useState<Health | null>(null);
  const [echo, setEcho] = useState("");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE || "/api"}/health`)
      .then((r) => r.json())
      .then(setHealth)
      .catch(console.error);
  }, []);

  const onEcho = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_BASE || "/api"}/echo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Hello from React!" }),
    });
    const data = await res.json();
    setEcho(data.message);
  };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: 24 }}>
      <h1>React + Express + TypeScript</h1>
      <p>Health: {health ? <code>{JSON.stringify(health)}</code> : "Loading..."}</p>
      <button onClick={onEcho}>Send Echo</button>
      {echo && (
        <p>
          Echo response: <code>{echo}</code>
        </p>
      )}
      <p style={{ marginTop: 24 }}>
        Try editing <code>client/src/App.tsx</code>.
      </p>
    </div>
  );
}
