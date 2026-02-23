"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Sparkles, RefreshCw } from "lucide-react";

export default function AIInsights() {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/insights");

      if (response.ok) {
        const { analysis } = await response.json();
        setAnalysis(analysis);
      } else {
        const errorData = await response.json();
        setError(
          errorData.analysis ||
            "Không thể tạo phân tích. Vui lòng thử lại sau.",
        );
      }
    } catch (error) {
      console.error("Fetch insights error:", error);
      setError("Lỗi kết nối. Vui lòng kiểm tra internet và thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-l-4 border-[#6961d5]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#6961d5]" />
          Phân Tích AI
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!analysis && !isLoading && !error && (
          <div className="text-center">
            <p className="text-gray-800 mb-4">
              Để AI phân tích thói quen của bạn và đưa ra lời khuyên cá nhân hóa
            </p>
            <Button
              onClick={fetchInsights}
              className="w-full bg-linear-to-r from-[#6961d5] to-[#8780e0] hover:from-[#5751c0] hover:to-[#7770d0]"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Phân Tích Ngay
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-3">
              <RefreshCw className="h-5 w-5 text-[#6961d5] animate-spin" />
              <div>
                <p className="text-gray-900 font-medium">
                  AI đang phân tích...
                </p>
                <p className="text-sm text-gray-800">
                  Đang xử lý dữ liệu thói quen của bạn
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 whitespace-pre-wrap">{error}</p>
            <Button
              onClick={fetchInsights}
              variant="outline"
              className="mt-3 w-full"
            >
              Thử Lại
            </Button>
          </div>
        )}

        {analysis && !isLoading && (
          <div>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed bg-linear-to-b from-secondary to-white p-4 rounded-lg border border-gray-200">
                {analysis}
              </div>
            </div>
            <Button
              onClick={fetchInsights}
              variant="outline"
              className="mt-4 w-full group"
            >
              <RefreshCw className="mr-2 h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
              Phân Tích Lại
            </Button>
            <p className="text-xs text-gray-700 text-center mt-2">
              💡 Tip: Check-in thường xuyên để nhận phân tích chính xác hơn
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
