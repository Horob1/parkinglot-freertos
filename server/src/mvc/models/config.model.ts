import mongoose, { Document, Schema } from 'mongoose';

interface IConfig extends Document {
  name: string;
  value: string;
}

const ConfigModel = mongoose.model<IConfig>(
  'Configs',
  new Schema<IConfig>(
    {
      name: { type: String, required: true, unique: true },
      value: { type: String, required: true },
    },
    { timestamps: true },
  ),
);

export { ConfigModel, IConfig };
