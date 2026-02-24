"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  CheckSquare,
  Plus,
  Trash2,
  Sparkles,
  GripVertical,
  Clock,
  AlertCircle,
  Flag,
} from "lucide-react";
import { differenceInDays } from "date-fns";

type KanbanStatus = "todo" | "in-progress" | "done";
type TaskPriority = "low" | "medium" | "high";

interface SubTask {
  title: string;
  completed: boolean;
}

interface TaskItem {
  _id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  deadline?: string;
  status: KanbanStatus;
  completed?: boolean;
  subtasks?: SubTask[];
}

const COLUMNS: {
  id: KanbanStatus;
  label: string;
  color: string;
  bg: string;
}[] = [
  {
    id: "todo",
    label: "Chưa làm",
    color: "text-slate-600",
    bg: "bg-slate-100 dark:bg-slate-800/50",
  },
  {
    id: "in-progress",
    label: "Đang làm",
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    id: "done",
    label: "Hoàn thành",
    color: "text-green-600",
    bg: "bg-green-50 dark:bg-green-950/30",
  },
];

const PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; color: string; textColor: string }
> = {
  high: { label: "Cao", color: "bg-red-500", textColor: "text-red-500" },
  medium: { label: "TB", color: "bg-yellow-500", textColor: "text-yellow-500" },
  low: { label: "Thấp", color: "bg-green-500", textColor: "text-green-500" },
};

const defaultForm = {
  title: "",
  description: "",
  priority: "medium" as TaskPriority,
  deadline: "",
};

function getDeadlineText(deadline: string): string {
  const daysLeft = differenceInDays(new Date(deadline), new Date());
  if (daysLeft < 0) return `Quá hạn ${Math.abs(daysLeft)} ngày`;
  if (daysLeft === 0) return "Hôm nay!";
  if (daysLeft === 1) return "Ngày mai";
  return `${daysLeft} ngày nữa`;
}

function isUrgent(deadline: string): boolean {
  const daysLeft = differenceInDays(new Date(deadline), new Date());
  return daysLeft <= 3 && daysLeft >= 0;
}

function normalizeStatus(
  raw: string | undefined,
  completed: boolean | undefined,
): KanbanStatus {
  if (raw === "done" || completed) return "done";
  if (raw === "in-progress") return "in-progress";
  if (raw === "in_progress") return "in-progress";
  if (raw === "inProgress") return "in-progress";
  if (raw === "completed") return "done";
  return "todo";
}

