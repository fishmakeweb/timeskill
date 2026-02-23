// User types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  settings?: UserSettings;
}

export interface UserSettings {
  habitRules?: HabitRules;
}

// Habit types
export interface HabitRules {
  exercise: { weight: number; target: number };
  water: { weight: number; target: number };
  sleep: { weight: number; target: number };
  calories: { weight: number; min: number; max: number };
}

export interface Habit {
  id: string;
  userId: string;
  date: Date;
  exercise: number;
  water: number;
  sleep: number;
  calories: number;
  score: number;
  createdAt: Date;
}

// Task types
export type TaskStatus = "not-started" | "in-progress" | "completed";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  deadline: Date;
  createdAt: Date;
  completedAt?: Date;
}

// Course types
export type GradeScale = "10" | "4";

export interface Course {
  id: string;
  userId: string;
  semester: string;
  courseName: string;
  grade: number;
  credits: number;
  gradeScale: GradeScale;
  createdAt: Date;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  taskId: string;
  message: string;
  read: boolean;
  createdAt: Date;
}
