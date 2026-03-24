import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { getOpenAI, AI_MODELS, AI_CONFIG } from "@/lib/openai";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Habit from "@/models/Habit";
import Task from "@/models/Task";
import Course from "@/models/Course";
import WaterLog from "@/models/WaterLog";
import SleepLog from "@/models/SleepLog";
import { calculateStreak } from "@/lib/habitCalculations";
import { calculateGPA, convertGradeToScale4 } from "@/lib/gpaCalculations";

type IncomingContext = {
  todayScore?: number;
  streak?: number;
  gpa?: number;
  pendingTasks?: number;
};

type ChatUserContext = {
  userName: string;
  todayScore?: number;
  streak: number;
  pendingTasks: number;
  highPriorityPending: number;
  gpa10?: number;
  gpa4?: number;
  totalCredits: number;
  totalCourses: number;
  waterTodayMl: number;
  waterGoalMl: number;
  waterPercent: number;
  lastSleepHours?: number;
  lastSleepQuality?: number;
  topPendingTasks: string[];
};

function getTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

async function buildChatUserContext(
  userId: string,
  fallback?: IncomingContext,
): Promise<ChatUserContext> {
  await connectDB();

  const { start, end } = getTodayRange();
  const thirtyDaysAgo = new Date(start);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    user,
    todayHabit,
    recentHabits,
    pendingTasks,
    highPriorityPending,
    topPendingTasks,
    courses,
    todayWater,
    lastSleep,
  ] = await Promise.all([
    User.findById(userId).select("name"),
    Habit.findOne({ userId, date: { $gte: start, $lte: end } }).sort({
      date: -1,
    }),
    Habit.find({ userId, date: { $gte: thirtyDaysAgo, $lte: end } })
      .select("date score")
      .sort({ date: -1 }),
    Task.countDocuments({
      userId,
      status: { $nin: ["completed", "done"] },
    }),
    Task.countDocuments({
      userId,
      status: { $nin: ["completed", "done"] },
      priority: "high",
    }),
    Task.find({ userId, status: { $nin: ["completed", "done"] } })
      .sort({ priority: -1, deadline: 1, createdAt: -1 })
      .select("title")
      .limit(3),
    Course.find({ userId }).select(
      "_id userId semester courseName grade credits gradeScale createdAt",
    ),
    WaterLog.findOne({ userId, date: { $gte: start, $lte: end } }),
    SleepLog.findOne({ userId }).sort({ date: -1 }),
  ]);

  const mappedCourses = courses.map((c: any) => ({
    id: c._id.toString(),
    userId: c.userId.toString(),
    semester: c.semester,
    courseName: c.courseName,
    grade: c.grade,
    credits: c.credits,
    gradeScale: c.gradeScale,
    createdAt: c.createdAt,
  }));

  const gpa10 = mappedCourses.length > 0 ? calculateGPA(mappedCourses) : undefined;
  const gpa4 = gpa10 !== undefined ? parseFloat(convertGradeToScale4(gpa10).toFixed(4)) : undefined;
  const totalCredits = mappedCourses.reduce((sum, c) => sum + c.credits, 0);

  const waterTodayMl = todayWater?.totalMl ?? 0;
  const waterGoalMl = todayWater?.goalMl ?? 2000;
  const waterPercent = Math.min(
    100,
    Math.round((waterTodayMl / waterGoalMl) * 100),
  );

  return {
    userName: user?.name || "Bạn",
    todayScore: todayHabit?.score ?? fallback?.todayScore,
    streak:
      recentHabits.length > 0
        ? calculateStreak(
            recentHabits.map((h: any) => ({ date: h.date, score: h.score })),
          )
        : (fallback?.streak ?? 0),
    pendingTasks: pendingTasks ?? fallback?.pendingTasks ?? 0,
    highPriorityPending: highPriorityPending ?? 0,
    gpa10: gpa10 ?? fallback?.gpa,
    gpa4,
    totalCredits,
    totalCourses: mappedCourses.length,
    waterTodayMl,
    waterGoalMl,
    waterPercent,
    lastSleepHours: lastSleep?.durationHours,
    lastSleepQuality: lastSleep?.quality,
    topPendingTasks: topPendingTasks.map((t: any) => t.title).filter(Boolean),
  };
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, context } = await req.json();

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    const userContext = await buildChatUserContext(
      session.user.id,
      context as IncomingContext | undefined,
    );

    const contextStr = `\n\nContext người dùng realtime từ DB:
- Tên: ${userContext.userName}
- Điểm thói quen hôm nay: ${userContext.todayScore !== undefined ? `${userContext.todayScore}/100` : "Chưa check-in"}
- Streak: ${userContext.streak} ngày
- Tasks đang chờ: ${userContext.pendingTasks} (ưu tiên cao: ${userContext.highPriorityPending})
- Top việc đang chờ: ${userContext.topPendingTasks.length > 0 ? userContext.topPendingTasks.join(", ") : "Không có"}
- GPA hiện tại: ${userContext.gpa10 !== undefined ? `${userContext.gpa10.toFixed(2)}/10 (${(userContext.gpa4 ?? 0).toFixed(2)}/4)` : "Chưa có dữ liệu"}
- Tổng môn/tín chỉ: ${userContext.totalCourses}/${userContext.totalCredits}
- Nước hôm nay: ${userContext.waterTodayMl}/${userContext.waterGoalMl} ml (${userContext.waterPercent}%)
- Giấc ngủ gần nhất: ${userContext.lastSleepHours !== undefined ? `${userContext.lastSleepHours.toFixed(1)}h, chất lượng ${userContext.lastSleepQuality}/5` : "Chưa có dữ liệu"}`;

    const systemPrompt = `Bạn là AI Assistant của TimeSkill - ứng dụng quản lý thời gian và thói quen cho học sinh, sinh viên.

TimeSkill gồm 3 module chính:
1. **Habits Tracker**: Theo dõi thói quen hàng ngày (thể dục, nước, ngủ, calo) với hệ thống chấm điểm 0-100
2. **Task Manager**: Quản lý deadline và nhiệm vụ với auto-sorting theo priority và deadline
3. **GPA Calculator**: Tính toán và theo dõi GPA theo học kỳ

Bạn giúp người dùng:
- Hiểu và sử dụng các tính năng
- Cải thiện điểm số thói quen (công thức: Exercise 20 điểm, Water 20 điểm, Sleep 30 điểm, Calories 30 điểm)
- Quản lý deadline hiệu quả
- Giải thích metrics và cách tính toán
- Đưa ra lời khuyên thực tế để cải thiện${contextStr}

Quy tắc trả lời:
- Ưu tiên dùng dữ liệu trong context trên khi người dùng hỏi về "của tôi".
- Nếu thiếu dữ liệu, nói rõ thiếu phần nào và gợi ý thao tác cập nhật dữ liệu trong app.
- Không bịa số liệu.

Trả lời ngắn gọn (2-4 câu), thân thiện, hữu ích bằng tiếng Việt. Sử dụng emoji phù hợp.`;

    const completion = await getOpenAI().chat.completions.create({
      model: AI_MODELS.PRIMARY,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature: AI_CONFIG.temperature,
      max_tokens: AI_CONFIG.maxTokens,
    });

    const reply = completion.choices[0].message.content;

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("AI Chat error:", error);

    // Handle specific OpenAI errors
    if (error.status === 401) {
      return NextResponse.json(
        { error: "API key không hợp lệ" },
        { status: 500 },
      );
    } else if (error.status === 429) {
      return NextResponse.json(
        { error: "Quá nhiều request, vui lòng thử lại sau" },
        { status: 429 },
      );
    }

    return NextResponse.json(
      { error: error.message || "Lỗi hệ thống, vui lòng thử lại" },
      { status: 500 },
    );
  }
}
