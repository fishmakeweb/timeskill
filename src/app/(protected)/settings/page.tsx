"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import toast from "react-hot-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  User,
  Palette,
  Bell,
  Shield,
  LogOut,
  Trash2,
  Download,
  Moon,
  Sun,
  Monitor,
  GraduationCap,
  Sparkles,
} from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    university: "",
    major: "",
    year: "1",
  });

  const [notifications, setNotifications] = useState({
    taskReminders: true,
    habitReminders: true,
    weeklyReport: true,
  });

  useEffect(() => {
    setMounted(true);
    if (session?.user) {
      setProfile((p) => ({ ...p, name: session.user?.name ?? "" }));
    }
    // Load saved settings from localStorage
    const saved = localStorage.getItem("ts-settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.profile) setProfile(parsed.profile);
        if (parsed.notifications) setNotifications(parsed.notifications);
      } catch {}
    }
  }, [session]);

  const saveSettings = () => {
    setSaving(true);
    localStorage.setItem(
      "ts-settings",
      JSON.stringify({ profile, notifications }),
    );
    setTimeout(() => {
      setSaving(false);
      toast.success("Đã lưu cài đặt!");
    }, 500);
  };

  const exportData = async () => {
    try {
      const [tasksRes, habitsRes, coursesRes] = await Promise.all([
        fetch("/api/tasks"),
        fetch("/api/habits"),
        fetch("/api/courses"),
      ]);
      const tasks = tasksRes.ok ? await tasksRes.json() : [];
      const habits = habitsRes.ok ? await habitsRes.json() : [];
      const courses = coursesRes.ok ? await coursesRes.json() : [];

      const data = {
        exportedAt: new Date().toISOString(),
        tasks,
        habits,
        courses,
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `timeskill-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Đã xuất dữ liệu!");
    } catch {
      toast.error("Không thể xuất dữ liệu");
    }
  };

  const themeOptions = [
    { value: "system", label: "Theo hệ thống", icon: Monitor },
    { value: "light", label: "Sáng", icon: Sun },
    { value: "dark", label: "Tối", icon: Moon },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-[#6961d5]" />
          Cài Đặt
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Tùy chỉnh trải nghiệm TimeSkill của bạn
        </p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="w-4 h-4 text-[#6961d5]" />
            Thông tin cá nhân
          </CardTitle>
          <CardDescription>Cập nhật hồ sơ sinh viên của bạn</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
              {profile.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div>
              <p className="font-semibold">{session?.user?.email}</p>
              <Badge variant="secondary" className="text-xs mt-0.5">
                Sinh viên
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label htmlFor="name">Họ tên</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Nguyễn Văn A"
                className="mt-1"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="university">Trường đại học</Label>
              <Input
                id="university"
                value={profile.university}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, university: e.target.value }))
                }
                placeholder="Đại học Bách Khoa TP.HCM"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="major">Ngành học</Label>
              <Input
                id="major"
                value={profile.major}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, major: e.target.value }))
                }
                placeholder="Công nghệ thông tin"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="year">Năm học</Label>
              <Select
                value={profile.year}
                onValueChange={(v) => setProfile((p) => ({ ...p, year: v }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Năm 1</SelectItem>
                  <SelectItem value="2">Năm 2</SelectItem>
                  <SelectItem value="3">Năm 3</SelectItem>
                  <SelectItem value="4">Năm 4</SelectItem>
                  <SelectItem value="5">Năm 5+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      {mounted && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Palette className="w-4 h-4 text-[#6961d5]" />
              Giao diện
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Label className="text-sm text-muted-foreground mb-3 block">
              Chủ đề màu sắc
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {themeOptions.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                    theme === value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${theme === value ? "text-primary" : "text-muted-foreground"}`}
                  />
                  <span
                    className={`text-xs font-medium ${theme === value ? "text-primary" : "text-muted-foreground"}`}
                  >
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="w-4 h-4 text-[#6961d5]" />
            Thông báo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              key: "taskReminders",
              label: "Nhắc nhở nhiệm vụ",
              desc: "Nhắc khi nhiệm vụ sắp đến hạn",
            },
            {
              key: "habitReminders",
              label: "Nhắc nhở thói quen",
              desc: "Nhắc uống nước, tập thể dục mỗi ngày",
            },
            {
              key: "weeklyReport",
              label: "Báo cáo tuần",
              desc: "Tổng kết hoạt động cuối tuần",
            },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              <Switch
                checked={notifications[key as keyof typeof notifications]}
                onCheckedChange={(v) =>
                  setNotifications((n) => ({ ...n, [key]: v }))
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Save button */}
      <Button
        onClick={saveSettings}
        disabled={saving}
        className="w-full bg-[#6961d5] hover:bg-[#5a52c0]"
      >
        {saving ? "Đang lưu..." : "Lưu cài đặt"}
      </Button>

      <Separator />

      {/* Data & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="w-4 h-4 text-[#6961d5]" />
            Dữ liệu & Quyền riêng tư
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={exportData}
          >
            <Download className="w-4 h-4" />
            Xuất dữ liệu (JSON)
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-2 text-orange-500 border-orange-200 hover:bg-orange-50"
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 text-red-500 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
                Xóa tài khoản
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xóa tài khoản?</AlertDialogTitle>
                <AlertDialogDescription>
                  Hành động này không thể hoàn tác. Toàn bộ dữ liệu của bạn bao
                  gồm nhiệm vụ, thói quen, ghi chú và điểm số sẽ bị xóa vĩnh
                  viễn.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction className="bg-red-500 hover:bg-red-600">
                  Xóa tài khoản
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {/* App info */}
      <div className="text-center text-xs text-muted-foreground pb-4">
        <p>TimeSkill v1.0.0 — Trợ lý học tập thông minh</p>
        <p className="mt-1">Made with ❤️ for Vietnamese students</p>
      </div>
    </div>
  );
}
