import { Task, TaskPriority } from "@/types";
import { differenceInDays } from "date-fns";

export function sortTasksByPriority(tasks: Task[]): Task[] {
  return tasks.sort((a, b) => {
    const now = new Date();
    const daysLeftA = differenceInDays(new Date(a.deadline), now);
    const daysLeftB = differenceInDays(new Date(b.deadline), now);

    // Urgent tasks (deadline <= 3 days) always come first
    const isUrgentA = daysLeftA <= 3;
    const isUrgentB = daysLeftB <= 3;

    if (isUrgentA && !isUrgentB) return -1;
    if (!isUrgentA && isUrgentB) return 1;

    // If both urgent or both not urgent, sort by priority
    const priorityOrder: Record<TaskPriority, number> = {
      high: 3,
      medium: 2,
      low: 1,
    };

    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;

    // Same priority, sort by deadline (earliest first)
    return daysLeftA - daysLeftB;
  });
}

export function getDeadlineText(deadline: Date): string {
  const now = new Date();
  const daysLeft = differenceInDays(new Date(deadline), now);

  if (daysLeft < 0) {
    return `Quá hạn ${Math.abs(daysLeft)} ngày`;
  } else if (daysLeft === 0) {
    return "Hôm nay!";
  } else if (daysLeft === 1) {
    return "Ngày mai";
  } else if (daysLeft <= 3) {
    return `${daysLeft} ngày nữa`;
  } else if (daysLeft <= 7) {
    return `${daysLeft} ngày nữa`;
  } else {
    return `${daysLeft} ngày nữa`;
  }
}

export function isTaskUrgent(deadline: Date): boolean {
  const now = new Date();
  const daysLeft = differenceInDays(new Date(deadline), now);
  return daysLeft <= 3 && daysLeft >= 0;
}
