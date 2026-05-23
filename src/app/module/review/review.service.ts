import status from "http-status";
import AppError from "../../errorHelpers/AppError.js";
import { prisma } from "../../lib/prisma.js";
import { IQueryParams } from "../../interfaces/query.interface.js";

const createReview = async (userId: string, payload: { bookingId: string; rating: number; comment?: string }) => {
  const userProfile = await prisma.userProfile.findUnique({ where: { userId } });
  if (!userProfile) throw new AppError(status.NOT_FOUND, "User profile not found");
  const booking = await prisma.booking.findFirst({ where: { id: payload.bookingId, userId: userProfile.id, status: "COMPLETED" } });
  if (!booking) throw new AppError(status.BAD_REQUEST, "Can only review completed bookings");
  const existing = await prisma.review.findUnique({ where: { bookingId: payload.bookingId } });
  if (existing) throw new AppError(status.CONFLICT, "Review already submitted");
  const review = await prisma.review.create({
    data: { bookingId: payload.bookingId, userId: userProfile.id, mentorId: booking.mentorId, rating: payload.rating, comment: payload.comment },
  });
  // update mentor average rating
  const agg = await prisma.review.aggregate({ where: { mentorId: booking.mentorId }, _avg: { rating: true }, _count: { id: true } });
  await prisma.mentor.update({ where: { id: booking.mentorId }, data: { averageRating: agg._avg.rating || 0, totalReviews: agg._count.id } });
  return review;
};

const getMentorReviews = async (mentorId: string, query: IQueryParams) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const [data, total] = await Promise.all([
    prisma.review.findMany({ where: { mentorId }, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" },
      include: { userProfile: { include: { user: { select: { name: true, image: true } } } } } }),
    prisma.review.count({ where: { mentorId } }),
  ]);
  return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

const getAllReviews = async (query: IQueryParams) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const [data, total] = await Promise.all([
    prisma.review.findMany({ skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" },
      include: { mentor: { include: { user: { select: { name: true } } } }, userProfile: { include: { user: { select: { name: true } } } } } }),
    prisma.review.count(),
  ]);
  return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

const getMyReviews = async (userId: string) => {
  const profile = await prisma.userProfile.findUnique({ where: { userId } });
  if (!profile) return [];
  return prisma.review.findMany({ where: { userId: profile.id }, orderBy: { createdAt: "desc" },
    include: { mentor: { include: { user: { select: { name: true } } } } } });
};

// ✅ Add getMyReviews to the exported service object
export const ReviewService = { 
  createReview, 
  getMentorReviews, 
  getAllReviews, 
  getMyReviews  
};