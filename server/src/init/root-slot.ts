import { SlotModel } from '../mvc/models/slot.model';
import rootSlot from '../data/root-slot.json';

export const initRootSlot = async (): Promise<void> => {
  try {
    const slotsCount = await SlotModel.countDocuments();

    if (slotsCount === 0) {
      await Promise.all([
        ...rootSlot.map(slot => {
          const newSlot = new SlotModel(slot);
          return newSlot.save();
        }),
      ]);
      console.log('⚡️ [server]: Root slots created successfully');
    } else {
      console.log('⚡️ [server]: Root slots check completed - users exist');
    }
  } catch (error) {
    console.error('Error initializing root slots:', error);
  }
};
