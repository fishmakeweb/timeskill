"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-b from-secondary to-white p-4">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-[#6961d5]">Oops!</h1>
        <h2 className="mb-4 text-2xl font-semibold text-gray-800">
          Đã xảy ra lỗi
        </h2>
        <p className="mb-8 max-w-md text-gray-800">
          Xin lỗi vì sự bất tiện này. Đã có lỗi xảy ra khi xử lý yêu cầu của
          bạn.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => reset()}>Thử lại</Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/")}
          >
            Về trang chủ
          </Button>
        </div>
      </div>
    </div>
  );
}
