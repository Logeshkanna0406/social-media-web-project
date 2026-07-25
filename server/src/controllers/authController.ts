import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { logger } from '../utils/logger';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { email, password, fullName, headline, role } = req.body;

      if (!email || !password || !fullName) {
        return res.status(400).json({ error: 'Missing required fields: email, password, fullName' });
      }

      const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
      if (existingUser) {
        return res.status(409).json({ error: 'Email is already registered' });
      }

      const hashedPassword = await hashPassword(password);

      const user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash: hashedPassword,
          fullName,
          headline: headline || 'Professional at ConnectHub AI',
          role: role === 'RECRUITER' ? 'RECRUITER' : 'USER',
          isVerified: true,
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName)}`,
          coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
          // Create empty profile alongside user
          profile: { create: {} },
        },
        select: {
          id: true, email: true, fullName: true, headline: true, role: true,
          isVerified: true, avatarUrl: true, coverUrl: true, createdAt: true,
        },
      });

      const payload = { userId: user.id, email: user.email, role: user.role };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      return res.status(201).json({ message: 'User registered successfully', user, accessToken, refreshToken });
    } catch (err: any) {
      logger.error(`Register error: ${err.message}`);
      return res.status(500).json({ error: 'Failed to register user' });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
      if (!user || !user.passwordHash) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValid = await comparePassword(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const payload = { userId: user.id, email: user.email, role: user.role };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      const { passwordHash, ...userWithoutPassword } = user;
      return res.json({ message: 'Login successful', user: userWithoutPassword, accessToken, refreshToken });
    } catch (err: any) {
      logger.error(`Login error: ${err.message}`);
      return res.status(500).json({ error: 'Authentication failed' });
    }
  }

  static async googleLogin(req: Request, res: Response) {
    try {
      const { email, name, picture } = req.body;
      if (!email) return res.status(400).json({ error: 'Google email required' });

      let user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: email.toLowerCase(),
            fullName: name || 'Google User',
            headline: 'ConnectHub AI Professional',
            isVerified: true,
            avatarUrl: picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || 'google')}`,
            coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
            profile: { create: {} },
          },
        });
      }

      const payload = { userId: user.id, email: user.email, role: user.role };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      const { passwordHash, ...userWithoutPassword } = user;
      return res.json({ message: 'Google login successful', user: userWithoutPassword, accessToken, refreshToken });
    } catch (err: any) {
      logger.error(`Google login error: ${err.message}`);
      return res.status(500).json({ error: 'Google auth failed' });
    }
  }

  static async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });

      const decoded = verifyRefreshToken(refreshToken);
      const newAccessToken = generateAccessToken({
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      });
      return res.json({ accessToken: newAccessToken });
    } catch {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
  }

  static async getMe(req: any, res: Response) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user?.userId },
        select: {
          id: true, email: true, fullName: true, headline: true, role: true,
          isVerified: true, avatarUrl: true, coverUrl: true, createdAt: true,
        },
      });
      if (!user) return res.status(404).json({ error: 'User not found' });
      return res.json(user);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch user' });
    }
  }
}
