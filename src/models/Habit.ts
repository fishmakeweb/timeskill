import mongoose, { Schema, Document } from "mongoose";

export interface IHabit extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  exercise: number;
  water: number;
  sleep: number;
  calories: number;
  score: number;
  createdAt: Date;
}

const HabitSchema = new Schema<IHabit>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  exercise: { type: Number, default: 0 },
  water: { type: Number, default: 0 },
  sleep: { type: Number, default: 0 },
  calories: { type: Number, default: 0 },
  score: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

// Ensure one habit per user per day
HabitSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.models.Habit ||
  mongoose.model<IHabit>("Habit", HabitSchema);
