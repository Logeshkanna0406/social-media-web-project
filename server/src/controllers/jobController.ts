import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

const jobInclude = {
  company: { select: { name: true, logoUrl: true } },
  poster: { select: { fullName: true } },
  _count: { select: { applications: true } },
};

const shapeJob = (job: any, savedJobIds: string[] = []) => ({
  id: job.id,
  title: job.title,
  companyName: job.company?.name || job.poster?.fullName || 'ConnectHub Recruiter',
  companyLogo: job.company?.logoUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(job.title)}`,
  location: job.location,
  jobType: job.jobType,
  isRemote: job.isRemote,
  salaryRange: job.salaryMin && job.salaryMax
    ? `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()} / year`
    : 'Competitive',
  description: job.description,
  requirements: job.requirements ? JSON.parse(job.requirements) : [],
  postedAt: job.createdAt,
  applicantCount: job._count?.applications || 0,
  isSaved: savedJobIds.includes(job.id),
});

export class JobController {
  static async getJobs(req: any, res: Response) {
    try {
      const query = (req.query.query as string) || '';
      const remoteOnly = req.query.remoteOnly === 'true';
      const jobType = req.query.jobType as string | undefined;

      const jobs = await prisma.job.findMany({
        where: {
          ...(query
            ? {
                OR: [
                  { title: { contains: query, mode: 'insensitive' } },
                  { description: { contains: query, mode: 'insensitive' } },
                  { location: { contains: query, mode: 'insensitive' } },
                ],
              }
            : {}),
          ...(remoteOnly ? { isRemote: true } : {}),
          ...(jobType ? { jobType: jobType as any } : {}),
        },
        include: jobInclude,
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      return res.json(jobs.map(j => shapeJob(j)));
    } catch (err: any) {
      return res.status(500).json({ error: `Failed to fetch jobs: ${err.message}` });
    }
  }

  static async createJob(req: any, res: Response) {
    try {
      const posterId = req.user?.userId;
      const { title, companyName, location, jobType, salaryMin, salaryMax, isRemote, description, requirements } = req.body;

      if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required' });
      }

      // Find or create company for recruiter
      let companyId: string | undefined;
      if (companyName) {
        const company = await prisma.company.upsert({
          where: { recruiterId: posterId },
          create: { recruiterId: posterId, name: companyName },
          update: { name: companyName },
        });
        companyId = company.id;
      }

      const job = await prisma.job.create({
        data: {
          posterId,
          companyId: companyId || null,
          title,
          description,
          location: location || 'Remote',
          jobType: jobType || 'FULL_TIME',
          isRemote: !!isRemote,
          salaryMin: salaryMin ? parseInt(salaryMin) : null,
          salaryMax: salaryMax ? parseInt(salaryMax) : null,
          requirements: requirements ? JSON.stringify(Array.isArray(requirements) ? requirements : [requirements]) : null,
        },
        include: jobInclude,
      });

      return res.status(201).json(shapeJob(job));
    } catch (err: any) {
      return res.status(500).json({ error: `Failed to create job: ${err.message}` });
    }
  }

  static async applyForJob(req: any, res: Response) {
    try {
      const applicantId = req.user?.userId;
      const { jobId, coverLetter, resumeDataUri } = req.body;

      const job = await prisma.job.findUnique({ where: { id: jobId } });
      if (!job) return res.status(404).json({ error: 'Job not found' });

      const existing = await prisma.jobApplication.findUnique({
        where: { jobId_applicantId: { jobId, applicantId } },
      });
      if (existing) return res.status(400).json({ error: 'Already applied for this position' });

      const application = await prisma.jobApplication.create({
        data: {
          jobId,
          applicantId,
          coverLetter: coverLetter || null,
          status: 'APPLIED',
        },
        include: {
          job: { select: { title: true, company: { select: { name: true } } } },
        },
      });

      return res.status(201).json({
        message: 'Application submitted successfully',
        application: {
          id: application.id,
          jobId: application.jobId,
          jobTitle: application.job.title,
          companyName: application.job.company?.name || 'Recruiter',
          status: application.status,
          appliedAt: application.createdAt,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ error: `Failed to apply: ${err.message}` });
    }
  }

  static async toggleSaveJob(req: any, res: Response) {
    // Saved jobs are tracked client-side for now (no join table in schema)
    return res.json({ isSaved: true });
  }

  static async getRecruiterDashboard(req: any, res: Response) {
    try {
      const posterId = req.user?.userId;

      const [postedJobs, applications] = await Promise.all([
        prisma.job.findMany({
          where: { posterId },
          include: { ...jobInclude },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.jobApplication.findMany({
          where: { job: { posterId } },
          include: {
            applicant: { select: { id: true, fullName: true, avatarUrl: true, headline: true } },
            job: { select: { title: true } },
          },
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      return res.json({
        postedJobs: postedJobs.map(j => shapeJob(j)),
        totalApplications: applications.length,
        applications: applications.map(a => ({
          id: a.id,
          jobTitle: a.job.title,
          applicantName: a.applicant.fullName,
          applicantAvatar: a.applicant.avatarUrl,
          applicantHeadline: a.applicant.headline,
          status: a.status,
          appliedAt: a.createdAt,
          coverLetter: a.coverLetter,
        })),
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch recruiter dashboard' });
    }
  }

  static async updateApplicationStatus(req: any, res: Response) {
    try {
      const { applicationId } = req.params;
      const { status } = req.body;

      const app = await prisma.jobApplication.update({
        where: { id: applicationId },
        data: { status },
      });

      return res.json({ message: 'Status updated', application: app });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to update application status' });
    }
  }
}
