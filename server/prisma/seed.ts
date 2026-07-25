import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding ConnectHub AI database...');

  const hash = async (pw: string) => bcrypt.hash(pw, 10);

  // ── Create Core Users ─────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: 'admin@connecthub.ai' },
    update: {},
    create: {
      email: 'admin@connecthub.ai',
      passwordHash: await hash('Password123!'),
      fullName: 'ConnectHub Admin',
      headline: 'Chief Architect & Platform Admin',
      role: 'ADMIN',
      isVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      profile: {
        create: {
          bio: 'Platform architect and lead engineer of ConnectHub AI. Passionate about building next-gen developer ecosystems.',
          location: 'San Francisco, CA',
          skills: {
            create: [
              { name: 'System Architecture', level: 'Expert' },
              { name: 'TypeScript', level: 'Expert' },
              { name: 'PostgreSQL', level: 'Expert' },
            ],
          },
        },
      },
    },
  });
  console.log('✅ Admin user seeded:', admin.email);

  const demo = await prisma.user.upsert({
    where: { email: 'demo@connecthub.ai' },
    update: {},
    create: {
      email: 'demo@connecthub.ai',
      passwordHash: await hash('Password123!'),
      fullName: 'Alex Morgan',
      headline: 'Senior Full Stack Engineer | React & Node.js Specialist',
      role: 'USER',
      isVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      coverUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80',
      profile: {
        create: {
          bio: 'Senior Full Stack Engineer & Open Source Contributor. Passionate about AI agent systems, React performance, and scalable cloud architectures.',
          location: 'San Francisco, CA (Remote)',
          websiteUrl: 'https://alexmorgan.dev',
          githubUrl: 'https://github.com/alexmorgan',
          linkedinUrl: 'https://linkedin.com/in/alexmorgan',
          skills: {
            create: [
              { name: 'TypeScript', level: 'Expert' },
              { name: 'React', level: 'Expert' },
              { name: 'Node.js', level: 'Expert' },
              { name: 'Prisma ORM', level: 'Intermediate' },
              { name: 'Tailwind CSS', level: 'Expert' },
              { name: 'GraphQL', level: 'Intermediate' },
            ],
          },
          experiences: {
            create: [
              {
                company: 'TechCorp Solutions',
                position: 'Lead Frontend Architect',
                location: 'San Francisco, CA',
                startDate: new Date('2022-01-01'),
                isCurrent: true,
                description: 'Leading a team of 8 engineers building micro-frontend web platforms serving 2M+ monthly active users.',
              },
              {
                company: 'InnoLabs Inc.',
                position: 'Full Stack Developer',
                location: 'Remote',
                startDate: new Date('2019-06-01'),
                endDate: new Date('2021-12-31'),
                isCurrent: false,
                description: 'Developed real-time messaging dashboards and scalable Node.js REST microservices.',
              },
            ],
          },
          education: {
            create: [
              {
                institution: 'University of California, Berkeley',
                degree: 'Bachelor of Science',
                fieldOfStudy: 'Computer Science',
                startDate: new Date('2015-08-01'),
                endDate: new Date('2019-05-30'),
              },
            ],
          },
        },
      },
    },
  });
  console.log('✅ Demo user seeded:', demo.email);

  const recruiter = await prisma.user.upsert({
    where: { email: 'recruiter@connecthub.ai' },
    update: {},
    create: {
      email: 'recruiter@connecthub.ai',
      passwordHash: await hash('Password123!'),
      fullName: 'Sarah Jenkins',
      headline: 'Tech Recruiter at NeuralScale AI | Hiring Full Stack Engineers',
      role: 'RECRUITER',
      isVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      coverUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      profile: { create: { bio: 'Passionate about matching world-class engineers with transformative opportunities.', location: 'New York, NY' } },
    },
  });
  console.log('✅ Recruiter user seeded:', recruiter.email);

  // ── Create Company for Recruiter ─────────────────────────────────
  const company = await prisma.company.upsert({
    where: { recruiterId: recruiter.id },
    update: {},
    create: {
      recruiterId: recruiter.id,
      name: 'NeuralScale AI',
      description: 'Building next-generation AI infrastructure for enterprise teams worldwide.',
      website: 'https://neuralscale.ai',
      location: 'San Francisco, CA (Remote-first)',
      logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80',
    },
  });
  console.log('✅ Company seeded:', company.name);

  // ── Seed Initial Posts ────────────────────────────────────────────
  const existingPost = await prisma.post.findFirst({ where: { authorId: demo.id } });
  if (!existingPost) {
    await prisma.post.create({
      data: {
        authorId: demo.id,
        content: "🚀 Excited to share that we just launched our new AI-Powered Career Assistant on ConnectHub! With real-time resume optimization and automated bio generation, tech professionals can now accelerate their hiring journey by 3x.\n\nCheck out the AI Hub and let me know your thoughts!",
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80',
        hashtags: JSON.stringify(['#ConnectHubAI', '#React', '#AIEngineering', '#WebDev']),
        isAiGenerated: false,
        poll: {
          create: {
            question: 'Which frontend tech stack is your primary choice for 2026 production apps?',
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            options: {
              create: [
                { text: 'React + Vite + TypeScript' },
                { text: 'Next.js App Router' },
                { text: 'Vue 3 + Nuxt' },
                { text: 'SvelteKit / Astro' },
              ],
            },
          },
        },
      },
    });

    await prisma.post.create({
      data: {
        authorId: admin.id,
        content: "💡 Pro Tip for candidates on ConnectHub AI: When uploading your resume, include quantifiable impact metrics like 'Increased API throughput by 45%' or 'Reduced bundle size by 30%'. Our AI Recruiter matching algorithm weights hard metrics heavily!\n\n#CareerAdvice #Recruiting #ConnectHubAI",
        hashtags: JSON.stringify(['#CareerAdvice', '#Recruiting', '#ConnectHubAI']),
        isAiGenerated: true,
      },
    });

    console.log('✅ Seed posts created');
  }

  // ── Seed Initial Jobs ─────────────────────────────────────────────
  const existingJob = await prisma.job.findFirst({ where: { posterId: recruiter.id } });
  if (!existingJob) {
    await prisma.job.createMany({
      data: [
        {
          posterId: recruiter.id,
          companyId: company.id,
          title: 'Senior AI Full Stack Engineer',
          description: 'We are seeking an experienced Full Stack Engineer to lead the architecture of our LLM orchestration dashboard built with React, TypeScript, Node.js, and Prisma.',
          requirements: JSON.stringify(['5+ years React & Node.js', 'OpenAI/Gemini API integration', 'PostgreSQL database design', 'System architecture skills']),
          location: 'San Francisco, CA (Remote)',
          jobType: 'FULL_TIME',
          isRemote: true,
          salaryMin: 160000,
          salaryMax: 210000,
        },
        {
          posterId: recruiter.id,
          companyId: company.id,
          title: 'Principal Frontend Architect (React & WebGL)',
          description: 'Build real-time analytics visualizations and responsive glassmorphic design systems for high-throughput enterprise security monitoring.',
          requirements: JSON.stringify(['Mastery of TypeScript, Vite, Tailwind CSS', 'Framer Motion animations', 'Recharts & WebGL/D3 analytics', 'Performance optimization']),
          location: 'New York, NY (Hybrid)',
          jobType: 'FULL_TIME',
          isRemote: false,
          salaryMin: 180000,
          salaryMax: 240000,
        },
        {
          posterId: recruiter.id,
          companyId: company.id,
          title: 'DevOps & Cloud Infrastructure Specialist',
          description: 'Manage automated GitHub Actions CI/CD workflows, Kubernetes deployments on AWS, and Vercel/Railway backend orchestrations.',
          requirements: JSON.stringify(['GitHub Actions CI/CD pipelines', 'Docker & Kubernetes', 'Terraform', 'Railway & Render deployments']),
          location: 'Austin, TX (Remote)',
          jobType: 'CONTRACT',
          isRemote: true,
          salaryMin: 90,
          salaryMax: 120,
        },
      ],
      skipDuplicates: true,
    });
    console.log('✅ Seed job listings created');
  }

  // ── Seed Community Channel Intro Messages ─────────────────────────
  const existingMsg = await prisma.message.findFirst({ where: { channelId: 'channel-react-architects' } });
  if (!existingMsg) {
    await prisma.message.createMany({
      data: [
        {
          senderId: admin.id,
          channelId: 'channel-react-architects',
          content: "Welcome to #react-architects! 🎉 Share your Vite, Framer Motion, and React performance tricks here.",
        },
        {
          senderId: demo.id,
          channelId: 'channel-react-architects',
          content: "Thanks! Loving the modern glassmorphism design system in ConnectHub AI. Built with Tailwind + Framer Motion.",
        },
        {
          senderId: admin.id,
          channelId: 'channel-ai-engineers',
          content: "Welcome to #ai-engineers! 🤖 Discuss LLM orchestration, RAG architectures, and Gemini API integrations here.",
        },
        {
          senderId: admin.id,
          channelId: 'channel-career-advice',
          content: "Welcome to #career-advice! 💼 Share interview tips, resume feedback, and salary negotiation strategies.",
        },
      ],
    });
    console.log('✅ Community channel messages seeded');
  }

  console.log('\n🎉 Database seeding complete!');
  console.log('   Demo accounts:');
  console.log('   📧 admin@connecthub.ai       | Password123!  (ADMIN)');
  console.log('   📧 demo@connecthub.ai         | Password123!  (USER)');
  console.log('   📧 recruiter@connecthub.ai    | Password123!  (RECRUITER)');
}

seed()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
