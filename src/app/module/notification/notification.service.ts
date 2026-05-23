import { prisma } from "../../lib/prisma.js";
import AppError from "../../errorHelpers/AppError.js";
const getNotifications = async (userId: string) => {
  const profile = await prisma.userProfile.findUnique({ where: { userId } });
  if (!profile) return [];
  return prisma.notification.findMany({ where: { userId: profile.id }, orderBy: { createdAt: "desc" }, take: 50 });
};
const markRead = async (userId: string, notifId: string) => {
  const profile = await prisma.userProfile.findUnique({ where: { userId } });
  if (!profile) throw new AppError(404, "Profile not found");
  return prisma.notification.update({ where: { id: notifId, userId: profile.id }, data: { isRead: true } });
};
const markAllRead = async (userId: string) => {
  const profile = await prisma.userProfile.findUnique({ where: { userId } });
  if (!profile) return;
  await prisma.notification.updateMany({ where: { userId: profile.id, isRead: false }, data: { isRead: true } });
};
export const NotificationService = { getNotifications, markRead, markAllRead };
