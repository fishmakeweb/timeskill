import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Notification from "@/models/Notification";

// PATCH /api/notifications/[id]/read - Mark notification as read
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: { read: true } },
      { new: true },
    );

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(notification);
  } catch (error) {
    console.error("Mark notification as read error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/notifications/[id] - Delete notification
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const notification = await Notification.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "Notification deleted" });
  } catch (error) {
    console.error("Delete notification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
