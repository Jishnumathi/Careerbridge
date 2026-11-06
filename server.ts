import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { connectDatabase, dbStatus, db } from './src/server/db/database';
import { authRouter } from './src/server/routes/authRoutes';
import { studentRouter } from './src/server/routes/studentRoutes';
import { recruiterRouter } from './src/server/routes/recruiterRoutes';
import { adminRouter } from './src/server/routes/adminRoutes';
import { notificationRouter } from './src/server/routes/notificationRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Basic security and parsing middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads serving for resumes
const uploadsDir = path.resolve(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsDir));

// System Health Endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'CareerBridge MERN Placement Platform',
    databaseEngine: dbStatus.engine,
    mongoConnected: dbStatus.isConnectedToMongo,
    environment: process.env.NODE_ENV || 'development',
  });
});

// Mount Public Notices Endpoint
app.get('/api/notices', async (_req: Request, res: Response) => {
  try {
    const notices = await db.notices.find();
    res.json({ success: true, count: notices.length, notices });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch notices.', error: err.message });
  }
});

// Mount REST API Routers
app.use('/api/auth', authRouter);
app.use('/api/students', studentRouter);
app.use('/api/recruiters', recruiterRouter);
app.use('/api/admin', adminRouter);
app.use('/api/notifications', notificationRouter);

// Centralized Error Handling Middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error occurred.',
    ...(isProduction ? {} : { stack: err.stack }),
  });
});

async function startServer() {
  // Connect to MongoDB or activate embedded persistent store
  await connectDatabase();

  if (!isProduction) {
    // Mount Vite middlewares in development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static build
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CareerBridge MERN Server running at http://0.0.0.0:${PORT}`);
    console.log(`Database Engine: ${dbStatus.engine} (MongoDB Connected: ${dbStatus.isConnectedToMongo})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start CareerBridge server:', err);
  process.exit(1);
});
