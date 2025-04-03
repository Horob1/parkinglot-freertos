import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import axiosInstance from "@/lib/axios";
import ExcelJS from "exceljs";
import { useLayout } from "@/hooks/use-layout";
import toast from "react-hot-toast";
import { SelectValue } from "@radix-ui/react-select";
import { saveAs } from "file-saver";

export const Log = () => {
  const contentHieght = useLayout();
  const { register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/log", {
        params: { date: data.date, period: selectedPeriod },
      });

      const logs = response.data.logs;

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Logs");

      // Thêm dữ liệu vào file Excel
      // Thêm header với tên cột
      const headers = [
        "STT", // Số thứ tự
        "ID",
        "Mã Thẻ",
        "Đã Checkout",
        "Hóa Đơn (VNĐ)",
        "Ngày Tạo",
        "Ngày Cập Nhật",
      ];
      worksheet.addRow(headers);

      // Style cho Header
      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFF" } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "0070C0" }, // Màu xanh đậm
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
      });

      // Thêm dữ liệu vào file Excel
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      logs.forEach((log: any, index: number) => {
        const row = [
          index + 1,
          log._id,
          log.cardId,
          log.isCheckout ? "Có" : "Không",
          log.bill || "N/A",
          new Date(log.createdAt).toLocaleString(),
          new Date(log.updatedAt).toLocaleString(),
        ];

        const addedRow = worksheet.addRow(row);

        // Xen kẽ màu dòng
        if (index % 2 === 1) {
          addedRow.eachCell((cell) => {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "F2F2F2" }, // Màu xám nhạt
            };
          });
        }
      });

      // Căn chỉnh độ rộng cột
      worksheet.columns.forEach((column) => {
        column.width = 20;
      });

      // Xuất file
      const blob = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([blob]), `logs-${data.date}-${selectedPeriod}.xlsx`);
      //download the file
      toast.success("Downloaded logs successfully");
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast.error("Failed to fetch logs");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center w-full"
      style={{ height: contentHieght, maxHeight: contentHieght }}
    >
      <div className="max-w-lg min-w-xs p-6 bg-muted  shadow-md rounded-lg">
        <h2 className="text-xl font-bold mb-4 text-center">Export Logs</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input type="date" {...register("date", { required: true })} />
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>

          <Button
            type="submit"
            className="w-full cursor-pointer"
            disabled={loading}
          >
            {loading ? "Processing..." : "Download Logs"}
          </Button>
        </form>
      </div>
    </div>
  );
};
