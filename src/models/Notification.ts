import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  taskId: mongoose.Types.ObjectId;
  message: string;
  type: "deadline-warning" | "task-overdue";
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  taskId: { type: Schema.Types.ObjectId, ref: "Task", required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ["deadline-warning", "task-overdue"],
    default: "deadline-warning",
  },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);
