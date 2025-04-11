import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import axiosInstance from "@/lib/axios";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import "@fontsource/audiowide/400.css";
import useWebSocketClient from "@/hooks/use-socket";
import { useLayout } from "@/hooks/use-layout";
import { Car, UserCheckIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function displayBill(bill: number) {
  return bill.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

interface IStat {
  _id: string;
  avg_rfid_in: number;
  avg_rfid_out: number;
  avg_servo_in: number;
  avg_servo_out: number;
  avg_wifi: number;
  avg_ws: number;
  avg_slot: number;
  createdAt: string;
}

interface ILog {
  _id: string;
  cardId: { uid: string; _id: string };
  clientId: {
    name: string;
    avatar: string;
    cccd: string;
    _id: string;
    carDescription: {
      licensePlate: string;
      color: string;
      brand: string;
      model: string;
      image: string;
    };
  };
  isCheckout: boolean;
  bill: number;
  createdAt: string;
  updatedAt: string;
}

interface ISlot {
  createdAt: string;
  isEmpty: boolean;
  number: number;
  updatedAt: string;
  _id: string;
}

export const Home = () => {
  // const { socket, isConnected } = useWebSocketClient(
  //   "wss://parkinglot-freertos.onrender.com/ws"
  // );
  const [isLoading, setIsLoading] = useState(false);
  const contentHeight = useLayout();
  const { socket, isConnected } = useWebSocketClient("ws://localhost:3600/ws");
  useEffect(() => {
    if (socket && isConnected) {
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "update-slots") {
          setSlot(data.slots);
        } else if (data.type === "update-logs-out") {
          setUncheckedLog((prev) =>
            prev.filter((log) => log._id !== data.log._id)
          );
          toast.success("A car checkout successfully");
        } else if (data.type === "update-logs-in") {
          setUncheckedLog((prev) => [...prev, data.log]);
          toast.success("A car checkin successfully");
        } else if (data.type === "update-task-stats") {
          setStats((prev) => [...prev, data.stats]);
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
  const [slot, setSlot] = useState<ISlot[]>([]);
  useEffect(() => {
    const loadSlot = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get("/slot");
        setSlot(response.data);
      } catch (error) {
        toast.error(
          (error as { message: string })?.message || "Fetch slot failed"
        );
      }
      setIsLoading(false);
    };
    loadSlot();
  }, []);
  const [stats, setStats] = useState<IStat[]>([]);
  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get("/stats");
        setStats(response.data);
      } catch (error) {
        toast.error(
          (error as { message: string })?.message || "Fetch stats failed"
        );
      }
      setIsLoading(false);
    };
    loadStats();
  }, []);
  const [uncheckedLog, setUncheckedLog] = useState<ILog[]>([]);
  useEffect(() => {
    const loadUncheckedLog = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get("/log/unchecked");
        setUncheckedLog(response.data.logs);
        console.log(response.data.logs);
      } catch (error) {
        toast.error(
          (error as { message: string })?.message || "Fetch log failed"
        );
      }
      setIsLoading(false);
    };
    loadUncheckedLog();
  }, []);
  return isLoading ? (
    <Skeleton className="w-full h-full rounded-2xl"></Skeleton>
  ) : (
    <div
      className="flex flex-col gap-4 w-full"
      style={{
        height: contentHeight,
        maxHeight: contentHeight,
        overflowY: "auto",
      }}
    >
      {uncheckedLog.length > 0 && (
        <Card className="w-full p-4 shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-center">
            Uncheck Out Car
          </h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Plate</TableHead>
                <TableHead>Bill</TableHead>
                <TableHead>Checked In At</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {uncheckedLog?.map((log, index) => (
                <TableRow key={log._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium uppercase">
                    {log.clientId.name}
                  </TableCell>
                  <TableCell>
                    {log.clientId.carDescription.licensePlate}
                  </TableCell>
                  <TableCell>{displayBill(log.bill)}</TableCell>
                  <TableCell>
                    {new Date(log.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <TableCell className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <UserCheckIcon />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle className="text-2xl text-center">
                              Client
                            </DialogTitle>
                            <DialogDescription className="text-lg text-muted-foreground space-y-1">
                              <p>
                                <strong>Client:</strong> {log.clientId.name}
                              </p>
                              <p>
                                <strong>CCCD:</strong> {log.clientId.cccd}
                              </p>
                            </DialogDescription>
                          </DialogHeader>
                          <img
                            src={
                              import.meta.env.VITE_BASE_STATIC_URL +
                              log.clientId.avatar
                            }
                            alt={log.clientId.name}
                            className="w-full h-auto"
                          />
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Car />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle className="text-2xl text-center">
                              Car
                            </DialogTitle>
                            <DialogDescription className="text-lg text-muted-foreground space-y-1">
                              <p>
                                <strong>Owner:</strong> {log.clientId.name}
                              </p>
                              <p>
                                <strong>Plate:</strong>{" "}
                                {log.clientId.carDescription.licensePlate}
                              </p>
                              <p>
                                <strong>Color:</strong>{" "}
                                {log.clientId.carDescription.color}
                              </p>
                              <p>
                                <strong>Brand:</strong>{" "}
                                {log.clientId.carDescription.brand}
                              </p>
                              <p>
                                <strong>Model:</strong>{" "}
                                {log.clientId.carDescription.model}
                              </p>
                            </DialogDescription>
                          </DialogHeader>
                          <img
                            src={
                              import.meta.env.VITE_BASE_STATIC_URL +
                              log.clientId.carDescription.image
                            }
                            alt={log.clientId.name}
                            className="w-full h-auto"
                          />
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {uncheckedLog.length === 0 && (
        <Card className="w-full p-6 flex flex-col items-center gap-4 shadow-md">
          <img
            src="/ANH.jpg"
            alt="Empty Parking Lot"
            className="w-[300px] h-auto object-contain rounded-full mb-4"
          />
          <h1 className="text-2xl md:text-3xl font-bold text-green-500 text-center">
            Empty Parking Lot
          </h1>
          <p className="text-muted-foreground text-center max-w-md">
            Now there is no uncheck out car. The parking lot is empty and ready
            to accept new cars!
          </p>
        </Card>
      )}
      <div className="w-full flex-1 flex justify-center items-center">
        <h1 className="text-4xl font-bold">Parking Lot Monitor</h1>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-6 p-4">
        {slot
          .sort((a, b) => a.number - b.number)
          .map((slot) => (
            <Card
              key={slot._id}
              style={{
                fontFamily: "Audiowide",
              }}
              className={cn(
                "relative flex flex-col justify-center items-center rounded-2xl shadow-lg",
                slot.isEmpty ? "bg-green-500" : "bg-red-500"
              )}
            >
              <span className="text-8xl text-white font-audiowide">
                {slot.number}
              </span>
              <span className="absolute bottom-3 right-3 text-white text-xs font-audiowide">
                Updated: {new Date(slot.updatedAt).toLocaleString()}
              </span>
            </Card>
          ))}
      </div>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Thống kê hiệu suất các Task</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={stats}
              margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="createdAt"
                tickFormatter={(value) => new Date(value).toLocaleTimeString()}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="avg_rfid_in"
                stroke="#8884d8"
                name="RFID In"
              />
              <Line
                type="monotone"
                dataKey="avg_rfid_out"
                stroke="#82ca9d"
                name="RFID Out"
              />
              <Line
                type="monotone"
                dataKey="avg_servo_in"
                stroke="#ffc658"
                name="Servo In"
              />
              <Line
                type="monotone"
                dataKey="avg_servo_out"
                stroke="#ff8042"
                name="Servo Out"
              />
              <Line
                type="monotone"
                dataKey="avg_wifi"
                stroke="#00C49F"
                name="WiFi"
              />
              <Line
                type="monotone"
                dataKey="avg_ws"
                stroke="#0088FE"
                name="WebSocket"
              />
              <Line
                type="monotone"
                dataKey="avg_slot"
                stroke="#FFBB28"
                name="Slot"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
