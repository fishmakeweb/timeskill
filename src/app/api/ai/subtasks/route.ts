import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { getOpenAI } from "@/lib/openai";

// POST /api/ai/subtasks — suggest subtasks for a task
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, subject } = await req.json();

    if (!title) {
      return NextResponse.json(
        { error: "Task title is required" },
        { status: 400 },
      );
    }

    const prompt = `Bạn là trợ lý học tập cho sinh viên Việt Nam. Hãy chia nhỏ nhiệm vụ sau thành các bước cụ thể, actionable.

Nhiệm vụ: "${title}"
${description ? `Mô tả: "${description}"` : ""}
${subject ? `Môn học: "${subject}"` : ""}

Yêu cầu:
- 3-6 sub-tasks cụ thể
- Mỗi sub-task ngắn gọn (dưới 60 ký tự)
- Sắp xếp theo thứ tự logic
- Phù hợp với sinh viên đại học

Trả về JSON:
{
  "subtasks": [
    { "title": "...", "estimatedMinutes": 30 }
  ]
}

Chỉ trả về JSON.`;

    const completion = await getOpenAI().chat.completions.create({
      model: process.env.AI_MODEL ?? process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("POST /api/ai/subtasks error:", error);
    return NextResponse.json(
      { error: "Không thể tạo sub-tasks" },
      { status: 500 },
    );
  }
}
