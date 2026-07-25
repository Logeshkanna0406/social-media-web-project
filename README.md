# ConnectHub AI - Production-Ready AI Professional Social Network

ConnectHub AI is a state-of-the-art, production-ready AI-powered professional social networking SaaS platform that combines features of LinkedIn, Twitter, and Discord while delivering real business value through automated career tools, job matching, and community channels.

![ConnectHub AI Glassmorphism Platform](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80)

---

## 🚀 Key Features

### 1. 🤖 AI Career Intelligence Suite
- **AI Resume Reviewer & ATS Scorer**: Instant ATS readiness score (0-100), key strengths, callback recommendations, and high-impact keyword suggestions.
- **AI Bio & Headline Builder**: Generates tailored, engaging profile bios from skills and target roles.
- **AI Post Generator**: Produces viral technical posts, polls, and hashtags.
- **Skill Recommendation Engine**: Identifies skill gaps for target roles.

### 2. 📱 Modern Social Feed Stream
- Rich post creation with media attachments, image preview, interactive community polls, and comments drawer.
- Trending hashtags tracker and real-time post likes.

### 3. 💬 Real-Time Messaging & Discord Community Hubs
- Topic channels (`#react-architects`, `#ai-engineers`, `#career-advice`).
- Direct messaging powered by Socket.io with typing indicators and online statuses.

### 4. 💼 Jobs Portal & Recruiter Management
- Multi-criteria job search (remote badges, salary filters).
- 1-Click application with profile resume scores.
- Recruiter position publisher and candidate tracker.

### 5. 📊 Interactive Analytics & Admin Control
- Recharts visualizations: user growth, monthly active users, job apps submitted, and AI token metrics.
- Admin portal for user role elevation, moderation queue, and live system logs.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS (Glassmorphic Theme), Framer Motion, Lucide React Icons.
- **Charts**: Recharts.
- **Real-Time Sockets**: Socket.io-client & Socket.io server.
- **Backend**: Node.js, Express, Prisma ORM, JWT authentication, bcryptjs, Helmet security headers, Express Rate Limiters.
- **Database**: PostgreSQL (Prisma schema with full relations).
- **AI Engine**: Integrated Google Gemini 1.5 Flash SDK + OpenAI API with automatic fallback handlers.

---

## 📂 Project Structure

```
d:\social media web project\
├── client/                     # Frontend Application (React + Vite + Tailwind + Framer Motion)
│   ├── src/
│   │   ├── components/         # GlassCard, Button, Modal, Skeleton, Toast, Navbar, Sidebar
│   │   ├── context/            # AuthContext, ThemeContext, SocketContext
│   │   ├── hooks/              # useToast hook
│   │   ├── pages/              # Landing, Feed, Profile, Jobs, Messages, AI Hub, Analytics, Admin
│   │   ├── services/           # Axios API Client
│   │   └── types/              # TypeScript interfaces
│   └── package.json
│
├── server/                     # Express API Server (Node + Prisma + Socket.io + AI)
│   ├── prisma/
│   │   └── schema.prisma       # Database Models
│   ├── src/
│   │   ├── controllers/        # Auth, User, Post, Job, Message, AI, Admin, Analytics
│   │   ├── middleware/         # Auth, Roles, Rate Limiter, Error Handler
│   │   ├── services/           # AI Gemini Service, Socket Service
│   │   └── index.ts            # Server Entry Point
│   └── package.json
│
├── .github/workflows/ci-cd.yml # GitHub Actions Pipeline
├── API_DOCUMENTATION.md        # Comprehensive REST API reference
├── INSTALLATION.md             # Developer setup guide
└── DEPLOYMENT.md               # Vercel & Railway deployment guide
```
