import mongoose, { Document, Schema } from 'mongoose';

interface ICard extends Document {
  uid: string;
}

const CardModel = mongoose.model<ICard>(
  'Cards',
  new Schema<ICard>(
    {
      uid: { type: String, required: true, unique: true },
    },
    { timestamps: true },
  ),
);

export { CardModel, ICard };
