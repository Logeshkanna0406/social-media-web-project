import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { logger } from '../utils/logger';

export class SocketService {
  private static io: SocketIOServer;
  private static userSockets: Map<string, string> = new Map(); // userId -> socketId

  static init(server: HTTPServer, corsOrigin: string) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: corsOrigin,
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.io.on('connection', (socket: Socket) => {
      logger.info(`Socket client connected: ${socket.id}`);

      socket.on('register_user', (userId: string) => {
        this.userSockets.set(userId, socket.id);
        socket.emit('online_users_list', Array.from(this.userSockets.keys()));
        this.io.emit('user_online_status', { userId, status: 'online' });
        logger.info(`User registered to socket: ${userId}`);
      });

      socket.on('join_channel', (channelId: string) => {
        socket.join(channelId);
        logger.info(`Socket ${socket.id} joined channel ${channelId}`);
      });

      socket.on('typing_start', ({ channelId, userId, userName }) => {
        socket.to(channelId).emit('user_typing', { channelId, userId, userName, isTyping: true });
      });

      socket.on('typing_stop', ({ channelId, userId }) => {
        socket.to(channelId).emit('user_typing', { channelId, userId, isTyping: false });
      });

      socket.on('send_message', (messageData) => {
        if (messageData.channelId) {
          this.io.to(messageData.channelId).emit('new_message', messageData);
        } else if (messageData.receiverId) {
          const receiverSocketId = this.userSockets.get(messageData.receiverId);
          if (receiverSocketId) {
            this.io.to(receiverSocketId).emit('new_message', messageData);
          }
          socket.emit('new_message', messageData);
        }
      });

      socket.on('disconnect', () => {
        let disconnectedUser = '';
        for (const [uId, sId] of this.userSockets.entries()) {
          if (sId === socket.id) {
            disconnectedUser = uId;
            this.userSockets.delete(uId);
            break;
          }
        }
        if (disconnectedUser) {
          this.io.emit('user_online_status', { userId: disconnectedUser, status: 'offline' });
        }
        logger.info(`Socket client disconnected: ${socket.id}`);
      });
    });

    return this.io;
  }

  static sendNotificationToUser(userId: string, notification: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId && this.io) {
      this.io.to(socketId).emit('notification', notification);
    }
  }
}
