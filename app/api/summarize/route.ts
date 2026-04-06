import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { apiKey, stock, news } = await req.json();

  if (!apiKey) return NextResponse.json({ error: "API Key를 입력해주세요." }, { status: 400 });
  if (!news || news.length === 0) return NextResponse.json({ error: "뉴스 데이터가 없습니다." }, { status: 400 });

  const newsTitles = news.map((n: { title: string }, i: number) => `${i + 1}. ${n.title}`).join("\n");

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: `다음은 "${stock}" 관련 최신 뉴스 제목들입니다:\n\n${newsTitles}\n\n각 뉴스에 대해 아래 형식으로 JSON 배열로만 응답해주세요. 다른 설명 없이 JSON만 출력하세요:\n[\n  {\n    "index": 1,\n    "summary": "한 줄 요약",\n    "score": 중요도(1~5 숫자),\n    "sentiment": "긍정" 또는 "부정" 또는 "중립"\n  }\n]`,
          },
        ],
      }),
    });

    const data = await res.json();
    const text = data.content?.[0]?.text || "[]";
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json({ result: parsed });
  } catch {
    return NextResponse.json({ error: "AI 요약 실패" }, { status: 500 });
  }
}
