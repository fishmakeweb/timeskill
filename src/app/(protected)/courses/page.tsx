"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GraduationCap,
  Plus,
  Trash2,
  TrendingUp,
  BookOpen,
  Calculator,
  Trophy,
} from "lucide-react";

interface Course {
  _id: string;
  semester: string;
  courseName: string;
  grade: number;
  credits: number;
  gradeScale: "10" | "4";
}

interface GpaData {
  gpa4: number;
  gpa10: number;
  totalCredits: number;
  courseCount: number;
}

const defaultForm = {
  semester: "HK1 2024-2025",
  courseName: "",
  grade: 0,
  credits: 3,
  gradeScale: "10" as "10" | "4",
};

const getGpaClassification = (gpa4: number) => {
  if (gpa4 >= 3.6)
    return {
      label: "Xuất sắc",
      color: "text-purple-600",
      bg: "bg-purple-100 dark:bg-purple-950/30",
    };
  if (gpa4 >= 3.2)
    return {
      label: "Giỏi",
      color: "text-blue-600",
      bg: "bg-blue-100 dark:bg-blue-950/30",
    };
  if (gpa4 >= 2.5)
    return {
      label: "Khá",
      color: "text-green-600",
      bg: "bg-green-100 dark:bg-green-950/30",
    };
  if (gpa4 >= 2.0)
    return {
      label: "Trung bình",
      color: "text-yellow-600",
      bg: "bg-yellow-100 dark:bg-yellow-950/30",
    };
  return {
    label: "Yếu",
    color: "text-red-600",
    bg: "bg-red-100 dark:bg-red-950/30",
  };
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [gpaData, setGpaData] = useState<GpaData | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  // Predictor state
  const [predictForm, setPredictForm] = useState({
    grade: 0,
    credits: 3,
    gradeScale: "10" as "10" | "4",
  });
  const [predictResult, setPredictResult] = useState<{
    currentGpa4: number;
    predictedGpa4: number;
  } | null>(null);
  const [predicting, setPredicting] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [coursesRes, gpaRes] = await Promise.all([
        fetch("/api/courses"),
        fetch("/api/gpa"),
      ]);
      if (coursesRes.status === 401 || gpaRes.status === 401) {
        window.location.replace("/auth/signin");
        return;
      }
      if (coursesRes.ok) setCourses(await coursesRes.json());
      if (gpaRes.ok) setGpaData(await gpaRes.json());
    } catch {
      toast.error("Lỗi kết nối — không thể tải dữ liệu");
    }
  };

  const handleSubmit = async () => {
    if (!form.courseName.trim()) {
      toast.error("Nhập tên môn học");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Đã thêm môn học!");
        setShowDialog(false);
        setForm(defaultForm);
        fetchAll();
      }
    } catch {
      toast.error("Lỗi lưu");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/courses/${id}`, { method: "DELETE" }).catch(
      () => null,
    );
    if (res?.ok) {
      toast.success("Đã xóa");
      fetchAll();
    } else {
      // Try with different endpoint pattern
      toast.error("Không thể xóa - thử lại");
    }
  };

  const handlePredict = async () => {
    setPredicting(true);
    try {
      const res = await fetch("/api/gpa/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(predictForm),
      });
      if (res.ok) {
        const data = await res.json();
        // API returns { currentGpa, predictedGpa, difference, totalCreditsAfter }
        // Map to state shape { currentGpa4, predictedGpa4 }
        setPredictResult({
          currentGpa4: data.currentGpa ?? 0,
          predictedGpa4: data.predictedGpa ?? 0,
        });
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error ?? "Lỗi dự đoán GPA");
      }
    } catch {
      toast.error("Lỗi dự đoán");
    } finally {
      setPredicting(false);
    }
  };

  // Group by semester for chart
  const semesterGroups = courses.reduce((acc: Record<string, Course[]>, c) => {
    if (!acc[c.semester]) acc[c.semester] = [];
    acc[c.semester].push(c);
    return acc;
  }, {});

  const chartData = Object.entries(semesterGroups)
    .map(([sem, crs]) => {
      const totalW = crs.reduce((s, c) => {
        const g10 = c.gradeScale === "4" ? (c.grade / 4) * 10 : c.grade;
        return s + g10 * c.credits;
      }, 0);
      const totalC = crs.reduce((s, c) => s + c.credits, 0);
      const avg10 = totalC > 0 ? totalW / totalC : 0;
      return {
        semester: sem.replace(/HK|hk/i, "HK"),
        gpa10: parseFloat(avg10.toFixed(2)),
      };
    })
    .sort((a, b) => a.semester.localeCompare(b.semester));

  const cls = gpaData ? getGpaClassification(gpaData.gpa4) : null;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-[#6961d5]" />
            GPA & Môn Học
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Quản lý điểm số và tính GPA
          </p>
        </div>
        <Button
          onClick={() => setShowDialog(true)}
          className="bg-[#6961d5] hover:bg-[#5a52c0]"
        >
          <Plus className="w-4 h-4 mr-1" /> Thêm môn học
        </Button>
      </div>

      {/* GPA Summary */}
      {gpaData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className={`col-span-2 ${cls?.bg} border-0`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">GPA Hệ 4</p>
                  <p className={`text-4xl font-bold ${cls?.color}`}>
                    {(gpaData.gpa4 ?? 0).toFixed(2)}
                  </p>
                  <Badge className="mt-1 bg-[#6961d5]">{cls?.label}</Badge>
                </div>
                <Trophy className={`w-12 h-12 ${cls?.color} opacity-30`} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">GPA Hệ 10</p>
              <p className="text-3xl font-bold text-[#6961d5]">
                {(gpaData.gpa10 ?? 0).toFixed(2)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Số tín chỉ</p>
              <p className="text-3xl font-bold">{gpaData.totalCredits}</p>
              <p className="text-xs text-muted-foreground">
                {gpaData.courseCount} môn
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="courses">
        <TabsList className="grid grid-cols-3 w-full max-w-sm">
          <TabsTrigger value="courses">Môn học</TabsTrigger>
          <TabsTrigger value="chart">Biểu đồ</TabsTrigger>
          <TabsTrigger value="predict">Dự đoán</TabsTrigger>
        </TabsList>

        {/* Courses List */}
        <TabsContent value="courses" className="mt-4 space-y-3">
          {Object.entries(semesterGroups).length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground">Chưa có môn học nào</p>
                <Button
                  onClick={() => setShowDialog(true)}
                  className="mt-3 bg-[#6961d5] hover:bg-[#5a52c0]"
                  size="sm"
                >
                  Thêm môn học đầu tiên
                </Button>
              </CardContent>
            </Card>
          ) : (
            Object.entries(semesterGroups).map(([sem, crs]) => {
              const semGpa = (() => {
                const totalW = crs.reduce(
                  (s, c) =>
                    s +
                    (c.gradeScale === "4" ? (c.grade / 4) * 10 : c.grade) *
                      c.credits,
                  0,
                );
                const totalC = crs.reduce((s, c) => s + c.credits, 0);
                return totalC > 0 ? (totalW / totalC).toFixed(2) : "0.00";
              })();
              return (
                <Card key={sem}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{sem}</CardTitle>
                      <Badge variant="secondary">GPA: {semGpa}/10</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {crs.map((c) => (
                      <div
                        key={c._id}
                        className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {c.courseName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {c.credits} tín chỉ
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-bold text-sm ${
                              c.grade >= (c.gradeScale === "4" ? 3.2 : 8)
                                ? "text-green-500"
                                : c.grade >= (c.gradeScale === "4" ? 2.5 : 6.5)
                                  ? "text-yellow-500"
                                  : "text-red-500"
                            }`}
                          >
                            {c.grade}/{c.gradeScale}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDelete(c._id)}
                          className="text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* Chart Tab */}
        <TabsContent value="chart" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#6961d5]" />
                Biến động GPA theo học kỳ
              </CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length < 2 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Cần ít nhất 2 học kỳ để hiển thị biểu đồ
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-border"
                    />
                    <XAxis dataKey="semester" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="gpa10"
                      stroke="#6961d5"
                      strokeWidth={2}
                      dot={{ fill: "#6961d5", r: 4 }}
                      name="GPA/10"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Predictor Tab */}
        <TabsContent value="predict" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Calculator className="w-4 h-4 text-[#6961d5]" />
                Dự đoán GPA nếu thêm môn học
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Điểm</Label>
                  <Input
                    type="number"
                    min={0}
                    max={10}
                    step={0.1}
                    value={predictForm.grade}
                    onChange={(e) =>
                      setPredictForm((p) => ({
                        ...p,
                        grade: Number(e.target.value),
                      }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Tín chỉ</Label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={predictForm.credits}
                    onChange={(e) =>
                      setPredictForm((p) => ({
                        ...p,
                        credits: Number(e.target.value),
                      }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Hệ số</Label>
                  <Select
                    value={predictForm.gradeScale}
                    onValueChange={(v: "10" | "4") =>
                      setPredictForm((p) => ({ ...p, gradeScale: v }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">Hệ 10</SelectItem>
                      <SelectItem value="4">Hệ 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handlePredict}
                disabled={predicting}
                className="w-full bg-[#6961d5] hover:bg-[#5a52c0]"
              >
                {predicting ? "Đang tính..." : "Tính GPA dự đoán"}
              </Button>

              {predictResult && (
                <div className="p-4 bg-[#6961d5]/10 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      GPA hiện tại:
                    </span>
                    <span className="font-bold">
                      {predictResult.currentGpa4.toFixed(2)}/4.0
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      GPA dự đoán:
                    </span>
                    <span
                      className={`font-bold text-lg ${
                        predictResult.predictedGpa4 > predictResult.currentGpa4
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {predictResult.predictedGpa4.toFixed(2)}/4.0
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t pt-2">
                    <span className="text-sm text-muted-foreground">
                      Thay đổi:
                    </span>
                    <Badge
                      className={
                        predictResult.predictedGpa4 >= predictResult.currentGpa4
                          ? "bg-green-500"
                          : "bg-red-500"
                      }
                    >
                      {predictResult.predictedGpa4 >= predictResult.currentGpa4
                        ? "+"
                        : ""}
                      {(
                        predictResult.predictedGpa4 - predictResult.currentGpa4
                      ).toFixed(2)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    {getGpaClassification(predictResult.predictedGpa4).label} -
                    Dự đoán
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Course Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Thêm môn học mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Học kỳ</Label>
              <Input
                value={form.semester}
                onChange={(e) =>
                  setForm((f) => ({ ...f, semester: e.target.value }))
                }
                placeholder="HK1 2024-2025"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Tên môn học *</Label>
              <Input
                value={form.courseName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, courseName: e.target.value }))
                }
                placeholder="Giải tích, Lập trình OOP..."
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Điểm</Label>
                <Input
                  type="number"
                  min={0}
                  max={form.gradeScale === "10" ? 10 : 4}
                  step={0.1}
                  value={form.grade}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, grade: Number(e.target.value) }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Tín chỉ</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={form.credits}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, credits: Number(e.target.value) }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Hệ số</Label>
                <Select
                  value={form.gradeScale}
                  onValueChange={(v: "10" | "4") =>
                    setForm((f) => ({ ...f, gradeScale: v }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">Hệ 10</SelectItem>
                    <SelectItem value="4">Hệ 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving}
              className="bg-[#6961d5] hover:bg-[#5a52c0]"
            >
              {saving ? "Đang lưu..." : "Thêm môn học"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
