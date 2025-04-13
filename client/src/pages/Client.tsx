/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLayout } from "@/hooks/use-layout";
import axiosInstance from "@/lib/axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Car, Delete } from "lucide-react";
import { ClientFormDialog } from "@/components/ClientFormDialog";
import { HistoryDialog } from "@/components/HistoryDialog";

interface IClient {
  _id: string;
  cccd: string;
  avatar: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  carDescription: {
    licensePlate: string;
    color: string;
    brand: string;
    model: string;
    image: string;
  };
  cardId: {
    uid: string;
    _id: string;
  };
}
export const Client = () => {
  const contentHieght = useLayout();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<IClient[]>([]);
  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/client");
      setClients(res.data);
    } catch (error: any) {
      toast.error("Cannot load client list");
      console.error(error);
    }
    setLoading(false);
  };
  useEffect(() => {
    fetchClients();
  }, []);
  return loading ? (
    <div className="w-full h-full rounded-2xl"></div>
  ) : (
    <div
      className="p-6 space-y-4 overflow-y-auto"
      style={{ maxHeight: contentHieght, height: contentHieght }}
    >
      <h1 className="text-2xl font-bold text-center">Client Management</h1>
      <ClientFormDialog
        triggerLabel="Create Client"
        onSubmit={async (data) => {
          try {
            await axiosInstance.post("/client", data);
            toast.success("Client created");
            fetchClients();
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (err) {
            toast.error("Failed to create client");
          }
        }}
      />
      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>CCCD</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>License Plate</TableHead>
            <TableHead>Card</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients?.map((client, index) => (
            <TableRow key={client._id}>
              <TableHead>{index + 1}</TableHead>
              <TableHead>{client.name}</TableHead>
              <TableHead>{client.cccd}</TableHead>
              <TableHead>{client.phone}</TableHead>
              <TableHead>{client.email}</TableHead>
              <TableHead>{client.address}</TableHead>
              <TableHead>{client.carDescription.licensePlate}</TableHead>
              <TableHead>
                {client?.cardId ? client?.cardId?.uid : "None"}
              </TableHead>
              <TableHead className="flex gap-2 items-center">
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
                          <strong>Owner:</strong> {client.name}
                        </p>
                        <p>
                          <strong>Plate:</strong>{" "}
                          {client.carDescription.licensePlate}
                        </p>
                        <p>
                          <strong>Color:</strong> {client.carDescription.color}
                        </p>
                        <p>
                          <strong>Brand:</strong> {client.carDescription.brand}
                        </p>
                        <p>
                          <strong>Model:</strong> {client.carDescription.model}
                        </p>
                      </DialogDescription>
                    </DialogHeader>
                    <img
                      src={
                        import.meta.env.VITE_BASE_STATIC_URL +
                        client.carDescription.image
                      }
                      alt={client.name}
                      className="w-full h-auto"
                    />
                  </DialogContent>
                </Dialog>
                <ClientFormDialog
                  isEdit
                  triggerLabel="Edit"
                  defaultValues={{
                    name: client.name,
                    cccd: client.cccd,
                    phone: client.phone,
                    email: client.email,
                    address: client.address,
                    carDescription: client.carDescription,
                    cardId: client.cardId?._id,
                  }}
                  onSubmit={async (data) => {
                    try {
                      await axiosInstance.put(`/client/${client._id}`, data);
                      toast.success("Client updated");
                      fetchClients();
                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    } catch (err) {
                      toast.error("Failed to update client");
                    }
                  }}
                />

                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="destructive">
                      <Delete />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle className="text-lg text-center text-destructive">
                        Xác nhận xoá
                      </DialogTitle>
                      <DialogDescription>
                        Bạn có chắc chắn muốn xoá khách hàng{" "}
                        <strong>{client.name}</strong>?
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="destructive"
                        onClick={async () => {
                          try {
                            await axiosInstance.delete(`/client/${client._id}`);
                            setClients((prev) =>
                              prev.filter((c) => c._id !== client._id)
                            );
                            toast.success("Xoá khách hàng thành công");
                          } catch (error) {
                            toast.error("Xoá thất bại");
                            console.error(error);
                          }
                        }}
                      >
                        Xoá
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <HistoryDialog
                  cardUid={client.cardId?.uid}
                  name={client.name}
                />
              </TableHead>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
