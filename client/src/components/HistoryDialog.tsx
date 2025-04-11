import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { FileClock } from "lucide-react";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
interface ILog {
  _id: string;
  createdAt: string;
  updatedAt: string;
  isCheckout: boolean;
  bill: number;
}

export const HistoryDialog = ({
  cardUid,
  name,
}: {
  cardUid: string;
  name: string;
}) => {
  const [logs, setLogs] = useState<ILog[]>([]);
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axiosInstance.get(`/log/history/${cardUid}`);
        setLogs(res.data.logs);
      } catch (error) {
        console.error(error);
      }
    };
    fetchLogs();
  }, [cardUid]);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileClock />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>History of {name}</DialogTitle>
          <DialogDescription>
            Total bill:{" "}
            {logs.reduce((acc, log) => acc + (log.bill ? log.bill : 0), 0)}
          </DialogDescription>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Check In At</TableHead>
              <TableHead>Check Out At</TableHead>
              <TableHead>Bill</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs?.map((log, index) => (
              <TableRow key={log._id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  {new Date(log.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  {log.isCheckout && new Date(log.updatedAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  {log.isCheckout &&
                    log.bill.toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
};
