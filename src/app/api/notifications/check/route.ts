import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Notification from "@/models/Notification";
import Task from "@/models/Task";
import { differenceInDays } from "date-fns";

// POST /api/notifications/check - Check for tasks needing notifications
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const now = new Date();
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(now.getDate() + 3);

    // Find tasks with upcoming deadlines
    const tasks = await Task.find({
      userId: session.user.id,
      status: { $ne: "completed" },
      deadline: { $gte: now, $lte: threeDaysFromNow },
    });

    const createdNotifications = [];

    for (const task of tasks) {
      const daysLeft = differenceInDays(new Date(task.deadline), now);

      // Check if notification already exists for this task today
      const existingNotification = await Notification.findOne({
        userId: session.user.id,
        taskId: task._id,
        read: false,
      });

      if (!existingNotification) {
        let message = "";
        if (daysLeft === 0) {
          message = `⏰ Task "${task.title}" đến hạn hôm nay!`;
        } else if (daysLeft === 1) {
          message = `⚠️ Task "${task.title}" sẽ đến hạn vào ngày mai!`;
        } else {
          message = `📅 Task "${task.title}" sẽ đến hạn trong ${daysLeft} ngày!`;
        }

        const notification = await Notification.create({
          userId: session.user.id,
          taskId: task._id,
          message,
          type:
            daysLeft === 0 || daysLeft === 1
              ? "task-overdue"
              : "deadline-warning",
        });

        createdNotifications.push(notification);
      }
    }

    return NextResponse.json({
      message: `Created ${createdNotifications.length} notification(s)`,
      notifications: createdNotifications,
    });
  } catch (error) {
    console.error("Check notifications error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
