import { Request, Response } from 'express';
import { ClientModel } from '../models/client.model';
import { LogModel } from '../models/log.model';

export const getAllClients = async (_req: Request, res: Response): Promise<void> => {
  try {
    const clients = await ClientModel.find().populate('cardId').sort({ createdAt: -1 });
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching clients',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getClientById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const client = await ClientModel.findById(id);
    if (!client) {
      res.status(404).json({ message: 'Client not found' });
      return;
    }

    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching client',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const createClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cccd, avatar, name, phone, email, address, carDescription, cardId } = req.body;
    if (!cccd || !avatar || !name || !phone || !email || !address || !carDescription) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }
    if (!carDescription.licensePlate || !carDescription.color || !carDescription.brand || !carDescription.model) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }
    if (cardId) {
      const isExist = await ClientModel.findOne({ cardId });
      if (isExist) {
        res.status(409).json({ message: 'Card is used in a parking log' });
        return;
      }

      const [isCardUsed, isCardUsed2] = await Promise.all([ClientModel.findOne({ cardId }), LogModel.findOne({ cardId, isCheckout: false })]);

      if (isCardUsed || isCardUsed2) {
        res.status(409).json({ message: 'Card is used in a parking log' });
        return;
      }
    }
    const client = new ClientModel({ cccd, avatar, name, phone, email, address, carDescription, cardId: cardId });
    const savedClient = await client.save();
    res.status(201).json(savedClient);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Error creating client',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const updateClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { cccd, avatar, name, phone, email, address, carDescription, cardId } = req.body;
    if (!cccd || !name || !phone || !email || !address || !carDescription) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }
    if (!carDescription.licensePlate || !carDescription.color || !carDescription.brand || !carDescription.model) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    if (cardId) {
      const isExist = await ClientModel.findOne({ cardId });
      if (isExist) {
        res.status(409).json({ message: 'Card is used in a parking log' });
        return;
      }

      const [isCardUsed, isCardUsed2] = await Promise.all([
        ClientModel.findOne({ cardId, _id: { $ne: id } }),
        LogModel.findOne({ cardId, isCheckout: false }),
      ]);
      if (isCardUsed || isCardUsed2) {
        res.status(409).json({ message: 'Card is used in a parking log' });
        return;
      }
    }

    const updatedClient = await ClientModel.findById(id);
    if (!updatedClient) {
      res.status(404).json({ message: 'Client not found' });
      return;
    }
    updatedClient.cccd = cccd ?? updatedClient.cccd;
    updatedClient.avatar = avatar ?? updatedClient.avatar;
    updatedClient.name = name ?? updatedClient.name;
    updatedClient.phone = phone ?? updatedClient.phone;
    updatedClient.email = email ?? updatedClient.email;
    updatedClient.address = address ?? updatedClient.address;
    updatedClient.carDescription.brand = carDescription.brand ?? updatedClient.carDescription.brand;
    updatedClient.carDescription.color = carDescription.color ?? updatedClient.carDescription.color;
    updatedClient.carDescription.licensePlate = carDescription.licensePlate ?? updatedClient.carDescription.licensePlate;
    updatedClient.carDescription.model = carDescription.model ?? updatedClient.carDescription.model;
    updatedClient.carDescription.image = carDescription.image ?? updatedClient.carDescription.image;
    updatedClient.cardId = cardId ?? updatedClient.cardId;
    const savedClient = await updatedClient.save();

    res.status(200).json(savedClient);
  } catch (error) {
    res.status(500).json({
      message: 'Error updating client',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const deleteClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    const log = await LogModel.findOne({ clientId: id, isCheckout: false });
    if (log) {
      res.status(409).json({ message: 'Client is used in a parking log' });
      return;
    }

    // update unchecked log
    await ClientModel.findByIdAndDelete(id), res.status(200).json({ message: 'Client deleted successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting client',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
