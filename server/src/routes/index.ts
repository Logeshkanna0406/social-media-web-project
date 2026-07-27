import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { UserController } from '../controllers/userController';
import { ConnectionController } from '../controllers/connectionController';
import { PostController } from '../controllers/postController';
import { JobController } from '../controllers/jobController';
import { MessageController } from '../controllers/messageController';
import { AIController } from '../controllers/aiController';
import { AnalyticsController } from '../controllers/analyticsController';
import { AdminController } from '../controllers/adminController';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';
import { aiRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// ── Auth ──────────────────────────────────────────────────────────────
router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);
router.post('/auth/google', AuthController.googleLogin);
router.post('/auth/refresh', AuthController.refreshToken);
router.get('/auth/me', authenticateJWT, AuthController.getMe);

// ── Users & Profiles ──────────────────────────────────────────────────
router.get('/users/search', UserController.searchUsers);
router.get('/users/suggested', authenticateJWT, UserController.getSuggestedConnections);
router.get('/users/:userId', UserController.getProfile);
router.put('/users/profile', authenticateJWT, UserController.updateProfile);

// ── Connections ───────────────────────────────────────────────────────
router.post('/connections/request/:targetUserId', authenticateJWT, ConnectionController.sendRequest);
router.post('/connections/accept/:connectionId', authenticateJWT, ConnectionController.acceptRequest);
router.post('/connections/reject/:connectionId', authenticateJWT, ConnectionController.rejectRequest);
router.delete('/connections/:targetUserId', authenticateJWT, ConnectionController.removeConnection);
router.get('/connections/status/:targetUserId', authenticateJWT, ConnectionController.getConnectionStatus);
router.get('/connections', authenticateJWT, ConnectionController.getUserConnections);
router.get('/connections/pending', authenticateJWT, ConnectionController.getPendingRequests);

// ── Posts & Feed ──────────────────────────────────────────────────────
router.get('/posts/feed', authenticateJWT, PostController.getFeed);
router.get('/posts/trending', PostController.getTrendingHashtags);
router.post('/posts', authenticateJWT, PostController.createPost);
router.post('/posts/:postId/like', authenticateJWT, PostController.toggleLike);
router.post('/posts/:postId/comment', authenticateJWT, PostController.addComment);
router.post('/posts/poll/vote', authenticateJWT, PostController.votePoll);
router.delete('/posts/:postId', authenticateJWT, PostController.deletePost);

// ── Jobs ──────────────────────────────────────────────────────────────
router.get('/jobs', JobController.getJobs);
router.post('/jobs', authenticateJWT, JobController.createJob);
router.post('/jobs/apply', authenticateJWT, JobController.applyForJob);
router.post('/jobs/:jobId/save', authenticateJWT, JobController.toggleSaveJob);
router.get('/jobs/recruiter/dashboard', authenticateJWT, authorizeRoles('RECRUITER', 'ADMIN'), JobController.getRecruiterDashboard);
router.patch('/jobs/applications/:applicationId/status', authenticateJWT, authorizeRoles('RECRUITER', 'ADMIN'), JobController.updateApplicationStatus);

// ── Messages & Community Channels ─────────────────────────────────────
router.get('/messages/channel/:channelId', authenticateJWT, MessageController.getChannelMessages);
router.get('/messages/direct/:partnerId', authenticateJWT, MessageController.getDirectMessages);
router.get('/messages/conversations', authenticateJWT, MessageController.getConversationList);
router.get('/messages/unread', authenticateJWT, MessageController.getUnreadCount);
router.post('/messages', authenticateJWT, MessageController.sendMessage);

// ── AI Features (Rate-limited) ────────────────────────────────────────
router.post('/ai/resume-review', authenticateJWT, aiRateLimiter, AIController.reviewResume);
router.post('/ai/generate-bio', authenticateJWT, aiRateLimiter, AIController.generateBio);
router.post('/ai/generate-post', authenticateJWT, aiRateLimiter, AIController.generatePost);
router.post('/ai/recommend-skills', authenticateJWT, aiRateLimiter, AIController.recommendSkills);

// ── Analytics ─────────────────────────────────────────────────────────
router.get('/analytics/dashboard', authenticateJWT, AnalyticsController.getDashboardAnalytics);

// ── Admin ─────────────────────────────────────────────────────────────
router.get('/admin/users', authenticateJWT, authorizeRoles('ADMIN'), AdminController.getUsers);
router.put('/admin/users/:userId/role', authenticateJWT, authorizeRoles('ADMIN'), AdminController.updateUserRole);
router.delete('/admin/users/:userId', authenticateJWT, authorizeRoles('ADMIN'), AdminController.deleteUser);
router.get('/admin/reports', authenticateJWT, authorizeRoles('ADMIN'), AdminController.getReports);
router.post('/admin/reports/:reportId/resolve', authenticateJWT, authorizeRoles('ADMIN'), AdminController.resolveReport);
router.get('/admin/logs', authenticateJWT, authorizeRoles('ADMIN'), AdminController.getSystemLogs);
router.get('/admin/stats', authenticateJWT, authorizeRoles('ADMIN'), AdminController.getDashboardStats);

export default router;
