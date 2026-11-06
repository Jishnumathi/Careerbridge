import { Router, Response } from 'express';
import { db } from '../db/database';
import { protect, AuthRequest } from '../middleware/authMiddleware';

export const notificationRouter = Router();

notificationRouter.use(protect);

// GET /api/notifications
notificationRouter.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await db.notifications.find(
      (n: any) => n.user?.toString() === req.user!.id
    );
    const unreadCount = notifications.filter((n: any) => !n.isRead).length;

    return res.json({
      success: true,
      unreadCount,
      count: notifications.length,
      notifications,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve notifications.', error: err.message });
  }
});

// PATCH /api/notifications/:id/read
notificationRouter.patch('/:id/read', async (req: AuthRequest, res: Response) => {
  try {
    const updated = await db.notifications.findByIdAndUpdate(req.params.id, { isRead: true });
    return res.json({ success: true, notification: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to mark notification as read.', error: err.message });
  }
});

// PATCH /api/notifications/read-all
notificationRouter.patch('/read-all', async (req: AuthRequest, res: Response) => {
  try {
    await db.notifications.updateMany(
      (n: any) => n.user?.toString() === req.user!.id,
      { isRead: true }
    );
    return res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to mark all as read.', error: err.message });
  }
});
