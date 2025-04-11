import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import toast from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { FilePenLine } from "lucide-react";


const clientSchema = z.object({
  name: z.string().min(1),
  cccd: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().optional(),
  address: z.string().optional(),
  carDescription: z.object({
    licensePlate: z.string().optional(),
    color: z.string().optional(),
    brand: z.string().optional(),
    model: z.string().optional(),
    image: z.string().optional(),
  }),
  cardId: z.string().optional(),
  avatar: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormDialogProps {
  defaultValues?: ClientFormData;
  onSubmit: (data: ClientFormData) => void;
  triggerLabel: string;
  isEdit?: boolean;
}

export const ClientFormDialog = ({
  defaultValues,
  onSubmit,
  triggerLabel,
  isEdit = false,
}: ClientFormDialogProps) => {
  const [unusedCards, setUnusedCards] = useState<
    { _id: string; uid: string }[]
  >([]);
  useEffect(() => {
    const fetchUnusedCards = async () => {
      try {
        const res = await axiosInstance.get("/card/unused");
        setUnusedCards(res.data);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        toast.error("Failed to load cards");
      }
    };

    fetchUnusedCards();
  }, []);
  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: defaultValues ?? {
      name: "",
      cccd: "",
      phone: "",
      email: "",
      address: "",
      carDescription: {
        licensePlate: "",
        color: "",
        brand: "",
        model: "",
        image: "",
      },
      cardId: "",
      avatar: "",
    },
  });

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axiosInstance.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data.file.url; // giả sử server trả về { url: "https://..." }
  };

  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={isEdit ? "outline" : "default"}>
          {triggerLabel === "Create Client" ? "Create Client" : <FilePenLine />}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-center">
            {isEdit ? "Edit Client" : "Create Client"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => {
              onSubmit(data);
              form.reset();
            })}
            className="grid grid-cols-2 gap-4 mt-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="avatar"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Avatar</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await uploadImage(file);
                          form.setValue("avatar", url);
                        }
                      }}
                    />
                  </FormControl>
                  {field.value && (
                    <img
                      src={import.meta.env.VITE_BASE_STATIC_URL + field.value}
                      alt="Avatar"
                      className="w-full object-cover mt-2 rounded-md"
                    />
                  )}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cccd"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CCCD</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Car Info */}
            <FormField
              control={form.control}
              name="carDescription.licensePlate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>License Plate</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="carDescription.color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Car Color</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="carDescription.brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Car Brand</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="carDescription.model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Car Model</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Card UID */}
            <FormField
              control={form.control}
              name="cardId"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Card UID</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unused card" />
                      </SelectTrigger>
                      <SelectContent>
                        {unusedCards.map((card) => (
                          <SelectItem key={card._id} value={card._id}>
                            {card.uid}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="carDescription.image"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Car Image</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await uploadImage(file);
                          console.log(url);
                          form.setValue("carDescription.image", url);
                        }
                      }}
                    />
                  </FormControl>
                  {field.value && (
                    <img
                      src={import.meta.env.VITE_BASE_STATIC_URL + field.value}
                      alt="Car"
                      className="w-full object-cover mt-2 rounded-md"
                    />
                  )}
                </FormItem>
              )}
            />

            <div className="col-span-2 flex justify-end pt-4">
              <Button type="submit">
                {isEdit ? "Save Changes" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
