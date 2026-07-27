import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { uploadToCloudinary } from '../services/cloudinaryService';
import { AIService } from '../services/aiService';

const postInclude = {
  author: {
    select: { id: true, fullName: true, headline: true, avatarUrl: true },
  },
  likes: { select: { userId: true } },
  comments: {
    include: {
      author: { select: { fullName: true, avatarUrl: true } },
    },
    orderBy: { createdAt: 'asc' as const },
    take: 20,
  },
  poll: {
    include: {
      options: {
        include: {
          votes: { select: { userId: true } },
        },
      },
    },
  },
};

// Shape a Prisma post into a clean API response
const shapePost = (post: any, currentUserId?: string) => ({
  id: post.id,
  authorId: post.authorId,
  author: post.author,
  content: post.content,
  imageUrl: post.imageUrl,
  videoUrl: post.videoUrl,
  hashtags: post.hashtags ? JSON.parse(post.hashtags) : [],
  isAiGenerated: post.isAiGenerated,
  likesCount: post.likes.length,
  commentsCount: post.comments.length,
  isLiked: currentUserId ? post.likes.some((l: any) => l.userId === currentUserId) : false,
  comments: post.comments.map((c: any) => ({
    id: c.id,
    authorName: c.author.fullName,
    authorAvatar: c.author.avatarUrl || '',
    content: c.content,
    createdAt: c.createdAt,
  })),
  poll: post.poll
    ? {
        id: post.poll.id,
        question: post.poll.question,
        options: post.poll.options.map((o: any) => ({
          id: o.id,
          text: o.text,
          votesCount: o.votes.length,
        })),
        userVotedOptionId: currentUserId
          ? post.poll.options
              .find((o: any) => o.votes.some((v: any) => v.userId === currentUserId))?.id || null
          : null,
      }
    : null,
  createdAt: post.createdAt,
});

export class PostController {
  static async getFeed(req: any, res: Response) {
    try {
      const currentUserId = req.user?.userId;
      const cursor = req.query.cursor as string | undefined;
      const take = 10;

      const posts = await prisma.post.findMany({
        include: postInclude,
        orderBy: { createdAt: 'desc' },
        take,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      });

      return res.json(posts.map(p => shapePost(p, currentUserId)));
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch feed' });
    }
  }

  static async createPost(req: any, res: Response) {
    try {
      const authorId = req.user?.userId;
      const { content, imageDataUri, videoUrl, hashtags, pollQuestion, pollOptions, isAiGenerated } = req.body;

      // Validate poll payload if present
      const validPollOptions = Array.isArray(pollOptions)
        ? pollOptions.map((o: any) => String(o).trim()).filter(Boolean)
        : [];

      const hasPoll = !!(pollQuestion?.trim() || validPollOptions.length > 0);
      if (hasPoll) {
        if (!pollQuestion?.trim()) {
          return res.status(400).json({ error: 'Poll question is required when creating a poll' });
        }
        if (validPollOptions.length < 2) {
          return res.status(400).json({ error: 'A poll must have at least 2 non-empty options' });
        }
      }

      if (!content?.trim() && !imageDataUri && !hasPoll) {
        return res.status(400).json({ error: 'Post must have content, media, or a poll' });
      }

      // AI content moderation check
      if (content) {
        const { isSafe, flagReason } = await AIService.moderateContent(content);
        if (!isSafe) return res.status(400).json({ error: `Content flagged: ${flagReason}` });
      }

      // Upload image to Cloudinary if base64
      let imageUrl: string | null = null;
      if (imageDataUri && imageDataUri.startsWith('data:')) {
        imageUrl = await uploadToCloudinary(imageDataUri, 'connecthub/posts');
      } else if (imageDataUri) {
        imageUrl = imageDataUri; // Accept direct URLs too
      }

      const hashtagList = Array.isArray(hashtags) ? hashtags : (hashtags ? hashtags.split(/\s+/) : []);

      const post = await prisma.post.create({
        data: {
          authorId,
          content: content || '',
          imageUrl,
          videoUrl: videoUrl || null,
          hashtags: hashtagList.length > 0 ? JSON.stringify(hashtagList) : null,
          isAiGenerated: !!isAiGenerated,
          ...(hasPoll
            ? {
                poll: {
                  create: {
                    question: pollQuestion.trim(),
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                    options: {
                      create: validPollOptions.map((text: string) => ({ text })),
                    },
                  },
                },
              }
            : {}),
        },
        include: postInclude,
      });

      return res.status(201).json(shapePost(post, authorId));
    } catch (err: any) {
      return res.status(500).json({ error: `Failed to create post: ${err.message}` });
    }
  }

