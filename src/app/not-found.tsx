import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-b from-secondary to-white p-4">
      <div className="text-center">
        <h1 className="mb-4 text-9xl font-bold text-[#6961d5]">404</h1>
        <h2 className="mb-4 text-3xl font-semibold text-gray-800">
          Trang không tồn tại
        </h2>
        <p className="mb-8 text-gray-800">
          Xin lỗi, chúng tôi không tìm thấy trang bạn đang tìm kiếm.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/">
            <Button variant="outline">← Về trang chủ</Button>
          </Link>
          <Link href="/dashboard">
            <Button>Đến Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
