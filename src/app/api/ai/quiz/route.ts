import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOpenAI } from "@/lib/openai";

// POST /api/ai/quiz — generate quiz from note content
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, title, count = 5 } = await req.json();

    if (!content || content.trim().length < 50) {
      return NextResponse.json(
        {
          error:
            "Nội dung ghi chú quá ngắn để tạo câu hỏi (tối thiểu 50 ký tự)",
        },
        { status: 400 },
      );
    }

    const numQuestions = Math.min(Math.max(parseInt(count), 3), 10);

    const prompt = `Bạn là giáo viên tạo bài kiểm tra. Dựa vào nội dung ghi chú sau đây của sinh viên, hãy tạo ${numQuestions} câu hỏi trắc nghiệm (Multiple Choice) bằng tiếng Việt.

Tiêu đề ghi chú: "${title}"
Nội dung:
---
${content.slice(0, 3000)}
---

Yêu cầu:
- Mỗi câu hỏi có đúng 4 lựa chọn (A, B, C, D)
- Chỉ có 1 đáp án đúng
- Câu hỏi phải bám sát nội dung ghi chú
- Độ khó: 30% dễ, 40% trung bình, 30% khó

Trả về JSON với format:
{
  "questions": [
    {
      "question": "...",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correct": 0,
      "explanation": "..."
    }
  ]
}

Chỉ trả về JSON, không có text thêm.`;

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
    console.error("POST /api/ai/quiz error:", error);
    return NextResponse.json(
      { error: "Không thể tạo quiz. Vui lòng thử lại." },
      { status: 500 },
    );
  }
}
