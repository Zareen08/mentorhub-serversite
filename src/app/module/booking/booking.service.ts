import status from "http-status";
import AppError from "../../errorHelpers/AppError.js";
import { prisma } from "../../lib/prisma.js";
import { IQueryParams } from "../../interfaces/query.interface.js";

const createBooking = async (userId: string, payload: { mentorId: string; scheduledAt: string; duration: number; notes?: string }) => {
  const userProfile = await prisma.userProfile.findUnique({ where: { userId } });
  if (!userProfile) throw new AppError(status.NOT_FOUND, "User profile not found");
  const mentor = await prisma.mentor.findFirst({ where: { id: payload.mentorId, isDeleted: false, isActive: true } });
  if (!mentor) throw new AppError(status.NOT_FOUND, "Mentor not found");
  const totalAmount = (mentor.hourlyRate * payload.duration) / 60;
  const booking = await prisma.booking.create({
    data: { userId: userProfile.id, mentorId: mentor.id, scheduledAt: new Date(payload.scheduledAt), duration: payload.duration, totalAmount, notes: payload.notes },
    include: { mentor: { include: { user: { select: { name: true, image: true } } } } },
  });
  await prisma.payment.create({ data: { bookingId: booking.id, amount: totalAmount } });
  return booking;
};

const getUserBookings = async (userId: string, query: IQueryParams) => {
  const userProfile = await prisma.userProfile.findUnique({ where: { userId } });
  if (!userProfile) throw new AppError(status.NOT_FOUND, "User profile not found");
  const where: any = { userId: userProfile.id };
  if (query.status) where.status = query.status;
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const [data, total] = await Promise.all([
    prisma.booking.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" },
      include: { mentor: { include: { user: { select: { name: true, image: true } } } }, review: true } }),
    prisma.booking.count({ where }),
  ]);
  return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

const getMentorBookings = async (userId: string, query: IQueryParams) => {
  const mentor = await prisma.mentor.findUnique({ where: { userId } });
  if (!mentor) throw new AppError(status.NOT_FOUND, "Mentor not found");
  const where: any = { mentorId: mentor.id };
  if (query.status) where.status = query.status;
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const [data, total] = await Promise.all([
    prisma.booking.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { scheduledAt: "asc" },
      include: { userProfile: { include: { user: { select: { name: true, image: true, email: true } } } }, review: true } }),
    prisma.booking.count({ where }),
  ]);
  return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

const updateBookingStatus = async (bookingId: string, userId: string, role: string, newStatus: string) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { mentor: true, userProfile: true } });
  if (!booking) throw new AppError(status.NOT_FOUND, "Booking not found");
  if (role === "MENTOR" && booking.mentor.userId !== userId) throw new AppError(status.FORBIDDEN, "Not your booking");
  if (role === "USER" && booking.userProfile.userId !== userId) throw new AppError(status.FORBIDDEN, "Not your booking");
  const updated = await prisma.booking.update({ where: { id: bookingId }, data: { status: newStatus as any } });
  if (newStatus === "COMPLETED") {
    await prisma.mentor.update({ where: { id: booking.mentorId }, data: { totalSessions: { increment: 1 }, totalEarnings: { increment: booking.totalAmount } } });
    await prisma.payment.update({ where: { bookingId }, data: { status: "PAID" } });
    await prisma.booking.update({ where: { id: bookingId }, data: { paymentStatus: "PAID" } });
  }
  return updated;
};

const getAllBookings = async (query: IQueryParams) => {
  const where: any = {};
  if (query.status) where.status = query.status;
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const [data, total] = await Promise.all([
    prisma.booking.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" },
      include: { mentor: { include: { user: { select: { name: true } } } }, userProfile: { include: { user: { select: { name: true } } } } } }),
    prisma.booking.count({ where }),
  ]);
  return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const BookingService = { createBooking, getUserBookings, getMentorBookings, updateBookingStatus, getAllBookings };
