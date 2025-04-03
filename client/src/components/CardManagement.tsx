/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { toast } from "react-hot-toast";
import axiosInstance from "@/lib/axios";
import { useLayout } from "@/hooks/use-layout";

interface Card {
  _id: string;
  uid: string;
  createdAt: string;
}

const CardManagement = () => {
  const contentHieght = useLayout(); // Lấy contentHeight từ Context
  const [cards, setCards] = useState<Card[]>([]);
  const [uid, setUid] = useState("");
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchCards = async () => {
    try {
      const res = await axiosInstance.get("/card");
      console.log(res.data);
      setCards(res.data);
    } catch (error: any) {
      toast.error("Cannot load card list");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleSubmit = async () => {
    try {
      if (editingCard) {
        await axiosInstance.put(`/card/${editingCard._id}`, { uid });
        toast.success("Update card successfully");
      } else {
        await axiosInstance.post("/card", { uid });
        toast.success("Create card successfully");
      }
      setIsDialogOpen(false);
      fetchCards();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "System error");
    }
  };

  // Xóa thẻ
  const handleDelete = async (id: string) => {
    if (!window.confirm("Do you want to delete this card?")) return;
    try {
      await axiosInstance.delete(`/card/${id}`);
      toast.success("Delete card successfully");
      fetchCards();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "System error");
    }
  };

  return (
    <div
      className="p-6 space-y-4 overflow-y-auto"
      style={{ maxHeight: contentHieght, height: contentHieght }}
    >
      <h1 className="text-2xl font-bold text-center">Card Management</h1>
      <Button
        onClick={() => {
          setEditingCard(null);
          setUid("");
          setIsDialogOpen(true);
        }}
      >
        Create Card
      </Button>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>UID Code</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cards?.map((card, index) => (
            <TableRow key={card._id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell className="font-medium uppercase">
                {card.uid}
              </TableCell>
              <TableCell>{new Date(card.createdAt).toLocaleString()}</TableCell>
              <TableCell>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingCard(card);
                    setUid(card.uid);
                    setIsDialogOpen(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(card._id)}
                  className="ml-2"
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Dialog Thêm/Sửa Thẻ */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogTitle>{editingCard ? "Edit Card" : "Create Card"}</DialogTitle>
          <Input
            placeholder="Type UID"
            value={uid}
            onChange={(e) => setUid(e.target.value)}
          />
          <Button onClick={handleSubmit} className="w-full mt-2">
            {editingCard ? "Update" : "Create"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CardManagement;
