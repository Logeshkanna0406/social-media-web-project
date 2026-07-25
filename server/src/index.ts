import http from 'http';
import { createApp } from './app';
import { config } from './config';
import { logger } from './utils/logger';
import { SocketService } from './services/socketService';
import { connectDB, prisma } from './config/prisma';

const app = createApp();
const server = http.createServer(app);

// Initialize Socket.io
SocketService.init(server, config.corsOrigin);

const PORT = config.port;

const main = async () => {
  // Connect to Neon PostgreSQL
  await connectDB();

  server.listen(PORT, () => {
    logger.info(`🚀 ConnectHub AI Server running on http://localhost:${PORT}`);
    logger.info(`⚡ Socket.io Realtime Service active`);
    logger.info(`📊 Health check: http://localhost:${PORT}/health`);
    logger.info(`🗄️  Database: Neon PostgreSQL via Prisma ORM`);
  });
};

main().catch((err) => {
  logger.error(`Fatal startup error: ${err.message}`);
  prisma.$disconnect();
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  logger.info('Database disconnected gracefully.');
  process.exit(0);
});
