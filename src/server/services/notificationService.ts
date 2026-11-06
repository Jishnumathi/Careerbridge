import { db } from '../db/database';
import { NotificationType } from '../models/Notification';

export async function createNotification(params: {
  userId: string;
  title: string;
  message: string;
  notificationType: NotificationType;
  relatedId?: string;
}) {
  try {
    return await db.notifications.create({
      user: params.userId,
      title: params.title,
      message: params.message,
      notificationType: params.notificationType,
      relatedId: params.relatedId || '',
      isRead: false,
    });
  } catch (err) {
    console.error('Failed to create notification:', err);
    return null;
  }
}
