"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "@/src/hooks/use-toast";

type WebSocketContextValue = {
  ws: WebSocket | null;
};

const WebSocketContext = createContext<WebSocketContextValue>({ ws: null });

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const { toast } = useToast();
  useEffect(() => {
    const socket = new WebSocket("wss://keezmo-production.up.railway.app/ws");

    socket.onopen = () => console.log("WS conectado");
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.event === "JOB_DONE") {
          toast({
            title: `Job finalizado: Deck ${data.deckId}`,
            description: "O deck foi criado com sucesso",
          });
        }
      } catch (error) {
        console.error("Erro WS:", error);
      }
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ ws }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  return useContext(WebSocketContext);
}
