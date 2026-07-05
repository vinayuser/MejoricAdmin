import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_SERVER_URL =
  import.meta.env.VITE_SOCKET_SERVER_URL || "http://localhost:3002";

export function useMateTrackingSocket(onUpdate) {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
    });

    const handleConnect = () => {
      setConnected(true);
      socket.emit("join_admin_mate_tracking");
    };

    const handleDisconnect = () => setConnected(false);

    const handleTrackingEvent = (payload) => {
      onUpdate?.(payload);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("mate_availability_tracking", handleTrackingEvent);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("mate_availability_tracking", handleTrackingEvent);
      socket.disconnect();
    };
  }, [onUpdate]);

  return { connected };
}
