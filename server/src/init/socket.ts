import { Server } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import { SlotModel } from '../mvc/models/slot.model';
import { CardModel } from '../mvc/models/card.model';
import { LogModel } from '../mvc/models/log.model';

export let wss: WebSocketServer;
const clients = new Map<string, WebSocket>();
const appClients = new Set<WebSocket>();

export const initSocket = (httpServer: Server) => {
  wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', ws => {
    console.log(`⚡️ [WebSocket]: New client connected`);

    ws.on('message', async message => {
      try {
        const data = JSON.parse(message.toString());
        console.log(`[WebSocket]: Received message: ${message}`);

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
            }
            if (data.clientType === 'app') {
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
              const isExist = await LogModel.findOne({ cardId: card._id, isCheckout: false });
              if (isExist) {
                console.log(`❌ [WebSocket]: Card already checked in`);
                ws.send(JSON.stringify({ type: 'error', message: 'Card already checked in' }));
                return;
              }
              const log = new LogModel({ cardId: card._id, isCheckout: false });
              await log.save();
              console.log(`✅ [WebSocket]: Checked in card ${card.uid}`);
              ws.send(JSON.stringify({ type: 'check-in-success', message: 'Checked in successfully' }));
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
              const isExist = await LogModel.findOne({ cardId: card._id, isCheckout: false });
              if (!isExist) {
                console.log(`❌ [WebSocket]: Card not checked in`);
                ws.send(JSON.stringify({ type: 'error', message: 'Card not checked in' }));
                return;
              }
              isExist.isCheckout = true;
              // Tính tiền nếu dưới 1 giờ thì 10000 vnđ/giờ
              // Tính tiền nếu trên 1 giờ thì 20000 vnđ/giờ
              const bill = Math.ceil((Date.now() - isExist.createdAt.getTime()) / 3600000) * 10000;
              isExist.bill = bill;
              await isExist.save();
              console.log(`✅ [WebSocket]: Checked out card ${card.uid}`);
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
