import { Server } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import { SlotModel } from '../mvc/models/slot.model';
import { CardModel } from '../mvc/models/card.model';
import { LogModel } from '../mvc/models/log.model';
import { ConfigModel } from '../mvc/models/config.model';
import { TaskStatsModel } from '../mvc/models/taskStats.model';
import { ClientModel } from '../mvc/models/client.model';

export let wss: WebSocketServer;
const clients = new Map<string, WebSocket>();
const appClients = new Set<WebSocket>();

export const initSocket = (httpServer: Server) => {
  wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', ws => {
    console.log(`⚡️ [WebSocket]: New client connected`);

    ws.on('message', async message => {
      console.log(`[WebSocket]: Received message: ${message}`);
      try {
        const data = JSON.parse(message.toString());
        switch (data.type) {
          case 'auth':
            if (data.clientType === 'admin' || data.clientType === 'esp') {
              clients.set(data.clientType, ws);
              console.log(`✅ [WebSocket]: Registered as ${data.clientType}`);
              const admin = clients.get('admin');
              if (admin) {
                const slots = await SlotModel.find();
                admin.send(JSON.stringify({ type: 'update-slots', slots: slots }));
              }
            } else if (data.clientType === 'app') {
              console.log(`✅ [WebSocket]: Registered as app`);
              appClients.add(ws);
            } else {
              console.log(`❌ [WebSocket]: Invalid client type`);
              ws.close();
            }
            break;
          case 'check-in':
            if (true) {
              const uid = data.uid.toUpperCase();
              const card = await CardModel.findOne({ uid });
              if (!card) {
                console.log(`❌ [WebSocket]: Card not found`);
                ws.send(JSON.stringify({ type: 'error', message: 'Card not found' }));
                return;
              }
              const client = await ClientModel.findOne({ cardId: card._id });
              if (!client) {
                console.log(`❌ [WebSocket]: Client not found`);
                ws.send(JSON.stringify({ type: 'error', message: 'Client not found' }));
                return;
              }
              const isExist = await LogModel.findOne({ cardId: card._id, isCheckout: false });
              if (isExist) {
                console.log(`❌ [WebSocket]: Card already checked in`);
                ws.send(JSON.stringify({ type: 'error', message: 'Card already checked in' }));
                return;
              }
              const log = new LogModel({ cardId: card._id, clientId: client._id, isCheckout: false });
              await log.save();
              ws.send(JSON.stringify({ type: 'check-in-success', message: 'Checked in successfully' }));
              const logGiveToClient = await LogModel.findOne({ cardId: card._id, isCheckout: false }).populate('clientId cardId');
              const billPerHour = await ConfigModel.findOne({ name: 'billPerHour' });
              if (!billPerHour) {
                console.log(`❌ [WebSocket]: Bill per hour config not found`);
                ws.send(JSON.stringify({ type: 'error', message: 'Bill per hour config not found' }));
                return;
              }
              logGiveToClient.bill = Math.ceil((Date.now() - logGiveToClient.createdAt.getTime()) / 3600000) * Number(billPerHour.value);
              console.log(`✅ [WebSocket]: Checked in card ${card.uid}`);
              const admin = clients.get('admin');
              if (admin) {
                admin.send(JSON.stringify({ type: 'update-logs-in', log: logGiveToClient }));
              }
            }

            break;
          case 'check-out':
            if (true) {
              const uid = data.uid.toUpperCase();
              const card = await CardModel.findOne({ uid });
              if (!card) {
                console.log(`❌ [WebSocket]: Card not found`);
                ws.send(JSON.stringify({ type: 'error', message: 'Card not found' }));
                return;
              }
              const isExist = await LogModel.findOne({ cardId: card._id, isCheckout: false }).populate('clientId cardId');
              if (!isExist) {
                console.log(`❌ [WebSocket]: Card not checked in`);
                ws.send(JSON.stringify({ type: 'error', message: 'Card not checked in' }));
                return;
              }
              isExist.isCheckout = true;
              const config = await ConfigModel.findOne({ name: 'billPerHour' });
              if (!config) {
                console.log(`❌ [WebSocket]: Config not found`);
                ws.send(JSON.stringify({ type: 'error', message: 'Config not found' }));
                return;
              }
              const bill = Math.ceil((Date.now() - isExist.createdAt.getTime()) / 3600000) * Number(config.value);
              isExist.bill = bill;
              await isExist.save();
              console.log(`✅ [WebSocket]: Checked out card ${card.uid}`);
              const admin = clients.get('admin');
              if (admin) {
                admin.send(JSON.stringify({ type: 'update-logs-out', log: isExist }));
              }
              ws.send(JSON.stringify({ type: 'check-out-success', message: 'Checked out successfully', bill: bill.toString() }));
            }

            break;
          case 'update-slot':
            const admin = clients.get('admin');
            const slot_1 = data.slot_1.toString() === '1';
            const slot_2 = data.slot_2.toString() === '1';
            await Promise.all([
              SlotModel.findOneAndUpdate({ number: 1 }, { isEmpty: slot_1 }, { new: true }),
              SlotModel.findOneAndUpdate({ number: 2 }, { isEmpty: slot_2 }, { new: true }),
            ]);
            const slots = await SlotModel.find();
            if (admin) {
              admin.send(JSON.stringify({ type: 'update-slots', slots: slots }));
            }
            appClients.forEach(client => {
              client.send(JSON.stringify({ type: 'update-slots', slots: slots }));
            });
            break;
          case 'task-stats':
            try {
              const { avg_rfid_in, avg_rfid_out, avg_servo_in, avg_servo_out, avg_wifi, avg_ws, avg_slot } = data;

              const stats = new TaskStatsModel({
                avg_rfid_in,
                avg_rfid_out,
                avg_servo_in,
                avg_servo_out,
                avg_wifi,
                avg_ws,
                avg_slot,
              });

              await stats.save();
              console.log('✅ [WebSocket]: Task stats saved');

              const admin = clients.get('admin');
              if (admin) {
                admin.send(JSON.stringify({ type: 'update-task-stats', stats }));
              }
            } catch (error) {
              console.error('❌ [WebSocket]: Failed to save task stats', error);
            }
            break;
          default:
            console.log(`❌ [WebSocket]: Unknown message type`);
            break;
        }
      } catch (error) {
        console.log('❌ [WebSocket]: Invalid message format', error);
      }
    });

    ws.on('close', () => {
      console.log(`❌ [WebSocket]: Client disconnected`);
      for (const [key, client] of clients.entries()) {
        if (client === ws) {
          clients.delete(key);
          break;
        }
      }
      appClients.delete(ws);
    });
  });
};
