import { UserModel } from '../mvc/models/user.model';
import rootUser from '../data/root-user.json';
import bcrypt from 'bcrypt';

export const initRootUser = async (): Promise<void> => {
  try {
    // Check if any user exists
    const userCount = await UserModel.countDocuments();

    if (userCount === 0) {
      // Hash the password before saving
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(rootUser.password, salt);

      // Create root user with hashed password
      const user = new UserModel({
        username: rootUser.username,
        password: hashedPassword,
        role: rootUser.role,
      });

      await user.save();
      console.log('⚡️ [server]: Root user created successfully');
    } else {
      console.log('⚡️ [server]: Root user check completed - users exist');
    }
  } catch (error) {
    console.error('Error initializing root user:', error);
  }
};
