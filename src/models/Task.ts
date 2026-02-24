import mongoose, { Schema, Document } from "mongoose";

export interface ISubTask {
  title: string;
  completed: boolean;
}

export interface ITask extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  status: "not-started" | "in-progress" | "completed" | "done";
  priority: "low" | "medium" | "high";
  deadline: Date | undefined;
  subtasks: ISubTask[];
  createdAt: Date;
  completedAt?: Date;
}

const SubTaskSchema = new Schema<ISubTask>({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const TaskSchema = new Schema<ITask>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  status: {
    type: String,
    enum: ["not-started", "in-progress", "completed", "done"],
    default: "not-started",
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  deadline: { type: Date, required: false },
  subtasks: { type: [SubTaskSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
});

export default mongoose.models.Task ||
  mongoose.model<ITask>("Task", TaskSchema);
