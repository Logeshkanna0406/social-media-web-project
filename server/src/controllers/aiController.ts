import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AIService } from '../services/aiService';
import { logger } from '../utils/logger';

export class AIController {
  static async reviewResume(req: any, res: Response) {
    try {
      const userId = req.user?.userId;
      const { resumeText } = req.body;
      if (!resumeText?.trim()) return res.status(400).json({ error: 'Resume text required' });

      const result = await AIService.reviewResume(resumeText);

      // Log AI usage to DB
      if (userId) {
        await prisma.aIUsageLog.create({
          data: { userId, feature: 'RESUME_REVIEW', tokensUsed: resumeText.length / 4 | 0 },
        });

        // Save score to profile
        const profile = await prisma.profile.findUnique({ where: { userId } });
        if (profile) {
          await prisma.profile.update({
            where: { userId },
            data: { resumeScore: result.score },
          });
        }
      }

      return res.json(result);
    } catch (err: any) {
      logger.error(`AI Resume Review error: ${err.message}`);
      return res.status(500).json({ error: 'Failed to process AI resume review' });
    }
  }

  static async generateBio(req: any, res: Response) {
    try {
      const userId = req.user?.userId;
      const { skills, role, experience } = req.body;

      const bio = await AIService.generateBio(
        skills || ['Software Engineering'],
        role || 'Software Engineer',
        experience || 'building scalable applications'
      );

      if (userId) {
        await prisma.aIUsageLog.create({
          data: { userId, feature: 'BIO_GEN', tokensUsed: bio.length / 4 | 0 },
        });
        // Save generated bio to profile
        await prisma.profile.upsert({
          where: { userId },
          create: { userId, aiBioSummary: bio },
          update: { aiBioSummary: bio },
        });
      }

      return res.json({ bio });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to generate bio' });
    }
  }

  static async generatePost(req: any, res: Response) {
    try {
      const userId = req.user?.userId;
      const { topic, tone } = req.body;

      const post = await AIService.generatePost(
        topic || 'AI in Modern Software Development',
        tone || 'professional'
      );

      if (userId) {
        await prisma.aIUsageLog.create({
          data: { userId, feature: 'POST_GEN', tokensUsed: post.length / 4 | 0 },
        });
      }

      return res.json({ post });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to generate post' });
    }
  }

  static async recommendSkills(req: any, res: Response) {
    try {
      const userId = req.user?.userId;
      const { currentSkills, targetRole } = req.body;

      const recommendations = await AIService.recommendSkills(
        currentSkills || [],
        targetRole || 'Senior Software Engineer'
      );

      if (userId) {
        await prisma.aIUsageLog.create({
          data: { userId, feature: 'SKILL_RECOMMEND', tokensUsed: 500 },
        });
      }

      return res.json({ recommendations });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch skill recommendations' });
    }
  }
}
