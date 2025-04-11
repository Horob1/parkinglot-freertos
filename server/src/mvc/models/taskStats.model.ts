// models/taskStats.model.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface ITaskStats extends Document {
  avg_rfid_in: number;
  avg_rfid_out: number;
  avg_servo_in: number;
  avg_servo_out: number;
  avg_wifi: number;
  avg_ws: number;
  avg_slot: number;
}

const TaskStatsSchema = new Schema<ITaskStats>(
  {
    avg_rfid_in: { type: Number, required: true },
    avg_rfid_out: { type: Number, required: true },
    avg_servo_in: { type: Number, required: true },
    avg_servo_out: { type: Number, required: true },
    avg_wifi: { type: Number, required: true },
    avg_ws: { type: Number, required: true },
    avg_slot: { type: Number, required: true },
  },
  { timestamps: true },
);

export const TaskStatsModel = mongoose.model<ITaskStats>('TaskStats', TaskStatsSchema);
