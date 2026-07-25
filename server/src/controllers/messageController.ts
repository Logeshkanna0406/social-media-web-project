import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

const messageSelect = {
  id: true,
  channelId: true,
  senderId: true,
  receiverId: true,
  content: true,
  imageUrl: true,
  isRead: true,
  createdAt: true,
  sender: {
    select: { id: true, fullName: true, avatarUrl: true },
  },
};

const shapeMessage = (m: any) => ({
  id: m.id,
  channelId: m.channelId,
  senderId: m.senderId,
  senderName: m.sender?.fullName || 'Member',
  senderAvatar: m.sender?.avatarUrl || '',
  receiverId: m.receiverId,
  content: m.content,
  imageUrl: m.imageUrl,
  isRead: m.isRead,
  createdAt: m.createdAt,
});

export class MessageController {
  static async getChannelMessages(req: Request, res: Response) {
    try {
      const { channelId } = req.params;
      const cursor = req.query.cursor as string | undefined;

      const messages = await prisma.message.findMany({
        where: { channelId },
        include: { sender: { select: { id: true, fullName: true, avatarUrl: true } } },
        orderBy: { createdAt: 'asc' },
        take: 50,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      });

      return res.json(messages.map(shapeMessage));
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch channel messages' });
    }
  }

  static async getDirectMessages(req: any, res: Response) {
    try {
      const userId = req.user?.userId;
      const { partnerId } = req.params;

      const messages = await prisma.message.findMany({
        where: {
          channelId: null,
          OR: [
            { senderId: userId, receiverId: partnerId },
            { senderId: partnerId, receiverId: userId },
          ],
        },
        include: { sender: { select: { id: true, fullName: true, avatarUrl: true } } },
        orderBy: { createdAt: 'asc' },
        take: 100,
      });

      // Mark as read
      await prisma.message.updateMany({
        where: { senderId: partnerId, receiverId: userId, isRead: false },
        data: { isRead: true },
      });

      return res.json(messages.map(shapeMessage));
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch direct messages' });
    }
  }

  static async getConversationList(req: any, res: Response) {
    try {
      const userId = req.user?.userId;

      // Get unique conversation partners
      const sentMessages = await prisma.message.findMany({
        where: { senderId: userId, channelId: null },
        distinct: ['receiverId'],
        select: { receiverId: true, createdAt: true, content: true },
        orderBy: { createdAt: 'desc' },
      });

      const receivedMessages = await prisma.message.findMany({
        where: { receiverId: userId, channelId: null },
        distinct: ['senderId'],
        select: { senderId: true, createdAt: true, content: true },
        orderBy: { createdAt: 'desc' },
      });

      const partnerIds = new Set([
        ...sentMessages.map(m => m.receiverId!),
        ...receivedMessages.map(m => m.senderId),
      ]);

      const partners = await prisma.user.findMany({
        where: { id: { in: Array.from(partnerIds) } },
        select: { id: true, fullName: true, avatarUrl: true, headline: true },
      });

      return res.json(partners);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  }

  static async sendMessage(req: any, res: Response) {
    try {
      const senderId = req.user?.userId;
      const { channelId, receiverId, content, imageUrl } = req.body;

      if (!content?.trim() && !imageUrl) {
        return res.status(400).json({ error: 'Message content or media required' });
      }

      const message = await prisma.message.create({
        data: {
          senderId,
          receiverId: receiverId || null,
          channelId: channelId || null,
          content: content || '',
          imageUrl: imageUrl || null,
        },
        include: { sender: { select: { id: true, fullName: true, avatarUrl: true } } },
      });

      return res.status(201).json(shapeMessage(message));
    } catch (err: any) {
      return res.status(500).json({ error: `Failed to send message: ${err.message}` });
    }
  }

  static async getUnreadCount(req: any, res: Response) {
    try {
      const userId = req.user?.userId;
      const count = await prisma.message.count({
        where: { receiverId: userId, isRead: false },
      });
      return res.json({ unreadCount: count });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to get unread count' });
    }
  }
}
