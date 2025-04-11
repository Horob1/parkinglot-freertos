import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import axiosInstance from "@/lib/axios";

export const Setting = () => {
  const [unitPrice, setUnitPrice] = useState("10000"); // default value
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUnitPrice = async () => {
      try {
        const response = await axiosInstance.get("/config/bill");
        setUnitPrice(response.data.value);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        toast.error("Fetch unit price failed");
      }
    };
    fetchUnitPrice();
  }, []);
  const handleSave = async () => {
    setLoading(true);

    try {
      await axiosInstance.put("/config/bill", { value: Number(unitPrice) });
      toast.success("Save successfully");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>System Setting</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="unitPrice">Price per hour (VNĐ)</Label>
            <Input
              id="unitPrice"
              type="number"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              placeholder="Enter price"
            />
          </div>

          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Setting"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