  static async toggleLike(req: any, res: Response) {
    try {
      const userId = req.user?.userId;
      const { postId } = req.params;

      const existingLike = await prisma.like.findUnique({
        where: { postId_userId: { postId, userId } },
      });

      if (existingLike) {
        await prisma.like.delete({ where: { postId_userId: { postId, userId } } });
      } else {
        await prisma.like.create({ data: { postId, userId } });
      }

      const likesCount = await prisma.like.count({ where: { postId } });
      return res.json({ likesCount, isLiked: !existingLike });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to toggle like' });
    }
  }

  static async addComment(req: any, res: Response) {
    try {
      const authorId = req.user?.userId;
      const { postId } = req.params;
      const { content } = req.body;

      if (!content?.trim()) return res.status(400).json({ error: 'Comment content required' });

      const comment = await prisma.comment.create({
        data: { postId, authorId, content },
        include: {
          author: { select: { fullName: true, avatarUrl: true } },
        },
      });

      return res.status(201).json({
        id: comment.id,
        authorName: comment.author.fullName,
        authorAvatar: comment.author.avatarUrl || '',
        content: comment.content,
        createdAt: comment.createdAt,
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to add comment' });
    }
  }

  static async votePoll(req: any, res: Response) {
    try {
      const userId = req.user?.userId;
      const { postId, optionId } = req.body;

      // Verify option belongs to the post's poll
      const option = await prisma.pollOption.findFirst({
        where: { id: optionId, poll: { postId } },
        include: { poll: { include: { options: { include: { votes: { select: { userId: true } } } } } } },
      });
      if (!option) return res.status(404).json({ error: 'Poll option not found' });

      // Check if user already voted on ANY option belonging to this post's poll
      const existingVote = await prisma.pollVote.findFirst({
        where: {
          userId,
          option: { poll: { postId } },
        },
      });
      if (existingVote) return res.status(400).json({ error: 'Already voted on this poll' });

      await prisma.pollVote.create({ data: { optionId, userId } });

      // Return updated poll
      const updatedPoll = await prisma.poll.findFirst({
        where: { postId },
        include: {
          options: { include: { votes: { select: { userId: true } } } },
        },
      });

      return res.json({
        id: updatedPoll!.id,
        question: updatedPoll!.question,
        options: updatedPoll!.options.map(o => ({
          id: o.id,
          text: o.text,
          votesCount: o.votes.length,
        })),
        userVotedOptionId: optionId,
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to record poll vote' });
    }
  }

  static async getTrendingHashtags(req: Request, res: Response) {
    try {
      // Aggregate hashtag usage from real posts
      const posts = await prisma.post.findMany({
        where: { hashtags: { not: null } },
        select: { hashtags: true },
        take: 200,
        orderBy: { createdAt: 'desc' },
      });

      const tagCounts: Record<string, number> = {};
      for (const post of posts) {
        if (!post.hashtags) continue;
        const tags = JSON.parse(post.hashtags) as string[];
        for (const tag of tags) {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        }
      }

      const sorted = Object.entries(tagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 8)
        .map(([tag, postsCount]) => ({ tag, postsCount }));

      // Merge with default platform tags if DB is sparse
      const defaults = [
        { tag: '#ConnectHubAI', postsCount: 1420 },
        { tag: '#AIEngineering', postsCount: 980 },
        { tag: '#ReactVite', postsCount: 750 },
        { tag: '#TechJobs', postsCount: 620 },
        { tag: '#FullStackDev', postsCount: 540 },
      ];

      const merged = [...sorted, ...defaults].reduce<{ tag: string; postsCount: number }[]>((acc, item) => {
        if (!acc.find(a => a.tag === item.tag)) acc.push(item);
        return acc;
      }, []).slice(0, 8);

      return res.json(merged);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch trending hashtags' });
    }
  }

  static async deletePost(req: any, res: Response) {
    try {
      const userId = req.user?.userId;
      const { postId } = req.params;

      const post = await prisma.post.findUnique({ where: { id: postId } });
      if (!post) return res.status(404).json({ error: 'Post not found' });
      if (post.authorId !== userId && req.user?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Not authorized to delete this post' });
      }

      await prisma.post.delete({ where: { id: postId } });
      return res.json({ message: 'Post deleted successfully' });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to delete post' });
    }
  }
}
