import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { SocketService } from '../services/socketService';

export class ConnectionController {
  // Send connection request
  static async sendRequest(req: any, res: Response) {
    try {
      const senderId = req.user?.userId;
      const { targetUserId } = req.params;

      if (senderId === targetUserId) {
        return res.status(400).json({ error: 'Cannot connect with yourself' });
      }

      // Check if target user exists
      const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
      if (!targetUser) return res.status(404).json({ error: 'User not found' });

      // Check existing connection
      const existing = await prisma.connection.findFirst({
        where: {
          OR: [
            { senderId, receiverId: targetUserId },
            { senderId: targetUserId, receiverId: senderId },
          ],
        },
      });

      if (existing) {
        if (existing.status === 'ACCEPTED') {
          return res.status(400).json({ error: 'Already connected with this user' });
        }
        if (existing.status === 'PENDING') {
          return res.status(400).json({ error: 'Connection request is already pending' });
        }
        // If rejected, update to pending
        const updated = await prisma.connection.update({
          where: { id: existing.id },
          data: { senderId, receiverId: targetUserId, status: 'PENDING' },
        });
        return res.json({ message: 'Connection request sent', connection: updated });
      }

      // Create new pending connection
      const connection = await prisma.connection.create({
        data: {
          senderId,
          receiverId: targetUserId,
          status: 'PENDING',
        },
      });

      // Create notification for receiver
      const sender = await prisma.user.findUnique({
        where: { id: senderId },
        select: { fullName: true },
      });

      const notification = await prisma.notification.create({
        data: {
          userId: targetUserId,
          type: 'CONNECTION_REQUEST',
          title: 'New Connection Request',
          message: `${sender?.fullName || 'Someone'} wants to connect with you.`,
          link: '/networking',
        },
      });

      SocketService.sendNotificationToUser(targetUserId, notification);

      return res.status(201).json({ message: 'Connection request sent', connection });
    } catch (err: any) {
      return res.status(500).json({ error: `Failed to send connection request: ${err.message}` });
    }
  }

  // Accept connection request
  static async acceptRequest(req: any, res: Response) {
    try {
      const userId = req.user?.userId;
      const { connectionId } = req.params;

      const connection = await prisma.connection.findUnique({
        where: { id: connectionId },
      });

      if (!connection) return res.status(404).json({ error: 'Connection request not found' });
      if (connection.receiverId !== userId) {
        return res.status(403).json({ error: 'Not authorized to accept this request' });
      }

      const updated = await prisma.connection.update({
        where: { id: connectionId },
        data: { status: 'ACCEPTED' },
      });

      // Create notification for sender
      const receiver = await prisma.user.findUnique({
        where: { id: userId },
        select: { fullName: true },
      });

      const notification = await prisma.notification.create({
        data: {
          userId: connection.senderId,
          type: 'CONNECTION_ACCEPTED',
          title: 'Connection Accepted',
          message: `${receiver?.fullName || 'Someone'} accepted your connection request.`,
          link: `/profile/${userId}`,
        },
      });

      SocketService.sendNotificationToUser(connection.senderId, notification);

      return res.json({ message: 'Connection accepted', connection: updated });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to accept connection request' });
    }
  }

  // Reject connection request
  static async rejectRequest(req: any, res: Response) {
    try {
      const userId = req.user?.userId;
      const { connectionId } = req.params;

      const connection = await prisma.connection.findUnique({
        where: { id: connectionId },
      });

      if (!connection) return res.status(404).json({ error: 'Connection request not found' });
      if (connection.receiverId !== userId) {
        return res.status(403).json({ error: 'Not authorized to reject this request' });
      }

      await prisma.connection.delete({ where: { id: connectionId } });
      return res.json({ message: 'Connection request ignored' });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to reject connection request' });
    }
  }

  // Remove connection or cancel pending request by target user ID
  static async removeConnection(req: any, res: Response) {
    try {
      const userId = req.user?.userId;
      const { targetUserId } = req.params;

      const connection = await prisma.connection.findFirst({
        where: {
          OR: [
            { senderId: userId, receiverId: targetUserId },
            { senderId: targetUserId, receiverId: userId },
          ],
        },
      });

      if (!connection) return res.status(404).json({ error: 'Connection not found' });

      await prisma.connection.delete({ where: { id: connection.id } });
      return res.json({ message: 'Connection removed' });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to remove connection' });
    }
  }

  // Get connection status between current user and target user
  static async getConnectionStatus(req: any, res: Response) {
    try {
      const userId = req.user?.userId;
      const { targetUserId } = req.params;

      if (!userId || userId === targetUserId) {
        return res.json({ status: 'SELF', connectionId: null });
      }

      const connection = await prisma.connection.findFirst({
        where: {
          OR: [
            { senderId: userId, receiverId: targetUserId },
            { senderId: targetUserId, receiverId: userId },
          ],
        },
      });

      if (!connection) {
        return res.json({ status: 'NONE', connectionId: null });
      }

      if (connection.status === 'ACCEPTED') {
        return res.json({ status: 'ACCEPTED', connectionId: connection.id });
      }

      if (connection.status === 'PENDING') {
        if (connection.senderId === userId) {
          return res.json({ status: 'PENDING_SENT', connectionId: connection.id });
        } else {
          return res.json({ status: 'PENDING_RECEIVED', connectionId: connection.id });
        }
      }

      return res.json({ status: 'NONE', connectionId: null });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to get connection status' });
    }
  }

  // Get all accepted connections for current user
  static async getUserConnections(req: any, res: Response) {
    try {
      const userId = req.user?.userId;

      const connections = await prisma.connection.findMany({
        where: {
          status: 'ACCEPTED',
          OR: [{ senderId: userId }, { receiverId: userId }],
        },
        include: {
          sender: {
            select: { id: true, fullName: true, headline: true, avatarUrl: true, role: true },
          },
          receiver: {
            select: { id: true, fullName: true, headline: true, avatarUrl: true, role: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const connectedUsers = connections.map((c) => {
        const friend = c.senderId === userId ? c.receiver : c.sender;
        return {
          ...friend,
          connectionId: c.id,
          connectedAt: c.createdAt,
        };
      });

      return res.json(connectedUsers);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch user connections' });
    }
  }

  // Get incoming pending requests for current user
  static async getPendingRequests(req: any, res: Response) {
    try {
      const userId = req.user?.userId;

      const pending = await prisma.connection.findMany({
        where: {
          receiverId: userId,
          status: 'PENDING',
        },
        include: {
          sender: {
            select: { id: true, fullName: true, headline: true, avatarUrl: true, role: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const formatted = pending.map((p) => ({
        id: p.id,
        sender: p.sender,
        createdAt: p.createdAt,
      }));

      return res.json(formatted);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch pending requests' });
    }
  }
}
