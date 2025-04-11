import mongoose, { Document, ObjectId, Schema } from 'mongoose';

interface IClient extends Document {
  cccd: string;
  avatar: string;
  name: string;
  phone: string;
  email: string;
  cardId: ObjectId;
  address: string;
  carDescription: {
    licensePlate: string;
    color: string;
    brand: string;
    model: string;
    image: string;
  };
}

const ClientModel = mongoose.model<IClient>(
  'Clients',
  new Schema<IClient>(
    {
      cccd: { type: String, required: true, unique: true },
      avatar: { type: String, required: true },
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
      cardId: { type: Schema.Types.ObjectId, ref: 'Cards' },
      address: { type: String, required: true },
      carDescription: {
        licensePlate: { type: String, required: true },
        color: { type: String, required: true },
        brand: { type: String, required: true },
        model: { type: String, required: true },
        image: { type: String, required: true },
      },
    },
    { timestamps: true },
  ),
);

export { ClientModel, IClient };
