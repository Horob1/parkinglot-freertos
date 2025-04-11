import { ConfigModel } from '../mvc/models/config.model';
import rootConfig from '../data/root-config.json';

export const initRootConfig = async (): Promise<void> => {
  try {
    const configCount = await ConfigModel.countDocuments();

    if (configCount === 0) {
      const newConfig = new ConfigModel({
        name: rootConfig.name,
        value: Number(rootConfig.value),
      });
      await newConfig.save();

      console.log('⚡️ [server]: Root config created successfully');
    } else {
      console.log('⚡️ [server]: Root config check completed - users exist');
    }
  } catch (error) {
    console.error('Error initializing root config:', error);
  }
};
