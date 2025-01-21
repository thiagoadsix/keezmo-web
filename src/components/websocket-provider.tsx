"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "@/src/hooks/use-toast";
import { useRouter } from "next/navigation";
import { ToastAction } from "./ui/toast";

type WebSocketContextValue = {
  ws: WebSocket | null;
};

const WebSocketContext = createContext<WebSocketContextValue>({ ws: null });

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const socket = new WebSocket("wss://keezmo-production.up.railway.app/ws");

    socket.onopen = () => console.log("WS conectado");
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.event === "JOB_DONE") {
          const { name, description, cards } = data.deck;
          toast({
            title: `Deck "${name}" criado com sucesso!`,
            description: `${description} - Contém ${cards.length} cards.`,
            variant: "default",
            action: <ToastAction altText="Ir para lista de Decks" onClick={() => router.push(`/decks`)}>Ir para lista de Decks</ToastAction>
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
