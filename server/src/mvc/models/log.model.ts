import mongoose, { Document, ObjectId, Schema } from 'mongoose';

interface ILog extends Document {
  cardId: ObjectId;
  isCheckout: boolean;
  bill: number;
  createdAt: Date;
  updatedAt: Date;
}

const LogModel = mongoose.model<ILog>(
  'Logs',
  new Schema<ILog>(
    {
      cardId: { type: Schema.Types.ObjectId, required: true },
      isCheckout: { type: Boolean, required: true },
      bill: { type: Number, default: null },
    },
    {
      timestamps: true,
    },
  ),
);

export { LogModel, ILog };
