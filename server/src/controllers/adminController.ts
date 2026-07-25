import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export class AdminController {
  static async getUsers(req: Request, res: Response) {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true, email: true, fullName: true, headline: true,
          role: true, isVerified: true, avatarUrl: true, createdAt: true,
          _count: { select: { posts: true, jobApplications: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      return res.json(users);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  static async updateUserRole(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      if (!['USER', 'RECRUITER', 'ADMIN'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role value' });
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: { role },
        select: { id: true, email: true, role: true },
      });

      return res.json({ message: 'User role updated', user });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to update user role' });
    }
  }

  static async getReports(req: Request, res: Response) {
    try {
      const reports = await prisma.report.findMany({
        include: {
          reporter: { select: { fullName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
      return res.json(reports.map(r => ({
        id: r.id,
        reporterName: r.reporter.fullName,
        reporterEmail: r.reporter.email,
        targetType: r.targetType,
        targetId: r.targetId,
        reason: r.reason,
        status: r.status,
        createdAt: r.createdAt,
      })));
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch reports' });
    }
  }

  static async resolveReport(req: Request, res: Response) {
    try {
      const { reportId } = req.params;
      const report = await prisma.report.update({
        where: { id: reportId },
        data: { status: 'RESOLVED' },
      });
      return res.json({ message: 'Report resolved', report });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to resolve report' });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      await prisma.user.delete({ where: { id: userId } });
      return res.json({ message: 'User deleted successfully' });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to delete user' });
    }
  }

  static async getSystemLogs(req: Request, res: Response) {
    try {
      const [aiLogs, recentUsers, recentPosts] = await Promise.all([
        prisma.aIUsageLog.findMany({
          include: { user: { select: { fullName: true, email: true } } },
          orderBy: { createdAt: 'desc' },
          take: 20,
        }),
        prisma.user.count(),
        prisma.post.count(),
      ]);

      const logs = [
        {
          timestamp: new Date().toISOString(),
          level: 'INFO',
          message: `Platform stats: ${recentUsers} users, ${recentPosts} posts in PostgreSQL`
        },
        ...aiLogs.map(l => ({
          timestamp: l.createdAt,
          level: 'INFO',
          message: `AI ${l.feature} by ${l.user.email} — ${l.tokensUsed} tokens`
        }))
      ];

      return res.json(logs);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch system logs' });
    }
  }

  static async getDashboardStats(req: Request, res: Response) {
    try {
      const [users, posts, jobs, applications, reports] = await Promise.all([
        prisma.user.count(),
        prisma.post.count(),
        prisma.job.count(),
        prisma.jobApplication.count(),
        prisma.report.count({ where: { status: 'PENDING' } }),
      ]);

      return res.json({ users, posts, jobs, applications, pendingReports: reports });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
  }
}
