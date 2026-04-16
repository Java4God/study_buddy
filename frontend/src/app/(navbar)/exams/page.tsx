"use client";

import { useState } from "react";
import {
  MapPin,
  Trash2,
  Pencil,
  Plus,
  AlertTriangle,
  BookOpen,
} from "lucide-react";

//import { Badge } from "@/components/ui/badge";
import Button from "@/app/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/card";
import Input from "@/app/components/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/dialogs";

interface Exam {
  id: number;
  subject: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:MM"
  location?: string;
  notes?: string;
}

interface FormErrors {
  subject?: string;
  date?: string;
  time?: string;
}

function getDaysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [y, m, d] = dateStr.split("-").map(Number);
  const exam = new Date(y, m - 1, d);
  return Math.round((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(timeStr: string): string {
  const [h, min] = timeStr.split(":").map(Number);
  const period = h < 12 ? "AM" : "PM";
  const hour = h % 12 || 12;
  return `${hour}:${String(min).padStart(2, "0")} ${period}`;
}

function todayStr(): string {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
}

function getUrgencyBadge(daysUntil: number): {
  label: string;
  className: string;
} {
  if (daysUntil < 0)
    return {
      label: "Past",
      className: "bg-slate-100 text-slate-500 border-slate-200",
    };
  if (daysUntil === 0)
    return {
      label: "Today",
      className: "bg-red-50 text-red-700 border-red-100",
    };
  if (daysUntil <= 5)
    return {
      label: "Tomorrow",
      className: "bg-orange-50 text-orange-700 border-orange-100",
    };
  if (daysUntil <= 10)
    return {
      label: "Tomorrow",
      className: "bg-yellow-50 text-yellow-700 border-yellow-100",
    };
  return {
    label: `${daysUntil} days`,
    className: "bg-green-50 text-green-700 border-green-100",
  };
}

const INITIAL_EXAMS: Exam[] = [
  {
    id: 1,
    subject: "Calculus II",
    date: "2026-04-18",
    time: "09:00",
    location: "Room 204",
    notes: "Bring graphing calculator",
  },
  {
    id: 2,
    subject: "Organic Chemistry",
    date: "2026-04-21",
    time: "14:00",
    location: "Science Hall B",
    notes: "Chapters 8–12 focus",
  },
  {
    id: 3,
    subject: "Modern History",
    date: "2026-04-28",
    time: "10:30",
    location: "Auditorium A",
  },
  {
    id: 4,
    subject: "Linear Algebra",
    date: "2026-05-05",
    time: "13:00",
    location: "Math Building 301",
    notes: "Proofs and eigenvalues",
  },
  {
    id: 5,
    subject: "English Literature",
    date: "2026-04-10",
    time: "11:00",
    location: "Humanities 102",
    notes: "Past exam",
  },
  {
    id: 6,
    subject: "English Literature",
    date: "2026-04-10",
    time: "11:00",
    location: "Humanities 102",
    notes: "Past exam",
  },
];

const EMPTY_FORM = {
  subject: "",
  date: todayStr(),
  time: "09:00",
  location: "",
  notes: "",
};

type FilterType = "all" | "upcoming" | "week" | "past";

export default function ExamTracker() {
  const [exams, setExams] = useState<Exam[]>(INITIAL_EXAMS);
  const [nextId, setNextId] = useState(6);
  const [filter, setFilter] = useState<FilterType>("all");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const [examToDelete, setExamToDelete] = useState<number | null>(null);

  const sortedExams = [...exams].sort((a, b) => {
    const da = getDaysUntil(a.date);
    const db = getDaysUntil(b.date);
    if (da < 0 && db >= 0) return 1;
    if (db < 0 && da >= 0) return -1;
    if (da < 0 && db < 0) return db - da;
    return da - db;
  });

  const filteredExams = sortedExams.filter((e) => {
    const n = getDaysUntil(e.date);
    if (filter === "upcoming") return n >= 0;
    if (filter === "week") return n >= 0 && n <= 7;
    if (filter === "past") return n < 0;
    return true;
  });

  const upcomingExams = sortedExams.filter((e) => getDaysUntil(e.date) >= 0);
  const thisWeekCount = exams.filter((e) => {
    const n = getDaysUntil(e.date);
    return n >= 0 && n <= 7;
  }).length;

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setShowModal(true);
  }

  function openEdit(id: number) {
    const exam = exams.find((e) => e.id === id)!;
    setEditingId(id);
    setForm({
      subject: exam.subject,
      date: exam.date,
      time: exam.time,
      location: exam.location ?? "",
      notes: exam.notes ?? "",
    });
    setFormErrors({});
    setShowModal(true);
  }

  function validateForm(): boolean {
    const errors: FormErrors = {};
    if (!form.subject.trim()) errors.subject = "Subject is required";
    if (!form.date) errors.date = "Date is required";
    if (!form.time) errors.time = "Time is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSave() {
    if (!validateForm()) return;

    if (editingId !== null) {
      const updated: Exam = {
        id: editingId,
        subject: form.subject.trim(),
        date: form.date,
        time: form.time,
        location: form.location.trim() || undefined,
        notes: form.notes.trim() || undefined,
      };
      setExams((prev) => prev.map((e) => (e.id === editingId ? updated : e)));
      console.log("[UPDATE EXAM]", updated);
    } else {
      const created: Exam = {
        id: nextId,
        subject: form.subject.trim(),
        date: form.date,
        time: form.time,
        location: form.location.trim() || undefined,
        notes: form.notes.trim() || undefined,
      };
      setExams((prev) => [...prev, created]);
      setNextId((n) => n + 1);
      console.log("[CREATE EXAM]", created);
    }

    setShowModal(false);
  }

  function confirmDelete() {
    if (examToDelete === null) return;
    const exam = exams.find((e) => e.id === examToDelete);
    console.log("[DELETE EXAM]", exam);
    setExams((prev) => prev.filter((e) => e.id !== examToDelete));
    setExamToDelete(null);
  }

  function updateField(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  const FILTERS: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "upcoming", label: "Upcoming" },
    { key: "week", label: "This week" },
    { key: "past", label: "Past" },
  ];

  return (
    <div className="w-full bg-switch-background/20">
      <div className="space-y-6 w-full max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-gray-200 pb-6">
          <div>
            <h1 className="text-3xl font-semibold mb-2 text-slate-900">
              Exams
            </h1>
            <p className="text-sm text-slate-500 max-w-2xl">
              Track your upcoming exams, organize your study plan, and stay
              focused.
            </p>
          </div>
          <Button
            style={{
              gap: "0.5rem",
              boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.1)",
            }}
            className="!bg-black text-white hover:!bg-indigo-600 shadow-sm transition"
            onClick={openAdd}
          >
            <Plus className="size-4" />
            Add Exam
          </Button>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                filter === key
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          <div className="space-y-4">
            {filteredExams.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <BookOpen className="size-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No exams found for this filter.</p>
              </div>
            ) : (
              filteredExams.map((exam) => {
                const days = getDaysUntil(exam.date);
                const badge = getUrgencyBadge(days);
                return (
                  <Card
                    key={exam.id}
                    className="border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-200 bg-white"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                              <div className="flex-row flex gap-3 mb-3">
                                <h3 className="text-lg font-semibold text-slate-900 truncate">
                                  {exam.subject}
                                </h3>
                                <span
                                  className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-semibold ${badge.className}`}
                                >
                                  {badge.label}
                                </span>
                              </div>

                              <p className="text-sm text-slate-500 mt-1">
                                {formatDate(exam.date)} ·{" "}
                                {formatTime(exam.time)}
                              </p>
                            </div>
                          </div>

                          <div className="mt-5 space-y-3 text-sm text-slate-500">
                            {exam.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="size-4 shrink-0 text-slate-400" />
                                <span>{exam.location}</span>
                              </div>
                            )}
                            {exam.notes && (
                              <div className="rounded-2xl bg-slate-50 p-3 text-slate-600">
                                <p className="text-sm">{exam.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            className=" p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                            onClick={() => openEdit(exam.id)}
                          >
                            <Pencil className="size-4" color="green" />
                          </button>
                          <button
                            className=" p-2 text-slate-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => setExamToDelete(exam.id)}
                          >
                            <Trash2 className="size-4" color="red" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          <div className="space-y-4">
            <Card className="border border-gray-100 shadow-sm bg-white rounded-2xl p-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-0.5">Total exams</p>
                  <p className="text-3xl  text-gray-900">{exams.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-0.5">Next exam</p>
                  <p className="text-lg font-medium ">
                    {upcomingExams.length > 0
                      ? getDaysUntil(upcomingExams[0].date) + " days"
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-0.5">This week</p>
                  <p className="text-lg  text-gray-900">{thisWeekCount}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-100 shadow-sm bg-white rounded-2xl p-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                  Study Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-3 ">
                  <p className="font-bold text-blue-900 mb-1">Start Early</p>
                  <p className="text-gray-600 text-xs">
                    Begin studying at least 2 weeks before your exam
                  </p>
                </div>
                <div className="rounded-2xl border border-purple-200 bg-purple-100 p-4">
                  <p className="font-bold text-purple-900 mb-1">
                    Use Flashcards
                  </p>
                  <p className="text-gray-600 text-xs">
                    Create flashcard decks for key concepts
                  </p>
                </div>
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                  <p className="font-bold text-blue-900 mb-1">
                    Pomodoro Method
                  </p>
                  <p className="text-gray-600 text-xs">
                    Use focused 25-minute study sessions
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Dialog
          open={showModal}
          onOpenChange={(open) => {
            if (!open) setShowModal(false);
          }}
        >
          <DialogContent className="max-w-md bg-white">
            <DialogHeader>
              <DialogTitle>
                {editingId !== null ? "Edit Exam" : "Add New Exam"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label htmlFor="f-subject">
                  Subject <span className="text-red-500">*</span>
                </label>
                <Input
                  id="f-subject"
                  placeholder="e.g. Physics Final"
                  value={form.subject}
                  setValue={(value) => updateField("subject", value)}
                />
                {formErrors.subject && (
                  <p className="text-xs text-red-500">{formErrors.subject}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="f-date">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="f-date"
                    type="date"
                    value={form.date}
                    setValue={(value) => updateField("date", value)}
                  />
                  {formErrors.date && (
                    <p className="text-xs text-red-500">{formErrors.date}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="f-time">
                    Time <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="f-time"
                    type="time"
                    value={form.time}
                    setValue={(value) => updateField("time", value)}
                  />
                  {formErrors.time && (
                    <p className="text-xs text-red-500">{formErrors.time}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="f-location">
                  Location{" "}
                  <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                <Input
                  id="f-location"
                  placeholder="e.g. Room 301"
                  value={form.location}
                  setValue={(value) => updateField("location", value)}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="f-notes">
                  Notes{" "}
                  <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                <Input
                  id="f-notes"
                  placeholder="e.g. Bring a calculator"
                  value={form.notes}
                  setValue={(value) => updateField("notes", value)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={handleSave}
                >
                  {editingId !== null ? "Save Changes" : "Save Exam"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog
          open={examToDelete !== null}
          onOpenChange={(open: unknown) => {
            if (!open) setExamToDelete(null);
          }}
        >
          <DialogContent className="max-w-sm bg-white">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 bg-red-100 rounded-xl">
                  <AlertTriangle className="size-5 text-red-600" />
                </div>
                <DialogTitle>Delete Exam</DialogTitle>
              </div>
            </DialogHeader>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-medium text-gray-800">
                {exams.find((e) => e.id === examToDelete)?.subject}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setExamToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={confirmDelete}
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
