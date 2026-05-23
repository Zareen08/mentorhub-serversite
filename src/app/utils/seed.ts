import { prisma } from "../lib/prisma.js";
import { auth } from "../lib/auth.js";
import { env } from "../config/env.js";

const seedUser = async (email: string, password: string, name: string, role: string) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing;
  const result = await auth.api.signUpEmail({ body: { email, password, name, needPasswordChange: false } });
  await prisma.user.update({ where: { id: result.user.id }, data: { emailVerified: true, role: role as any } });
  return prisma.user.findUnique({ where: { id: result.user.id } });
};

export const seedSuperAdmin = async () => {
  try {
    // ── Admin ──
    const adminExists = await prisma.user.findUnique({ where: { email: env.SUPER_ADMIN_EMAIL } });
    if (!adminExists) {
      const admin = await seedUser(env.SUPER_ADMIN_EMAIL, env.SUPER_ADMIN_PASSWORD, "Super Admin", "SUPER_ADMIN");
      if (admin) {
        const profileExists = await prisma.userProfile.findUnique({ where: { userId: admin.id } });
        if (!profileExists) await prisma.userProfile.create({ data: { userId: admin.id } });
        console.log(`✅ Super admin seeded: ${env.SUPER_ADMIN_EMAIL}`);
      }
    } else {
      console.log("✅ Super admin already exists");
    }

    // ── Demo Mentor ──
    const mentorEmail = "mentor@mentorhub.com";
    let mentorUser = await prisma.user.findUnique({ where: { email: mentorEmail } });
    if (!mentorUser) {
      mentorUser = await seedUser(mentorEmail, "Mentor123!", "Alex Johnson", "MENTOR");
      if (mentorUser) {
        const profileExists = await prisma.userProfile.findUnique({ where: { userId: mentorUser.id } });
        if (!profileExists) {
          await prisma.userProfile.create({ data: { userId: mentorUser.id, bio: "Passionate about helping developers grow", expertise: ["JavaScript", "React", "Node.js"] } });
        }
        const mentorExists = await prisma.mentor.findUnique({ where: { userId: mentorUser.id } });
        if (!mentorExists) {
          await prisma.mentor.create({ data: {
            userId: mentorUser.id, title: "Senior Software Engineer", company: "Google",
            experience: 8, hourlyRate: 80,
            skills: ["React", "Node.js", "TypeScript", "System Design", "AWS"],
            bio: "8+ years building scalable web apps. I help junior devs become confident engineers.",
            isActive: true, availability: ["MONDAY_AM", "WEDNESDAY_PM", "FRIDAY_AM"],
          }});
        }
        console.log(`✅ Demo mentor seeded: ${mentorEmail} / Mentor123!`);
      }
    } else {
      // Ensure mentor profile exists even if user already exists
      const mentorExists = await prisma.mentor.findUnique({ where: { userId: mentorUser.id } });
      if (!mentorExists) {
        const profileExists = await prisma.userProfile.findUnique({ where: { userId: mentorUser.id } });
        if (!profileExists) await prisma.userProfile.create({ data: { userId: mentorUser.id, bio: "Passionate about helping developers grow", expertise: ["JavaScript", "React", "Node.js"] } });
        await prisma.mentor.create({ data: {
          userId: mentorUser.id, title: "Senior Software Engineer", company: "Google",
          experience: 8, hourlyRate: 80,
          skills: ["React", "Node.js", "TypeScript", "System Design", "AWS"],
          bio: "8+ years building scalable web apps. I help junior devs become confident engineers.",
          isActive: true, availability: ["MONDAY_AM", "WEDNESDAY_PM", "FRIDAY_AM"],
        }});
        console.log(`✅ Demo mentor profile created for existing user: ${mentorEmail}`);
      } else {
        console.log("✅ Demo mentor already exists");
      }
    }

    // ── Additional mentors for a better listing page ──
    const extraMentors = [
      { email: "sarah.chen@mentorhub.com", name: "Sarah Chen", title: "Staff Product Designer", company: "Airbnb", hourlyRate: 95, skills: ["Figma", "UX Research", "Design Systems", "Prototyping", "User Testing"], experience: 6 },
      { email: "james.kim@mentorhub.com", name: "James Kim", title: "ML Engineer", company: "OpenAI", hourlyRate: 120, skills: ["Python", "PyTorch", "LLMs", "MLOps", "Data Science"], experience: 5 },
      { email: "aisha.patel@mentorhub.com", name: "Aisha Patel", title: "Director of Product", company: "Stripe", hourlyRate: 150, skills: ["Product Strategy", "Growth", "B2B SaaS", "Roadmapping", "OKRs"], experience: 10 },
      { email: "marco.rossi@mentorhub.com", name: "Marco Rossi", title: "DevOps Engineer", company: "AWS", hourlyRate: 90, skills: ["Kubernetes", "Terraform", "AWS", "CI/CD", "Docker"], experience: 7 },
    ];

    for (const m of extraMentors) {
      let u = await prisma.user.findUnique({ where: { email: m.email } });
      if (!u) {
        u = await seedUser(m.email, "Mentor123!", m.name, "MENTOR");
      }
      if (u) {
        const profileExists = await prisma.userProfile.findUnique({ where: { userId: u.id } });
        if (!profileExists) await prisma.userProfile.create({ data: { userId: u.id, expertise: m.skills.slice(0, 3) } });
        const mentorExists = await prisma.mentor.findUnique({ where: { userId: u.id } });
        if (!mentorExists) {
          await prisma.mentor.create({ data: {
            userId: u.id, title: m.title, company: m.company,
            experience: m.experience, hourlyRate: m.hourlyRate,
            skills: m.skills, isActive: true,
            bio: `${m.experience}+ years of experience in ${m.skills.slice(0, 2).join(" and ")}. Passionate about mentoring the next generation.`,
            availability: ["MONDAY_AM", "TUESDAY_PM", "THURSDAY_AM"],
          }});
          console.log(`✅ Mentor seeded: ${m.name}`);
        }
      }
    }

    // ── Demo User ──
    const userEmail = "user@mentorhub.com";
    let demoUser = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!demoUser) {
      demoUser = await seedUser(userEmail, "User123!", "Demo User", "USER");
      if (demoUser) {
        const profileExists = await prisma.userProfile.findUnique({ where: { userId: demoUser.id } });
        if (!profileExists) await prisma.userProfile.create({ data: { userId: demoUser.id, bio: "Looking to grow my career", expertise: ["JavaScript", "Python"] } });
        console.log(`✅ Demo user seeded: ${userEmail} / User123!`);
      }
    } else {
      console.log("✅ Demo user already exists");
    }

  } catch (error: any) {
    console.error("Seed error:", error?.message || error);
  }
};
