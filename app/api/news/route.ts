import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const stock = req.nextUrl.searchParams.get("stock") || "";
  if (!stock) return NextResponse.json({ error: "종목명을 입력해주세요." }, { status: 400 });

  try {
    const encoded = encodeURIComponent(stock);
    const rssUrl = `https://news.google.com/rss/search?q=${encoded}+주식&hl=ko&gl=KR&ceid=KR:ko`;
    const res = await fetch(rssUrl);
    const text = await res.text();

    const items: { title: string; link: string; pubDate: string }[] = [];
    const itemMatches = text.matchAll(/<item>([\s\S]*?)<\/item>/g);

    for (const match of itemMatches) {
      const content = match[1];
      const title = content.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] ||
                    content.match(/<title>(.*?)<\/title>/)?.[1] || "";
      const link = content.match(/<link>(.*?)<\/link>/)?.[1] || "";
      const pubDate = content.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || "";

      if (title) items.push({ title, link, pubDate });
      if (items.length >= 5) break;
    }

    return NextResponse.json({ stock, news: items });
  } catch {
    return NextResponse.json({ error: "뉴스 수집 실패" }, { status: 500 });
  }
}
