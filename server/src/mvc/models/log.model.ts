import mongoose, { Document, ObjectId, Schema } from 'mongoose';

interface ILog extends Document {
  cardId: ObjectId;
  clientId: ObjectId;
  isCheckout: boolean;
  bill: number;
  createdAt: Date;
  updatedAt: Date;
}

const LogModel = mongoose.model<ILog>(
  'Logs',
  new Schema<ILog>(
    {
      cardId: { type: Schema.Types.ObjectId, required: true, ref: 'Cards' },
      clientId: { type: Schema.Types.ObjectId, required: true, ref: 'Clients' },
      isCheckout: { type: Boolean, required: true },
      bill: { type: Number, default: null },
    },
    {
      timestamps: true,
    },
  ),
);

export { LogModel, ILog };
