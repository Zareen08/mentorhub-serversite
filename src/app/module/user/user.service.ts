import status from "http-status";
import AppError from "../../errorHelpers/AppError.js";
import { prisma } from "../../lib/prisma.js";
import { IQueryParams } from "../../interfaces/query.interface.js";

const getAllUsers = async (query: IQueryParams) => {
  const where: any = { isDeleted: false };
  if (query.role) where.role = query.role;
  if (query.status) where.status = query.status;
  if (query.searchTerm) where.OR = [
    { name: { contains: query.searchTerm, mode: "insensitive" } },
    { email: { contains: query.searchTerm, mode: "insensitive" } },
  ];
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const [data, total] = await Promise.all([
    prisma.user.findMany({ 
      where, 
      skip: (page - 1) * limit, 
      take: limit, 
      orderBy: { createdAt: "desc" },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        role: true, 
        status: true, 
        image: true, 
        createdAt: true, 
        emailVerified: true 
      } 
    }),
    prisma.user.count({ where }),
  ]);
  return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

const updateUserStatus = async (userId: string, data: { status?: string; role?: string }) => {
  // Cast to proper enum types using 'as any' to bypass type checking
  return prisma.user.update({ 
    where: { id: userId }, 
    data: {
      ...(data.status && { status: data.status as any }),
      ...(data.role && { role: data.role as any })
    }
  });
};

const getUserProfile = async (userId: string) => {
  const profile = await prisma.userProfile.findUnique({ 
    where: { userId }, 
    include: { user: true } 
  });
  if (!profile) throw new AppError(status.NOT_FOUND, "Profile not found");
  return profile;
};

const updateUserProfile = async (userId: string, payload: any) => {
  const { name, image, ...profileData } = payload;
  if (name || image) {
    await prisma.user.update({ 
      where: { id: userId }, 
      data: { 
        ...(name && { name }), 
        ...(image && { image }) 
      } 
    });
  }
  return prisma.userProfile.upsert({
    where: { userId },
    create: { userId, ...profileData },
    update: profileData,
    include: { user: true },
  });
};

const deleteUser = async (userId: string) => {
  return prisma.user.update({ 
    where: { id: userId }, 
    data: { 
      isDeleted: true, 
      status: "DELETED" as any, // Cast to any to bypass type checking
      deletedAt: new Date() 
    } 
  });
};

export const UserService = { 
  getAllUsers, 
  updateUserStatus, 
  getUserProfile, 
  updateUserProfile, 
  deleteUser 
};