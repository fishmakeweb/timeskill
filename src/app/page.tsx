import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Droplets,
  Moon,
  CheckSquare,
  GraduationCap,
  BookOpen,
  Calendar,
  Timer,
  Sparkles,
  ArrowRight,
  Brain,
  Zap,
  Trophy,
} from "lucide-react";

const features = [
  {
    icon: Activity,
    title: "Thoi quen suc khoe",
    desc: "Theo doi tap the duc, giac ngu va dinh duong moi ngay",
    color: "text-orange-500",
    bg: "bg-orange-50 dark:bg-orange-950/20",
  },
  {
    icon: Droplets,
    title: "Uong nuoc",
    desc: "Nhac uong nuoc va theo doi tieu thu nuoc moi ngay",
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/20",
  },
  {
    icon: Moon,
    title: "Giac ngu",
    desc: "Ghi log giac ngu, phan tich chat luong va xu huong",
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-950/20",
  },
  {
    icon: CheckSquare,
    title: "Kanban Tasks",
    desc: "Quan ly nhiem vu bang Kanban, AI tu dong tao buoc thuc hien",
    color: "text-green-500",
    bg: "bg-green-50 dark:bg-green-950/20",
  },
  {
    icon: GraduationCap,
    title: "GPA Tracker",
    desc: "Tinh GPA he 4, he 10 va du doan diem so",
    color: "text-[#6961d5]",
    bg: "bg-[#6961d5]/10",
  },
  {
    icon: BookOpen,
    title: "Ghi chu + AI Quiz",
    desc: "Ghi chu hoc tap, AI tu dong tao cau hoi trac nghiem",
    color: "text-pink-500",
    bg: "bg-pink-50 dark:bg-pink-950/20",
  },
  {
    icon: Calendar,
    title: "Lich",
    desc: "Quan ly su kien, lich hoc va deadline mot cach de dang",
    color: "text-yellow-500",
    bg: "bg-yellow-50 dark:bg-yellow-950/20",
  },
  {
    icon: Timer,
    title: "Focus Mode",
    desc: "Pomodoro Timer giup ban hoc tap hieu qua hon",
    color: "text-red-500",
    bg: "bg-red-50 dark:bg-red-950/20",
  },
];

const steps = [
  {
    step: "01",
    title: "Tao tai khoan",
    desc: "Dang ky mien phi trong 30 giay",
  },
  {
    step: "02",
    title: "Thiet lap muc tieu",
    desc: "Dat muc tieu hoc tap va suc khoe",
  },
  {
    step: "03",
    title: "Theo doi hang ngay",
    desc: "Cap nhat thoi quen, nhiem vu moi ngay",
  },
  {
    step: "04",
    title: "Phat trien ban than",
    desc: "Xem bao cao va cai thien tung ngay",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#6961d5] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold">TimeSkill</span>
          </div>
          <div className="flex gap-3">
            <Link href="/auth/signin">
              <Button variant="ghost" size="sm">
                Dang nhap
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm" className="bg-[#6961d5] hover:bg-[#5a52c0]">
                Bat dau mien phi
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge className="mb-6 bg-[#6961d5]/10 text-[#6961d5] border-[#6961d5]/20 hover:bg-[#6961d5]/20">
          <Sparkles className="w-3 h-3 mr-1" />
          AI-powered Student Assistant
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
          Tro ly hoc tap
          <br />
          <span className="text-[#6961d5]">thong minh nhat</span>
          <br />
          cho sinh vien
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Quan ly thoi quen, nhiem vu, GPA va lich hoc trong mot ung dung duy
          nhat. AI ho tro hoc tap hieu qua hon moi ngay.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/register">
            <Button
              size="lg"
              className="bg-[#6961d5] hover:bg-[#5a52c0] px-8 gap-2"
            >
              Bat dau mien phi <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/auth/signin">
            <Button size="lg" variant="outline" className="px-8">
              Dang nhap
            </Button>
          </Link>
        </div>

        {/* Hero stats */}
        <div className="grid grid-cols-3 gap-6 max-w-sm mx-auto mt-16">
          {[
            { icon: Brain, label: "AI tich hop", color: "text-[#6961d5]" },
            { icon: Zap, label: "8 tinh nang", color: "text-orange-500" },
            {
              icon: Trophy,
              label: "Bam sac tien bo",
              color: "text-yellow-500",
            },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full bg-secondary flex items-center justify-center`}
              >
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Moi thu ban can</h2>
          <p className="text-muted-foreground">
            8 cong cu giup ban song to chuc hon
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map(({ icon: Icon, title, desc, color, bg }) => (
            <div
              key={title}
              className={`${bg} rounded-xl p-5 border border-transparent hover:border-border transition-colors`}
            >
              <Icon className={`w-8 h-8 ${color} mb-3`} />
              <h3 className="font-semibold mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-secondary/50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Bat dau trong 4 buoc</h2>
            <p className="text-muted-foreground">
              Don gian, nhanh chong va hieu qua
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {steps.map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#6961d5] text-white font-bold text-lg flex items-center justify-center mx-auto mb-3">
                  {step}
                </div>
                <h3 className="font-semibold mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-xl mx-auto bg-[#6961d5] rounded-2xl p-10 text-white">
          <Sparkles className="w-10 h-10 mx-auto mb-4 opacity-80" />
          <h2 className="text-3xl font-bold mb-3">San sang bat dau chua?</h2>
          <p className="text-white/80 mb-6">
            Mien phi hoan toan. Khong can the tin dung.
          </p>
          <Link href="/auth/register">
            <Button
              size="lg"
              className="bg-white text-[#6961d5] hover:bg-white/90 px-8 gap-2"
            >
              Dang ky ngay <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        <p>TimeSkill &copy; 2024 - Tro ly hoc tap thong minh cho sinh vien</p>
      </footer>
    </div>
  );
}