/** Maps UI KanbanStatus back to a DB-valid status value */
function normalizeStatusForApi(
  uiStatus: KanbanStatus,
): "not-started" | "in-progress" | "done" {
  if (uiStatus === "todo") return "not-started";
  if (uiStatus === "done") return "done";
  return "in-progress";
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSubtasks, setAiSubtasks] = useState<string[]>([]);
  const [editTask, setEditTask] = useState<TaskItem | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      if (res.status === 401) {
        window.location.replace("/auth/signin");
        return;
      }
      if (!res.ok) {
        toast.error("Không thể tải nhiệm vụ");
        return;
      }
      const data = await res.json();
      const normalized: TaskItem[] = data.map((t: Record<string, unknown>) => ({
        _id: (t._id || t.id) as string,
        title: t.title as string,
        description: t.description as string | undefined,
        priority: (t.priority as TaskPriority) || "medium",
        deadline: t.deadline ? String(t.deadline) : undefined,
        status: normalizeStatus(
          t.status as string | undefined,
          t.completed as boolean | undefined,
        ),
        subtasks: (t.subtasks as SubTask[]) || [],
      }));
      setTasks(normalized);
    } catch {
      toast.error("Lỗi kết nối — không thể tải nhiệm vụ");
    }
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error("Vui lòng nhập tên nhiệm vụ");
      return;
    }
    // Client-side date validation
    if (form.deadline && form.deadline.trim() !== "") {
      const parsed = new Date(form.deadline);
      if (isNaN(parsed.getTime())) {
        toast.error("Hạn chật không hợp lệ. Vui lòng chọn ngày giờ cụ thể.");
        return;
      }
    }
    setSaving(true);
    try {
      const body = {
        ...form,
        subtasks: aiSubtasks.map((s) => ({ title: s, completed: false })),
        status: editTask ? normalizeStatusForApi(editTask.status) : "not-started",
        completed: false,
      };
      const method = editTask ? "PUT" : "POST";
      const url = editTask ? `/api/tasks/${editTask._id}` : "/api/tasks";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast.success(editTask ? "Đã cập nhật!" : "Đã tạo nhiệm vụ!");
        setShowDialog(false);
        setForm(defaultForm);
        setAiSubtasks([]);
        setEditTask(null);
        fetchTasks();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error ?? "Lỗi lưu nhiệm vụ");
      }
    } catch {
      toast.error("Lỗi kết nối, vui lòng thử lại");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Đã xóa");
      fetchTasks();
    }
  };

  const handleStatusChange = useCallback(
    async (taskId: string, newStatus: KanbanStatus) => {
      const completed = newStatus === "done";
      // Map UI-only "todo" to DB-valid "not-started" before sending to API
      const apiStatus = newStatus === "todo" ? "not-started" : newStatus;
      await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: apiStatus, completed }),
      });
      setTasks((prev) =>
        prev.map((t) =>
          t._id === taskId ? { ...t, status: newStatus, completed } : t,
        ),
      );
    },
    [],
  );

  const onDragEnd = useCallback(
    (result: DropResult) => {
      const { destination, source, draggableId } = result;
      if (!destination) return;
      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      )
        return;
      handleStatusChange(draggableId, destination.droppableId as KanbanStatus);
    },
    [handleStatusChange],
  );

  const generateAISubtasks = async () => {
    if (!form.title.trim()) {
      toast.error("Nhập tên nhiệm vụ trước");
      return;
    }
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/subtasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiSubtasks(
          (data.subtasks || []).map((s: { title: string }) => s.title),
        );
        toast.success("AI đã phân tích xong!");
      }
    } catch {
      toast.error("Lỗi AI");
    } finally {
      setAiLoading(false);
    }
  };

  const openEdit = (task: TaskItem) => {
    setEditTask(task);
    setForm({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      deadline: task.deadline
        ? new Date(task.deadline).toISOString().slice(0, 16)
        : "",
    });
    setAiSubtasks([]);
    setShowDialog(true);
  };

  const columnTasks = (col: KanbanStatus) =>
    tasks.filter((t) => t.status === col);
  const completedCount = tasks.filter((t) => t.status === "done").length;

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CheckSquare className="w-7 h-7 text-[#6961d5]" />
            Nhiệm Vụ
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {completedCount}/{tasks.length} nhiệm vụ hoàn thành
          </p>
        </div>
        <Button
          onClick={() => {
            setEditTask(null);
            setForm(defaultForm);
            setAiSubtasks([]);
            setShowDialog(true);
          }}
          className="bg-[#6961d5] hover:bg-[#5a52c0]"
        >
          <Plus className="w-4 h-4 mr-1" /> Thêm nhiệm vụ
        </Button>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUMNS.map((col) => {
            const colTasks = columnTasks(col.id);
            return (
              <div key={col.id} className={`${col.bg} rounded-xl p-3`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`font-semibold text-sm ${col.color}`}>
                    {col.label}
                  </h3>
                  <Badge variant="secondary" className="h-5 text-[10px]">
                    {colTasks.length}
                  </Badge>
                </div>

                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-30 space-y-2 transition-colors rounded-lg ${snapshot.isDraggingOver ? "bg-primary/5" : ""}`}
                    >
                      {colTasks.map((task, index) => (
                        <Draggable
                          key={task._id}
                          draggableId={task._id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`bg-card border border-border rounded-lg p-3 shadow-sm ${snapshot.isDragging ? "shadow-lg" : ""}`}
                            >
                              <div className="flex items-start gap-2">
                                <div
                                  {...provided.dragHandleProps}
                                  className="mt-0.5 cursor-grab"
                                >
                                  <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p
                                    className={`text-sm font-medium leading-tight ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}
                                  >
                                    {task.title}
                                  </p>
                                  {task.description && (
                                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                      {task.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    <div
                                      className={`w-2 h-2 rounded-full ${PRIORITY_CONFIG[task.priority]?.color}`}
                                    />
                                    <span
                                      className={`text-[10px] font-medium ${PRIORITY_CONFIG[task.priority]?.textColor}`}
                                    >
                                      {PRIORITY_CONFIG[task.priority]?.label}
                                    </span>
                                    {task.deadline && (
                                      <span
                                        className={`text-[10px] flex items-center gap-0.5 ${isUrgent(task.deadline) ? "text-red-500" : "text-muted-foreground"}`}
                                      >
                                        <Clock className="w-2.5 h-2.5" />
                                        {getDeadlineText(task.deadline)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                  <button
                                    onClick={() => openEdit(task)}
                                    className="text-muted-foreground hover:text-foreground"
                                  >
                                    <Flag className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(task._id)}
                                    className="text-muted-foreground hover:text-red-500"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                              {task.subtasks && task.subtasks.length > 0 && (
                                <div className="mt-2 pl-5 space-y-0.5">
                                  {task.subtasks.slice(0, 3).map((sub, i) => (
                                    <p
                                      key={i}
                                      className="text-[10px] text-muted-foreground"
                                    >
                                      {sub.completed ? "✓" : "○"} {sub.title}
                                    </p>
                                  ))}
                                  {task.subtasks.length > 3 && (
                                    <p className="text-[10px] text-muted-foreground">
                                      +{task.subtasks.length - 3} bước nữa
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

                <button
                  onClick={() => {
                    setEditTask(null);
                    setForm(defaultForm);
                    setAiSubtasks([]);
                    setShowDialog(true);
                  }}
                  className="w-full mt-2 text-xs text-muted-foreground hover:text-foreground py-1.5 rounded-lg hover:bg-background/60 flex items-center justify-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Thêm
                </button>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Dialog */}
      <Dialog
        open={showDialog}
        onOpenChange={(open) => {
          setShowDialog(open);
          if (!open) {
            setEditTask(null);
            setAiSubtasks([]);
          }
        }}
      >
        <DialogContent className="max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>
              {editTask ? "Chỉnh sửa nhiệm vụ" : "Tạo nhiệm vụ mới"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="task-title">Tên nhiệm vụ *</Label>
              <Input
                id="task-title"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Học bài, Ôn tập..."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="task-desc">Mô tả</Label>
              <Textarea
                id="task-desc"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={2}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Ưu tiên</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v: TaskPriority) =>
                    setForm((f) => ({ ...f, priority: v }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">Cao</SelectItem>
                    <SelectItem value="medium">Trung bình</SelectItem>
                    <SelectItem value="low">Thấp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="deadline">Hạn chót</Label>
                <Input
                  id="deadline"
                  type="datetime-local"
                  value={form.deadline}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, deadline: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Bước thực hiện (AI)</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateAISubtasks}
                  disabled={aiLoading}
                  className="h-7 text-xs gap-1"
                >
                  <Sparkles className="w-3 h-3 text-[#6961d5]" />
                  {aiLoading ? "Đang phân tích..." : "AI phân tích"}
                </Button>
              </div>
              {aiSubtasks.length > 0 ? (
                <div className="space-y-1.5 p-3 bg-secondary/50 rounded-lg">
                  {aiSubtasks.map((s, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-[#6961d5] text-xs mt-0.5">
                        {i + 1}.
                      </span>
                      <p className="text-xs text-muted-foreground">{s}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Bấm AI để tự động tạo các bước thực hiện
                </p>
              )}
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
              {saving ? "Đang lưu..." : editTask ? "Cập nhật" : "Tạo nhiệm vụ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
