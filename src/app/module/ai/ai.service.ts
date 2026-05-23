import { env } from "../../config/env.js";
import { prisma } from "../../lib/prisma.js";
import AppError from "../../errorHelpers/AppError.js";

// OpenRouter API configuration
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// You can change this to any model available on OpenRouter
// Free options: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free"
// Other good free models: "google/gemini-2.0-flash-lite-001", "microsoft/phi-3-mini-128k:free"
const MODEL = "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free";

const askOpenRouter = async (prompt: string): Promise<string> => {
  if (!env.OPENROUTER_API_KEY) {
    throw new AppError(503, "AI service not configured. Set OPENROUTER_API_KEY.");
  }

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        // Optional: Identify your app to OpenRouter
        "HTTP-Referer": env.ALLOWED_ORIGINS || "http://localhost:5000",
        "X-Title": "MentorHub AI",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API error:", response.status, errorText);
      throw new AppError(response.status, `AI service error: ${response.statusText}`);
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content;
    
    if (!result) {
      throw new AppError(500, "Invalid response from AI service");
    }
    
    return result;
  } catch (error) {
    console.error("OpenRouter request failed:", error);
    throw new AppError(500, "Failed to get response from AI service");
  }
};

// 1. AI Mentor Matching
const matchMentors = async (userId: string | undefined, goal: string, budget?: number) => {
  const mentors = await prisma.mentor.findMany({
    where: { isDeleted: false, isActive: true },
    include: { user: { select: { name: true } } },
    take: 20,
  });
  
  const mentorSummaries = mentors.map(m =>
    `ID:${m.id} Name:${m.user.name} Title:${m.title} Skills:${m.skills.join(",")} Rate:$${m.hourlyRate}/hr Rating:${m.averageRating}`
  ).join("\n");
  
  const prompt = `You are a mentor matching AI. Given these mentors:\n${mentorSummaries}\n\nUser goal: "${goal}"${budget ? `\nBudget: $${budget}/hr` : ""}\n\nReturn JSON array of top 5 matches: [{mentorId, reason, matchScore(0-100), expectedOutcome}]. Only return valid JSON.`;
  
  const raw = await askOpenRouter(prompt);
  const cleaned = raw.replace(/```json|```/g, "").trim();
  const matches = JSON.parse(cleaned);
  const enriched = matches.map((m: any) => ({ ...m, mentor: mentors.find(mn => mn.id === m.mentorId) }));
  return enriched;
};

// 2. AI Chat Assistant
const chat = async (userId: string | undefined, messages: { role: string; content: string }[] | string) => {
  // Handle if messages is a string (single message)
  let messageArray: { role: string; content: string }[];
  
  if (typeof messages === 'string') {
    messageArray = [{ role: 'user', content: messages }];
  } else {
    messageArray = messages;
  }
  
  // Build conversation history
  const history = messageArray.slice(0, -1).map(m => `${m.role}: ${m.content}`).join("\n");
  const lastMessage = messageArray[messageArray.length - 1];
  const lastContent = lastMessage?.content || '';
  
  const prompt = `You are MentorHub AI Assistant — a helpful career mentorship platform assistant. Help users find mentors, prepare for sessions, and give career advice.\n\nConversation:\n${history}\n\nUser: ${lastContent}\n\nAssistant:`;
  
  return askOpenRouter(prompt);
};

// 3. AI Recommendations
const getRecommendations = async (userId: string) => {
  const userProfile = await prisma.userProfile.findUnique({ where: { userId } });
  const bookings = userProfile ? await prisma.booking.findMany({ 
    where: { userId: userProfile.id, status: "COMPLETED" }, 
    include: { mentor: true }, 
    take: 5 
  }) : [];
  
  const expertise = userProfile?.expertise || [];
  const prompt = `You are a mentor recommendation AI. User expertise: [${expertise.join(", ")}]. Past mentor skills: [${bookings.map(b => b.mentor.skills.join(",")).join("|")}].\n\nSuggest 3 learning areas and ideal mentor skill sets. Return JSON: [{area, skillsToLookFor, reason}]. Only return valid JSON.`;
  
  const raw = await askOpenRouter(prompt);
  const cleaned = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
};

// 4. AI Platform Insights (Admin)
const getPlatformInsights = async () => {
  const [totalUsers, totalMentors, totalBookings, topSkills, avgRating] = await Promise.all([
    prisma.user.count({ where: { isDeleted: false } }),
    prisma.mentor.count({ where: { isDeleted: false } }),
    prisma.booking.count(),
    prisma.mentor.findMany({ select: { skills: true }, take: 50 }),
    prisma.mentor.aggregate({ _avg: { averageRating: true } }),
  ]);
  
  const skillFreq: Record<string, number> = {};
  topSkills.forEach(m => m.skills.forEach(s => { skillFreq[s] = (skillFreq[s] || 0) + 1; }));
  const topSkillsList = Object.entries(skillFreq).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([skill, count]) => ({ skill, count }));
  
  const prompt = `You are a platform analytics AI. Platform stats: ${totalUsers} users, ${totalMentors} mentors, ${totalBookings} sessions, avg rating: ${avgRating._avg.averageRating?.toFixed(1)}. Top skills: ${topSkillsList.map(s => s.skill).join(", ")}.\n\nProvide insights: Return JSON {summary, trends[{title,description}], recommendations[{action,impact}], growthAreas[string]}. Only return valid JSON.`;
  
  const raw = await askOpenRouter(prompt);
  const cleaned = raw.replace(/```json|```/g, "").trim();
  const insights = JSON.parse(cleaned);
  
  return { 
    stats: { 
      totalUsers, 
      totalMentors, 
      totalBookings, 
      avgRating: avgRating._avg.averageRating, 
      topSkills: topSkillsList 
    }, 
    insights 
  };
};

// 5. AI Session Summary
const generateSessionSummary = async (bookingId: string) => {
  const booking = await prisma.booking.findUnique({ 
    where: { id: bookingId }, 
    include: { 
      mentor: { include: { user: true } }, 
      userProfile: { include: { user: true } } 
    } 
  });
  
  if (!booking) throw new AppError(404, "Booking not found");
  
  const prompt = `Generate a professional mentoring session summary:\nMentor: ${booking.mentor.user.name} (${booking.mentor.title})\nLearner: ${booking.userProfile.user.name}\nDuration: ${booking.duration} minutes\nNotes: ${booking.notes || "General mentoring session"}\n\nReturn JSON: {summary, keyTopics[string], actionItems[string], resources[{title,url}], nextSteps}. Only return valid JSON.`;
  
  const raw = await askOpenRouter(prompt);
  const cleaned = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
};

// 6. AI Sentiment Analysis
const analyzeSentiment = async (text: string) => {
  const prompt = `Analyze the sentiment of this review: "${text}"\n\nReturn JSON: {sentiment("positive"|"negative"|"neutral"), confidence(0-1), emotions[string], keywords[string], summary}. Only return valid JSON.`;
  
  const raw = await askOpenRouter(prompt);
  const cleaned = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
};

export const AIService = { 
  matchMentors, 
  chat, 
  getRecommendations, 
  getPlatformInsights, 
  generateSessionSummary, 
  analyzeSentiment 
};