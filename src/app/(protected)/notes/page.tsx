"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Plus,
  Search,
  Trash2,
  Edit,
  Sparkles,
  ChevronRight,
  Tag,
  X,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface Note {
  _id: string;
  title: string;
  content?: string;
  subject: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [noteDetailOpen, setNoteDetailOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const [form, setForm] = useState({
    title: "",
    content: "",
    subject: "",
    tags: [] as string[],
  });

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/notes${params}`);
      if (res.ok) setNotes(await res.json());
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchNotes, 300);
    return () => clearTimeout(t);
  }, [fetchNotes]);

  const openNote = async (note: Note) => {
    const res = await fetch(`/api/notes/${note._id}`);
    if (res.ok) {
      const full = await res.json();
      setSelectedNote(full);
      setForm({
        title: full.title,
        content: full.content,
        subject: full.subject,
        tags: full.tags,
      });
      setEditMode(false);
      setNoteDetailOpen(true);
    }
  };

  const saveNote = async () => {
    if (!form.title.trim()) {
      toast.error("Tiêu đề không được để trống");
      return;
    }

    const isEdit = !!selectedNote;
    const url = isEdit ? `/api/notes/${selectedNote._id}` : "/api/notes";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      toast.success(
        isEdit ? "✅ Đã cập nhật ghi chú" : "✅ Đã tạo ghi chú mới",
      );
      setCreateOpen(false);
      setNoteDetailOpen(false);
      setEditMode(false);
      setForm({ title: "", content: "", subject: "", tags: [] });
      fetchNotes();
    } else {
      toast.error("Không thể lưu ghi chú");
    }
  };

  const deleteNote = async (id: string) => {
    if (!confirm("Xóa ghi chú này?")) return;
    const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Đã xóa");
      fetchNotes();
      setNoteDetailOpen(false);
    }
  };

  const generateQuiz = async (note: Note) => {
    setSelectedNote(note);
    setQuizOpen(true);
    setQuizLoading(true);
    setQuiz([]);
    setQuizAnswers({});
    setQuizSubmitted(false);

    // Fetch full note
    const fullRes = await fetch(`/api/notes/${note._id}`);
    const full = fullRes.ok ? await fullRes.json() : note;

    const res = await fetch("/api/ai/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: full.content,
        title: full.title,
        count: 5,
      }),
    });

    setQuizLoading(false);
    if (res.ok) {
      const data = await res.json();
      setQuiz(data.questions ?? []);
    } else {
      toast.error("Không thể tạo quiz");
      setQuizOpen(false);
    }
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t) && form.tags.length < 10) {
      setForm((p) => ({ ...p, tags: [...p.tags, t] }));
      setTagInput("");
    }
  };

  const removeTag = (t: string) => {
    setForm((p) => ({ ...p, tags: p.tags.filter((x) => x !== t) }));
  };

  const quizScore = quizSubmitted
    ? quiz.filter((q, i) => quizAnswers[i] === q.correct).length
    : 0;

  if (loading && notes.length === 0) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const NoteForm = () => (
    <div className="space-y-4">
      <div>
        <Label>Tiêu đề *</Label>
        <Input
          placeholder="Ví dụ: Ôn tập chương 3 - Giải tích"
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          className="mt-1"
        />
      </div>
      <div>
        <Label>Môn học</Label>
        <Input
          placeholder="Ví dụ: Giải tích, Vật lý, Tiếng Anh..."
          value={form.subject}
          onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
          className="mt-1"
        />
      </div>
      <div>
        <Label>Nội dung ghi chú (Markdown)</Label>
        <Textarea
          placeholder="Viết nội dung ghi chú ở đây...&#10;&#10;Hỗ trợ Markdown: **bold**, *italic*, # tiêu đề..."
          value={form.content}
          onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
          rows={10}
          className="mt-1 font-mono text-sm"
        />
      </div>
      <div>
        <Label>Tags</Label>
        <div className="flex gap-2 mt-1">
          <Input
            placeholder="Thêm tag..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
          />
          <Button type="button" variant="outline" onClick={addTag}>
            +
          </Button>
        </div>
        {form.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {form.tags.map((t) => (
              <Badge key={t} variant="secondary" className="gap-1">
                {t}
                <button onClick={() => removeTag(t)}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
      <Button onClick={saveNote} className="w-full">
        💾 Lưu ghi chú
      </Button>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-orange-500" />
            Ghi Chú Học Tập
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {notes.length} ghi chú · AI Quiz từ nội dung bất kỳ
          </p>
        </div>
        <Button
          onClick={() => {
            setForm({ title: "", content: "", subject: "", tags: [] });
            setCreateOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-1" />
          Tạo ghi chú
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm ghi chú..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Notes Grid */}
      {notes.length === 0 ? (
        <Card className="text-center py-16">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">
            {search
              ? `Không tìm thấy ghi chú nào cho "${search}"`
              : "Chưa có ghi chú nào"}
          </p>
          {!search && (
            <Button className="mt-3" onClick={() => setCreateOpen(true)}>
              Tạo ghi chú đầu tiên
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <Card
              key={note._id}
              className="cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 group"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3
                    className="font-semibold text-sm leading-tight line-clamp-2 flex-1 group-hover:text-primary transition-colors"
                    onClick={() => openNote(note)}
                  >
                    {note.title}
                  </h3>
                </div>

                {note.subject && (
                  <Badge variant="outline" className="text-xs mb-2">
                    {note.subject}
                  </Badge>
                )}

                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {note.tags.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="text-xs text-muted-foreground flex items-center gap-0.5"
                      >
                        <Tag className="w-2.5 h-2.5" />
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-xs text-muted-foreground mb-3">
                  {format(new Date(note.updatedAt), "dd/MM/yyyy HH:mm", {
                    locale: vi,
                  })}
                </p>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={() => openNote(note)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Mở
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 text-xs bg-orange-500 hover:bg-orange-600 text-white"
                    onClick={() => generateQuiz(note)}
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI Quiz
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive px-2"
                    onClick={() => deleteNote(note._id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Tạo ghi chú mới</DialogTitle>
          </DialogHeader>
          <NoteForm />
        </DialogContent>
      </Dialog>

      {/* Note Detail Dialog */}
      <Dialog open={noteDetailOpen} onOpenChange={setNoteDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg">
                {selectedNote?.title}
              </DialogTitle>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditMode(!editMode)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  {editMode ? "Xem" : "Sửa"}
                </Button>
                <Button
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={() => {
                    setNoteDetailOpen(false);
                    if (selectedNote) generateQuiz(selectedNote);
                  }}
                >
                  <Sparkles className="w-4 h-4 mr-1" />
                  Tạo Quiz
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => selectedNote && deleteNote(selectedNote._id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          {editMode ? (
            <NoteForm />
          ) : (
            <div className="prose dark:prose-invert max-w-none">
              {selectedNote?.subject && (
                <Badge variant="outline" className="mb-3">
                  {selectedNote.subject}
                </Badge>
              )}
              <div className="whitespace-pre-wrap text-sm text-foreground bg-muted/30 rounded-lg p-4 font-mono">
                {selectedNote?.content || "Ghi chú trống"}
              </div>
              {selectedNote?.tags && selectedNote.tags.length > 0 && (
                <div className="flex gap-1.5 mt-3">
                  {selectedNote.tags.map((t) => (
                    <Badge key={t} variant="secondary">
                      {t}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Quiz Dialog */}
      <Dialog open={quizOpen} onOpenChange={setQuizOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-500" />
              AI Quiz — {selectedNote?.title}
            </DialogTitle>
          </DialogHeader>

          {quizLoading ? (
            <div className="space-y-4 py-4">
              <p className="text-center text-muted-foreground">
                AI đang tạo câu hỏi...
              </p>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : quiz.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">
              Không thể tạo quiz từ nội dung này.
            </p>
          ) : (
            <div className="space-y-6 py-2">
              {quizSubmitted && (
                <div
                  className={`rounded-lg p-3 text-center font-semibold ${
                    quizScore >= quiz.length * 0.8
                      ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                      : "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400"
                  }`}
                >
                  {quizScore >= quiz.length * 0.8 ? "🎉" : "📚"} Đúng{" "}
                  {quizScore}/{quiz.length} câu
                  {quizScore >= quiz.length * 0.8
                    ? " — Xuất sắc!"
                    : " — Ôn thêm nhé!"}
                </div>
              )}

              {quiz.map((q, qi) => (
                <div key={qi} className="space-y-3">
                  <p className="font-medium text-sm">
                    {qi + 1}. {q.question}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => {
                      const isSelected = quizAnswers[qi] === oi;
                      const isCorrect = oi === q.correct;
                      let className =
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors text-sm ";

                      if (quizSubmitted) {
                        if (isCorrect)
                          className +=
                            "border-green-400 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400";
                        else if (isSelected)
                          className +=
                            "border-red-400 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400";
                        else className += "border-border opacity-60";
                      } else if (isSelected) {
                        className +=
                          "border-primary bg-primary/10 text-primary";
                      } else {
                        className +=
                          "border-border hover:border-primary hover:bg-accent";
                      }

                      return (
                        <div
                          key={oi}
                          className={className}
                          onClick={() => {
                            if (!quizSubmitted) {
                              setQuizAnswers((p) => ({ ...p, [qi]: oi }));
                            }
                          }}
                        >
                          {quizSubmitted &&
                            (isCorrect ? (
                              <CheckCircle2 className="w-4 h-4 shrink-0 text-green-500" />
                            ) : isSelected ? (
                              <XCircle className="w-4 h-4 shrink-0 text-red-500" />
                            ) : (
                              <div className="w-4 h-4" />
                            ))}
                          <span>{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                  {quizSubmitted && q.explanation && (
                    <p className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
                      💡 {q.explanation}
                    </p>
                  )}
                </div>
              ))}

              {!quizSubmitted ? (
                <Button
                  className="w-full"
                  onClick={() => setQuizSubmitted(true)}
                  disabled={Object.keys(quizAnswers).length < quiz.length}
                >
                  Nộp bài ({Object.keys(quizAnswers).length}/{quiz.length} câu)
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setQuizAnswers({});
                    setQuizSubmitted(false);
                  }}
                >
                  Làm lại
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
