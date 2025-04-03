import { useState, useEffect, useCallback } from "react";

const useWebSocketClient = (url: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log("✅ WebSocket connected");
      ws.send(JSON.stringify({ type: "auth", clientType: "admin" }));
      setIsConnected(true);
    };

    ws.onclose = () => {
      console.log("❌ WebSocket disconnected");
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error("⚠️ WebSocket error:", error);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [url]);

  const sendMessage = useCallback(
    (message: object) => {
      if (socket && isConnected) {
        socket.send(JSON.stringify(message));
      }
    },
    [isConnected, socket]
  );

  return { isConnected, socket, sendMessage };
};

export default useWebSocketClient;
