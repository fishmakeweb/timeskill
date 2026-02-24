import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Habit from "@/models/Habit";
import { getOpenAI, AI_MODELS } from "@/lib/openai";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Fetch last 30 days habits
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const habits = await Habit.find({
      userId: session.user.id,
      date: { $gte: thirtyDaysAgo },
    }).sort({ date: -1 });

    if (habits.length === 0) {
      return NextResponse.json({
        analysis:
          "📊 Bạn chưa có dữ liệu thói quen.\n\nHãy bắt đầu check-in hàng ngày để nhận phân tích AI cá nhân hóa!\n\n✨ AI sẽ giúp bạn:\n• Đánh giá xu hướng thói quen\n• Tìm ra điểm mạnh & yếu\n• Gợi ý cải thiện cụ thể\n• Dự đoán tiến bộ",
        habits: [],
      });
    }

    // Calculate statistics
    const avgScore =
      habits.reduce((sum, h) => sum + h.score, 0) / habits.length;
    const avgExercise =
      habits.reduce((sum, h) => sum + h.exercise, 0) / habits.length;
    const avgWater =
      habits.reduce((sum, h) => sum + h.water, 0) / habits.length;
    const avgSleep =
      habits.reduce((sum, h) => sum + h.sleep, 0) / habits.length;
    const avgCalories =
      habits.reduce((sum, h) => sum + h.calories, 0) / habits.length;

    // Prepare data summary
    const dataSummary = {
      totalDays: habits.length,
      avgScore: avgScore.toFixed(1),
      avgExercise: avgExercise.toFixed(1),
      avgWater: avgWater.toFixed(1),
      avgSleep: avgSleep.toFixed(1),
      avgCalories: Math.round(avgCalories),
      recentWeek: habits.slice(0, 7).map((h) => ({
        date: h.date.toISOString().split("T")[0],
        score: h.score,
        exercise: h.exercise,
        water: h.water,
        sleep: h.sleep,
        calories: h.calories,
      })),
    };

    const systemPrompt = `Bạn là chuyên gia phân tích thói quen sức khỏe của AI TimeSkill.

Dữ liệu thói quen ${dataSummary.totalDays} ngày gần nhất:

📊 Điểm trung bình: ${dataSummary.avgScore}/100
🏃 Thể dục TB: ${dataSummary.avgExercise}h/ngày (mục tiêu: 1h)
💧 Nước TB: ${dataSummary.avgWater}L/ngày (mục tiêu: 2L)
😴 Ngủ TB: ${dataSummary.avgSleep}h/ngày (mục tiêu: 7h)
🍽️ Calo TB: ${dataSummary.avgCalories} kcal/ngày (mục tiêu: 2000-2500)

7 ngày gần nhất:
${JSON.stringify(dataSummary.recentWeek, null, 2)}

Hãy viết phân tích CHI TIẾT gồm các phần sau (sử dụng emoji):

## 📊 Tổng Quan
Đánh giá chung về thói quen (1-2 câu)

## ✨ Điểm Mạnh
Liệt kê 2-3 điểm tích cực (metrics nào đạt/vượt mục tiêu)

## ⚠️ Cần Cải Thiện
Liệt kê 2-3 điểm yếu (metrics nào chưa đạt)

## 💡 Lời Khuyên Cụ Thể
3-4 gợi ý thực tế để cải thiện (cụ thể, khả thi)

## 🎯 Dự Đoán
Nếu cải thiện theo lời khuyên, dự đoán điểm số có thể đạt sau 1 tuần

Viết bằng tiếng Việt, thân thiện, động viên, cá nhân hóa. Độ dài: 200-400 từ.`;

    const completion = await getOpenAI().chat.completions.create({
      model: AI_MODELS.PRIMARY,
      messages: [{ role: "system", content: systemPrompt }],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const analysis = completion.choices[0].message.content;

    return NextResponse.json({ analysis, habits: dataSummary });
  } catch (error: any) {
    console.error("AI Insights error:", error);

    // Handle specific errors
    if (error.status === 401) {
      return NextResponse.json(
        {
          analysis:
            "❌ Lỗi cấu hình AI. Vui lòng kiểm tra API key.\n\n(Liên hệ admin để được hỗ trợ)",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        error: error.message || "Internal server error",
        analysis:
          "❌ Không thể tạo phân tích AI lúc này. Vui lòng thử lại sau.\n\n(Có thể do API limit hoặc lỗi kết nối)",
      },
      { status: 500 },
    );
  }
}
