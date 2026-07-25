import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { uploadToCloudinary } from '../services/cloudinaryService';

const userSelect = {
  id: true, email: true, fullName: true, headline: true, role: true,
  isVerified: true, avatarUrl: true, coverUrl: true, createdAt: true,
};

export class UserController {
  static async getProfile(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          ...userSelect,
          profile: {
            include: {
              skills: true,
              experiences: { orderBy: { startDate: 'desc' } },
              education: { orderBy: { startDate: 'desc' } },
            },
          },
        },
      });
      if (!user) return res.status(404).json({ error: 'User not found' });

      const { profile, ...userData } = user;
      return res.json({ user: userData, profile: profile || {} });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch profile' });
    }
  }

  static async updateProfile(req: any, res: Response) {
    try {
      const userId = req.user?.userId;
      const {
        fullName, headline, avatarDataUri, coverDataUri,
        bio, location, websiteUrl, githubUrl, linkedinUrl, twitterUrl,
        skills, experiences, education,
      } = req.body;

      // Handle Cloudinary uploads if new images provided (base64 data URIs)
      let avatarUrl: string | undefined;
      let coverUrl: string | undefined;

      if (avatarDataUri && avatarDataUri.startsWith('data:')) {
        avatarUrl = await uploadToCloudinary(avatarDataUri, 'connecthub/avatars');
      }
      if (coverDataUri && coverDataUri.startsWith('data:')) {
        coverUrl = await uploadToCloudinary(coverDataUri, 'connecthub/covers');
      }

      // Update core user fields
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(fullName && { fullName }),
          ...(headline && { headline }),
          ...(avatarUrl && { avatarUrl }),
          ...(coverUrl && { coverUrl }),
        },
        select: userSelect,
      });

      // Upsert Profile
      const profile = await prisma.profile.upsert({
        where: { userId },
        create: {
          userId,
          bio, location, websiteUrl, githubUrl, linkedinUrl, twitterUrl,
        },
        update: {
          ...(bio !== undefined && { bio }),
          ...(location !== undefined && { location }),
          ...(websiteUrl !== undefined && { websiteUrl }),
          ...(githubUrl !== undefined && { githubUrl }),
          ...(linkedinUrl !== undefined && { linkedinUrl }),
          ...(twitterUrl !== undefined && { twitterUrl }),
        },
      });

      // Replace skills (delete & recreate for simplicity)
      if (skills && Array.isArray(skills)) {
        await prisma.skill.deleteMany({ where: { profileId: profile.id } });
        await prisma.skill.createMany({
          data: skills.map((s: any) => ({
            profileId: profile.id,
            name: s.name,
            level: s.level || null,
          })),
        });
      }

      // Replace experiences
      if (experiences && Array.isArray(experiences)) {
        await prisma.experience.deleteMany({ where: { profileId: profile.id } });
        await prisma.experience.createMany({
          data: experiences.map((e: any) => ({
            profileId: profile.id,
            company: e.company,
            position: e.position,
            location: e.location || null,
            startDate: new Date(e.startDate),
            endDate: e.endDate ? new Date(e.endDate) : null,
            isCurrent: e.isCurrent || false,
            description: e.description || null,
          })),
        });
      }

      // Replace education
      if (education && Array.isArray(education)) {
        await prisma.education.deleteMany({ where: { profileId: profile.id } });
        await prisma.education.createMany({
          data: education.map((ed: any) => ({
            profileId: profile.id,
            institution: ed.institution,
            degree: ed.degree,
            fieldOfStudy: ed.fieldOfStudy || null,
            startDate: new Date(ed.startDate),
            endDate: ed.endDate ? new Date(ed.endDate) : null,
          })),
        });
      }

      // Return the full updated profile
      const fullProfile = await prisma.profile.findUnique({
        where: { userId },
        include: { skills: true, experiences: true, education: true },
      });

      return res.json({ message: 'Profile updated successfully', user: updatedUser, profile: fullProfile });
    } catch (err: any) {
      return res.status(500).json({ error: `Failed to update profile: ${err.message}` });
    }
  }

  static async searchUsers(req: Request, res: Response) {
    try {
      const query = (req.query.q as string) || '';
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { fullName: { contains: query, mode: 'insensitive' } },
            { headline: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: userSelect,
        take: 20,
      });
      return res.json(users);
    } catch (err: any) {
      return res.status(500).json({ error: 'Search failed' });
    }
  }

  static async getSuggestedConnections(req: any, res: Response) {
    try {
      const currentUserId = req.user?.userId;
      const users = await prisma.user.findMany({
        where: { id: { not: currentUserId } },
        select: userSelect,
        take: 8,
        orderBy: { createdAt: 'desc' },
      });
      // Add simulated mutual connections count (real impl would join connections table)
      const withMutuals = users.map(u => ({ ...u, mutualConnections: Math.floor(Math.random() * 15) + 1 }));
      return res.json(withMutuals);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch suggestions' });
    }
  }
}
