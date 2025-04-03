import mongoose, { Document } from 'mongoose';

interface ISlot extends Document {
  number: number;
  isEmpty: boolean;
}

const SlotModel = mongoose.model<ISlot>(
  'Slots',
  new mongoose.Schema<ISlot>(
    {
      number: { type: Number, required: true },
      isEmpty: { type: Boolean, default: true },
    },
    { timestamps: true },
  ),
);

export { SlotModel, ISlot };
