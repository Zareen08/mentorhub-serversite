import status from "http-status";
import AppError from "../../errorHelpers/AppError.js";
import { prisma } from "../../lib/prisma.js";
const getAllUsers = async (query) => {
    const where = { isDeleted: false };
    if (query.role)
        where.role = query.role;
    if (query.status)
        where.status = query.status;
    if (query.searchTerm)
        where.OR = [
            { name: { contains: query.searchTerm, mode: "insensitive" } },
            { email: { contains: query.searchTerm, mode: "insensitive" } },
        ];
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const [data, total] = await Promise.all([
        prisma.user.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" },
            select: { id: true, name: true, email: true, role: true, status: true, image: true, createdAt: true, emailVerified: true } }),
        prisma.user.count({ where }),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};
const updateUserStatus = async (userId, data) => {
    return prisma.user.update({ where: { id: userId }, data });
};
const getUserProfile = async (userId) => {
    const profile = await prisma.userProfile.findUnique({ where: { userId }, include: { user: true } });
    if (!profile)
        throw new AppError(status.NOT_FOUND, "Profile not found");
    return profile;
};
const updateUserProfile = async (userId, payload) => {
    const { name, image, ...profileData } = payload;
    if (name || image)
        await prisma.user.update({ where: { id: userId }, data: { ...(name && { name }), ...(image && { image }) } });
    return prisma.userProfile.upsert({
        where: { userId },
        create: { userId, ...profileData },
        update: profileData,
        include: { user: true },
    });
};
const deleteUser = async (userId) => {
    return prisma.user.update({ where: { id: userId }, data: { isDeleted: true, status: "DELETED", deletedAt: new Date() } });
};
export const UserService = { getAllUsers, updateUserStatus, getUserProfile, updateUserProfile, deleteUser };
