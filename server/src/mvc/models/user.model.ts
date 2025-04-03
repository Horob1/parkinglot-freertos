import mongoose, { Document, Schema } from 'mongoose';

interface IUser extends Document {
  role: string;
  username: string;
  password: string;
}

const UserModel = mongoose.model<IUser>(
  'Users',
  new Schema<IUser>({
    role: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  }),
);

export { UserModel, IUser };
