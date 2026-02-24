import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { getOpenAI, AI_MODELS } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      todayScore,
      streak,
      gpa,
      pendingTasks,
      waterPercent,
      userName,
      hour,
    } = await req.json();

    const timeOfDay =
      hour < 12
        ? "buổi sáng"
        : hour < 17
          ? "buổi chiều"
          : hour < 21
            ? "buổi tối"
            : "đêm khuya";

    const scoreStatus =
      todayScore != null
        ? todayScore >= 80
          ? `Xuất sắc (${todayScore}/100) 🌟`
          : todayScore >= 50
            ? `Khá (${todayScore}/100)`
            : `Thấp (${todayScore}/100) – cần cải thiện`
        : "Chưa check-in hôm nay";

    const contextLines = [
      `Tên người dùng: ${userName || "bạn"}`,
      `Thời điểm: ${timeOfDay}`,
      `Điểm thói quen hôm nay: ${scoreStatus}`,
      `Streak: ${streak > 0 ? `${streak} ngày liên tiếp 🔥` : "Chưa có streak"}`,
      `GPA: ${gpa != null ? Number(gpa).toFixed(2) + "/4.0" : "Chưa có dữ liệu"}`,
      `Tasks đang chờ xử lý: ${pendingTasks ?? 0} nhiệm vụ`,
      `Uống nước hôm nay: ${waterPercent ?? 0}% mục tiêu`,
    ].join("\n");

    const prompt = `Bạn là AI assistant thân thiện của TimeSkill – ứng dụng học tập dành cho sinh viên.

Dữ liệu thực tế của người dùng lúc này:
${contextLines}

Hãy viết lời chào mở đầu cuộc hội thoại theo cấu trúc sau (4–5 câu, xưng "mình"):

1. Chào theo thời điểm trong ngày (dùng tên nếu có). Nếu streak ≥ 3 ngày, khen ngợi tự nhiên.
2. Nhận xét ngắn về điểm nổi bật nhất: điểm thói quen tốt → khen; chưa check-in → nhắc; tasks nhiều → lưu ý.
3. Gợi ý ưu tiên một việc cụ thể nhất nên làm ngay (dựa vào context: check-in habits, uống nước, hoàn thành task...).
4. Kết bằng câu mở ("Bạn muốn mình giúp gì hôm nay?" hoặc biến thể tự nhiên).

Phong cách: thân thiện như người bạn đồng hành, không formal, dùng emoji phù hợp, ngắn gọn.`;

    const completion = await getOpenAI().chat.completions.create({
      model: AI_MODELS.PRIMARY,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.85,
      max_tokens: 280,
    });

    const greeting =
      completion.choices[0].message.content ??
      "👋 Chào bạn! Hôm nay mình có thể giúp gì cho bạn?";

    return NextResponse.json({ greeting });
  } catch (error: any) {
    console.error("AI greet error:", error);
    // Always return a fallback — never surface errors for the greeting
    const fallback =
      "👋 Chào mừng bạn đến với TimeSkill! Mình đang ở đây để hỗ trợ bạn hôm nay. Bạn muốn bắt đầu từ đâu nào?";
    return NextResponse.json({ greeting: fallback });
  }
}
