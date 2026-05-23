import { prisma } from "../../lib/prisma.js";
const getPlatformStats = async () => {
    const [totalUsers, totalMentors, totalBookings, completedBookings, revenue, avgRating] = await Promise.all([
        prisma.user.count({ where: { isDeleted: false } }),
        prisma.mentor.count({ where: { isDeleted: false, isActive: true } }),
        prisma.booking.count(),
        prisma.booking.count({ where: { status: "COMPLETED" } }),
        prisma.booking.aggregate({ where: { paymentStatus: "PAID" }, _sum: { totalAmount: true } }),
        prisma.mentor.aggregate({ _avg: { averageRating: true } }),
    ]);
    return {
        totalUsers, totalMentors, totalBookings, completedBookings,
        totalRevenue: revenue._sum.totalAmount || 0,
        averageRating: avgRating._avg.averageRating || 0,
    };
};
const getTopMentors = async () => {
    return prisma.mentor.findMany({
        where: { isDeleted: false, isActive: true },
        orderBy: { averageRating: "desc" },
        take: 6,
        include: { user: { select: { name: true, email: true, image: true } } },
    });
};
const getBookingTrends = async () => {
    const bookings = await prisma.booking.findMany({
        select: { createdAt: true, status: true, totalAmount: true },
        orderBy: { createdAt: "desc" },
        take: 100,
    });
    // Group by month
    const byMonth = {};
    bookings.forEach(b => {
        const key = `${b.createdAt.getFullYear()}-${String(b.createdAt.getMonth() + 1).padStart(2, "0")}`;
        if (!byMonth[key])
            byMonth[key] = { count: 0, revenue: 0 };
        byMonth[key].count++;
        if (b.status === "COMPLETED")
            byMonth[key].revenue += b.totalAmount;
    });
    return Object.entries(byMonth).map(([month, data]) => ({ month, ...data })).slice(0, 6);
};
const getMentorAnalytics = async (userId) => {
    const mentor = await prisma.mentor.findUnique({ where: { userId } });
    if (!mentor)
        return null;
    const [totalBookings, completedBookings, pendingBookings, recentReviews] = await Promise.all([
        prisma.booking.count({ where: { mentorId: mentor.id } }),
        prisma.booking.count({ where: { mentorId: mentor.id, status: "COMPLETED" } }),
        prisma.booking.count({ where: { mentorId: mentor.id, status: "PENDING" } }),
        prisma.review.findMany({ where: { mentorId: mentor.id }, orderBy: { createdAt: "desc" }, take: 5,
            include: { userProfile: { include: { user: { select: { name: true, image: true } } } } } }),
    ]);
    return { mentor, stats: { totalBookings, completedBookings, pendingBookings, totalEarnings: mentor.totalEarnings, averageRating: mentor.averageRating }, recentReviews };
};
const getAdminDashboard = async () => {
    const [stats, topMentors, bookingsByStatus, recentBookings] = await Promise.all([
        getPlatformStats(),
        getTopMentors(),
        prisma.booking.groupBy({ by: ["status"], _count: { id: true } }),
        prisma.booking.findMany({ take: 5, orderBy: { createdAt: "desc" },
            include: { mentor: { include: { user: { select: { name: true } } } }, userProfile: { include: { user: { select: { name: true } } } } } }),
    ]);
    return { stats, topMentors, bookingsByStatus: bookingsByStatus.map(b => ({ status: b.status, count: b._count.id })), recentBookings };
};
export const AnalyticsService = { getPlatformStats, getTopMentors, getBookingTrends, getMentorAnalytics, getAdminDashboard };
