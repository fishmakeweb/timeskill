"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  Trash2,
  Clock,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
} from "date-fns";
import { vi } from "date-fns/locale";

const EVENT_COLORS = [
  { value: "purple", label: "Tím", class: "bg-purple-500" },
  { value: "blue", label: "Xanh dương", class: "bg-blue-500" },
  { value: "green", label: "Xanh lá", class: "bg-green-500" },
  { value: "orange", label: "Cam", class: "bg-orange-500" },
  { value: "red", label: "Đỏ", class: "bg-red-500" },
];

const COLOR_MAP: Record<string, string> = {
  purple: "bg-purple-500",
  blue: "bg-blue-500",
  green: "bg-green-500",
  orange: "bg-orange-500",
  red: "bg-red-500",
};

interface CalendarEventItem {
  _id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  color: string;
  isAllDay: boolean;
}

interface EventForm {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  color: string;
  isAllDay: boolean;
}

const defaultForm: EventForm = {
  title: "",
  description: "",
  startTime: "",
  endTime: "",
  color: "purple",
  isAllDay: false,
};

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState<EventForm>(defaultForm);
  const [loading, setLoading] = useState(false);

  const fetchEvents = useCallback(async () => {
    const start = format(startOfMonth(currentMonth), "yyyy-MM-dd");
    const end = format(endOfMonth(currentMonth), "yyyy-MM-dd");
    const res = await fetch(`/api/calendar?start=${start}&end=${end}`);
    if (res.ok) {
      const data = await res.json();
      setEvents(data);
    }
  }, [currentMonth]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Build calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const getEventsForDay = (day: Date) =>
    events.filter((e) => isSameDay(parseISO(e.startTime), day));

  const openCreateForDay = (day: Date) => {
    setSelectedDay(day);
    const dateStr = format(day, "yyyy-MM-dd");
    setForm({
      ...defaultForm,
      startTime: `${dateStr}T08:00`,
      endTime: `${dateStr}T09:00`,
    });
    setShowDialog(true);
  };

  const handleCreate = async () => {
    if (!form.title.trim()) {
      toast.error("Vui lòng nhập tên sự kiện");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Đã thêm sự kiện!");
        setShowDialog(false);
        setForm(defaultForm);
        fetchEvents();
      }
    } catch {
      toast.error("Lỗi tạo sự kiện");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/calendar/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Đã xóa sự kiện");
      fetchEvents();
    }
  };

  const today = new Date();
  const dayNames = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  // Selected day events
  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="w-7 h-7 text-[#6961d5]" />
            Lịch
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Quản lý sự kiện và lịch trình của bạn
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedDay(today);
            const dateStr = format(today, "yyyy-MM-dd");
            setForm({
              ...defaultForm,
              startTime: `${dateStr}T08:00`,
              endTime: `${dateStr}T09:00`,
            });
            setShowDialog(true);
          }}
          className="bg-[#6961d5] hover:bg-[#5a52c0]"
        >
          <Plus className="w-4 h-4 mr-1" /> Thêm sự kiện
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Calendar Grid */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {format(currentMonth, "MMMM yyyy", { locale: vi })}
                </CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentMonth(new Date())}
                  >
                    Hôm nay
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-2">
              {/* Day headers */}
              <div className="grid grid-cols-7 mb-1">
                {dayNames.map((d) => (
                  <div
                    key={d}
                    className="text-center text-xs font-medium text-muted-foreground py-1"
                  >
                    {d}
                  </div>
                ))}
              </div>
              {/* Day cells */}
              <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
                {days.map((day) => {
                  const dayEvents = getEventsForDay(day);
                  const isToday = isSameDay(day, today);
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isSelected = selectedDay && isSameDay(day, selectedDay);

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDay(day)}
                      onDoubleClick={() => openCreateForDay(day)}
                      className={`bg-card min-h-[70px] p-1 text-left hover:bg-accent transition-colors ${
                        isSelected ? "ring-2 ring-primary ring-inset" : ""
                      }`}
                    >
                      <div
                        className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1 ${
                          isToday
                            ? "bg-[#6961d5] text-white"
                            : isCurrentMonth
                              ? "text-foreground"
                              : "text-muted-foreground/40"
                        }`}
                      >
                        {format(day, "d")}
                      </div>
                      <div className="space-y-0.5">
                        {dayEvents.slice(0, 2).map((e) => (
                          <div
                            key={e._id}
                            className={`${COLOR_MAP[e.color] || "bg-purple-500"} text-white text-[10px] rounded px-1 truncate leading-4`}
                          >
                            {e.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-[10px] text-muted-foreground px-1">
                            +{dayEvents.length - 2} nữa
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Selected Day Panel */}
        <div className="space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">
                  {selectedDay
                    ? format(selectedDay, "EEEE, d MMMM", { locale: vi })
                    : "Chọn ngày"}
                </CardTitle>
                {selectedDay && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => openCreateForDay(selectedDay)}
                  >
                    <Plus className="w-3 h-3 mr-1" /> Thêm
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!selectedDay ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nhấn vào ngày để xem sự kiện
                </p>
              ) : selectedDayEvents.length === 0 ? (
                <div className="text-center py-6">
                  <Calendar className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Không có sự kiện
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-xs"
                    onClick={() => openCreateForDay(selectedDay)}
                  >
                    + Thêm sự kiện
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedDayEvents.map((event) => (
                    <div
                      key={event._id}
                      className="flex items-start gap-2 p-2 rounded-lg border border-border bg-card"
                    >
                      <div
                        className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${COLOR_MAP[event.color]}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-tight truncate">
                          {event.title}
                        </p>
                        {!event.isAllDay && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {format(parseISO(event.startTime), "HH:mm")}
                            {event.endTime &&
                              ` — ${format(parseISO(event.endTime), "HH:mm")}`}
                          </p>
                        )}
                        {event.isAllDay && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] h-4 mt-0.5"
                          >
                            Cả ngày
                          </Badge>
                        )}
                        {event.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {event.description}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-red-500 flex-shrink-0"
                        onClick={() => handleDelete(event._id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming events */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Sắp tới (7 ngày)</CardTitle>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Không có sự kiện
                </p>
              ) : (
                <div className="space-y-1.5">
                  {events
                    .filter((e) => {
                      const d = parseISO(e.startTime);
                      const now = new Date();
                      const week = new Date();
                      week.setDate(week.getDate() + 7);
                      return d >= now && d <= week;
                    })
                    .slice(0, 5)
                    .map((e) => (
                      <div
                        key={e._id}
                        className="flex items-center gap-2 text-xs"
                      >
                        <div
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${COLOR_MAP[e.color]}`}
                        />
                        <span className="truncate flex-1">{e.title}</span>
                        <span className="text-muted-foreground flex-shrink-0">
                          {format(parseISO(e.startTime), "d/M")}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Event Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm sự kiện mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="ev-title">Tên sự kiện *</Label>
              <Input
                id="ev-title"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Học bài, Thi cuối kỳ..."
                className="mt-1"
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="all-day"
                checked={form.isAllDay}
                onCheckedChange={(v) => setForm((f) => ({ ...f, isAllDay: v }))}
              />
              <Label htmlFor="all-day">Cả ngày</Label>
            </div>

            {!form.isAllDay && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Bắt đầu</Label>
                  <Input
                    type="datetime-local"
                    value={form.startTime}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, startTime: e.target.value }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Kết thúc</Label>
                  <Input
                    type="datetime-local"
                    value={form.endTime}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, endTime: e.target.value }))
                    }
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            <div>
              <Label>Màu sắc</Label>
              <div className="flex gap-2 mt-2">
                {EVENT_COLORS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setForm((f) => ({ ...f, color: c.value }))}
                    className={`w-7 h-7 rounded-full ${c.class} transition-transform ${
                      form.color === c.value
                        ? "scale-125 ring-2 ring-offset-1 ring-primary"
                        : ""
                    }`}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="ev-desc">Mô tả (tùy chọn)</Label>
              <Textarea
                id="ev-desc"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Chi tiết..."
                rows={2}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleCreate}
              disabled={loading}
              className="bg-[#6961d5] hover:bg-[#5a52c0]"
            >
              {loading ? "Đang tạo..." : "Tạo sự kiện"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
