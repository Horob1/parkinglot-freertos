import { Card } from "@/components/ui/card";
import { useLayout } from "@/hooks/use-layout";
import axiosInstance from "@/lib/axios";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import "@fontsource/audiowide/400.css";
import useWebSocketClient from "@/hooks/use-socket";

interface ISlot {
  createdAt: string;
  isEmpty: boolean;
  number: number;
  updatedAt: string;
  _id: string;
}

export const Home = () => {
  const { socket, isConnected } = useWebSocketClient("ws://localhost:3600/ws");
  useEffect(() => {
    if (socket && isConnected) {
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "update-slots") {
          setSlot(data.slots);
        }
      };
    }
    // Cleanup function
    return () => {
      if (socket) {
        socket.onmessage = null;
      }
    };
  }, [isConnected, socket]);
  // Fetch danh sách thẻ
  const contentHeight = useLayout();
  const [slot, setSlot] = useState<ISlot[]>([]);
  useEffect(() => {
    const loadSlot = async () => {
      try {
        const response = await axiosInstance.get("/slot");
        setSlot(response.data);
      } catch (error) {
        toast.error(
          (error as { message: string })?.message || "Fetch slot failed"
        );
      }
    };
    loadSlot();
  }, []);
  return (
    <div
      className="flex flex-wrap gap-2 w-full overflow-y-auto"
      style={{
        height: contentHeight,
        maxHeight: contentHeight,
      }}
    >
      {slot.map((slot) => (
        <Card
          key={slot._id}
          className={cn(
            "flex-1 basic-1/2 justify-center items-center relative",
            slot.isEmpty ? "bg-green-500" : "bg-red-500"
          )}
        >
          <span
            className="text-center text-[400px] text-background"
            style={{ fontFamily: "Audiowide" }}
          >
            {slot.number}
          </span>
          <span
            className="absolute bottom-2 right-2 text-background text-sm"
            style={{ fontFamily: "Audiowide" }}
          >
            Updated At {new Date(slot.updatedAt).toLocaleString()}
          </span>
        </Card>
      ))}
    </div>
  );
};
