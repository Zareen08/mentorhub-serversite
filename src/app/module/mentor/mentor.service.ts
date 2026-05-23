import status from "http-status";
import AppError from "../../errorHelpers/AppError.js";
import { prisma } from "../../lib/prisma.js";
import { QueryBuilder } from "../../utils/QueryBuilder.js";
import { IQueryParams } from "../../interfaces/query.interface.js";

const getAllMentors = async (query: IQueryParams) => {
  const qb = new QueryBuilder(prisma.mentor, query, {
    searchableFields: ["title", "company", "bio"],
    filterableFields: [],
  });
  // range filters
  const where: any = { isDeleted: false, isActive: true };
  if (query.skill) where.skills = { has: query.skill };
  if (query.minRate) where.hourlyRate = { ...(where.hourlyRate || {}), gte: Number(query.minRate) };
  if (query.maxRate) where.hourlyRate = { ...(where.hourlyRate || {}), lte: Number(query.maxRate) };
  if (query.minRating) where.averageRating = { gte: Number(query.minRating) };
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 12;
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder || "desc";
  // search
  if (query.searchTerm) {
    where.OR = [
      { title: { contains: query.searchTerm, mode: "insensitive" } },
      { company: { contains: query.searchTerm, mode: "insensitive" } },
      { bio: { contains: query.searchTerm, mode: "insensitive" } },
      { user: { name: { contains: query.searchTerm, mode: "insensitive" } } },
    ];
  }
  const [data, total] = await Promise.all([
    prisma.mentor.findMany({
      where, skip, take: limit,
      orderBy: [{ [sortBy]: sortOrder }],
      include: { user: { select: { name: true, email: true, image: true } } },
    }),
    prisma.mentor.count({ where }),
  ]);
  return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

const getMentorById = async (id: string) => {
  const mentor = await prisma.mentor.findFirst({
    where: { id, isDeleted: false },
    include: {
      user: { select: { name: true, email: true, image: true } },
      reviews: {
        include: { userProfile: { include: { user: { select: { name: true, image: true } } } } },
        orderBy: { createdAt: "desc" }, take: 10,
      },
    },
  });
  if (!mentor) throw new AppError(status.NOT_FOUND, "Mentor not found");
  return mentor;
};

const createMentorProfile = async (userId: string, payload: any) => {
  const existing = await prisma.mentor.findUnique({ where: { userId } });
  if (existing) throw new AppError(status.CONFLICT, "Mentor profile already exists");
  await prisma.user.update({ where: { id: userId }, data: { role: "MENTOR" } });
  const mentor = await prisma.mentor.create({ data: { userId, ...payload } });
  return mentor;
};

const updateMentorProfile = async (userId: string, payload: any) => {
  const mentor = await prisma.mentor.findUnique({ where: { userId } });
  if (!mentor) throw new AppError(status.NOT_FOUND, "Mentor profile not found");
  return prisma.mentor.update({ where: { userId }, data: payload });
};

const getMentorDashboard = async (userId: string) => {
  const mentor = await prisma.mentor.findUnique({ where: { userId }, include: { user: true } });
  if (!mentor) throw new AppError(status.NOT_FOUND, "Mentor profile not found");
  const [totalBookings, completedBookings, pendingBookings, recentReviews, monthlyEarnings] = await Promise.all([
    prisma.booking.count({ where: { mentorId: mentor.id } }),
    prisma.booking.count({ where: { mentorId: mentor.id, status: "COMPLETED" } }),
    prisma.booking.count({ where: { mentorId: mentor.id, status: "PENDING" } }),
    prisma.review.findMany({ where: { mentorId: mentor.id }, orderBy: { createdAt: "desc" }, take: 5,
      include: { userProfile: { include: { user: { select: { name: true, image: true } } } } } }),
    prisma.booking.groupBy({ by: ["createdAt"], where: { mentorId: mentor.id, status: "COMPLETED", paymentStatus: "PAID" },
      _sum: { totalAmount: true } }),
  ]);
  return { mentor, stats: { totalBookings, completedBookings, pendingBookings, totalEarnings: mentor.totalEarnings, averageRating: mentor.averageRating }, recentReviews, monthlyEarnings };
};

export const MentorService = { getAllMentors, getMentorById, createMentorProfile, updateMentorProfile, getMentorDashboard };
