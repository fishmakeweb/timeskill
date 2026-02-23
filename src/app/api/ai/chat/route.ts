import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOpenAI, AI_MODELS, AI_CONFIG } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
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

    // System prompt với context về TimeSkill
    const contextStr = context
      ? `\n\nContext người dùng hiện tại:
- Điểm thói quen hôm nay: ${context.todayScore !== undefined ? context.todayScore + "/100" : "Chưa check-in"}
- Streak: ${context.streak || 0} ngày
- GPA: ${context.gpa !== undefined ? context.gpa.toFixed(2) : "Chưa có"}
- Tasks đang chờ: ${context.pendingTasks || 0}`
      : "";

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
