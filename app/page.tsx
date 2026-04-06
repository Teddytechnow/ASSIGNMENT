"use client";

import { useState } from "react";

type NewsItem = { title: string; link: string; pubDate: string };
type SummaryItem = { index: number; summary: string; score: number; sentiment: string };

export default function Home() {
  const [apiKey, setApiKey] = useState("");
  const [stock, setStock] = useState("");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [summaries, setSummaries] = useState<SummaryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState("");

  const handleAnalyze = async () => {
    if (!stock) return alert("종목명을 입력해주세요.");
    setLoading(true);
    setError("");
    setNews([]);
    setSummaries([]);

    try {
      setStep("📡 뉴스 수집 중...");
      const newsRes = await fetch(`/api/news?stock=${encodeURIComponent(stock)}`);
      const newsData = await newsRes.json();
      if (newsData.error) throw new Error(newsData.error);
      setNews(newsData.news);

      if (apiKey) {
        setStep("🤖 AI 분석 중...");
        const sumRes = await fetch("/api/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ apiKey, stock, news: newsData.news }),
        });
        const sumData = await sumRes.json();
        if (sumData.result) setSummaries(sumData.result);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
      setStep("");
    }
  };

  const getSentimentColor = (sentiment: string) => {
    if (sentiment === "긍정") return "bg-green-100 text-green-700";
    if (sentiment === "부정") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-600";
  };

  return (
    <div className="max-w-2xl mx-auto p-6 font-sans">
      <h1 className="text-2xl font-bold mb-1">📈 주식 정보 자동 수집 AI</h1>
      <p className="text-sm text-gray-500 mb-6">관심 종목의 뉴스를 자동 수집하고 AI가 요약·분석해드립니다.</p>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Claude API Key (선택)</label>
        <input
          type="password"
          placeholder="sk-ant-... (입력 시 AI 요약 기능 활성화)"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        />
        <p className="text-xs text-gray-400 mt-1">* API Key 없이도 뉴스 수집은 가능합니다.</p>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">관심 종목</label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="예: 삼성전자"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
          />
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
          >
            {loading ? step : "분석 시작"}
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">⚠️ {error}</p>}

      {news.length > 0 && (
        <div>
          <h2 className="font-semibold mb-3 text-gray-700">
            📰 {stock} 관련 뉴스 {news.length}건
          </h2>
          <div className="space-y-3">
            {news.map((item, i) => {
              const sum = summaries.find((s) => s.index === i + 1);
              return (
                <div key={i} className="border border-gray-200 rounded p-3">
                  <a href={item.link} target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-700 hover:underline block mb-1">{item.title}</a>
                  <p className="text-xs text-gray-400 mb-2">{item.pubDate}</p>
                  {sum && (
                    <div className="bg-gray-50 rounded p-2 text-sm">
                      <p className="text-gray-700 mb-1">💡 {sum.summary}</p>
                      <div className="flex gap-2 text-xs">
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                          중요도 {sum.score}/5
                        </span>
                        <span className={`px-2 py-0.5 rounded ${getSentimentColor(sum.sentiment)}`}>
                          {sum.sentiment}
                        </span>
                      </div>
                    </div>
                  )}
                  {!sum && !apiKey && (
                    <p className="text-xs text-gray-400">API Key 입력 시 AI 요약이 표시됩니다.</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
