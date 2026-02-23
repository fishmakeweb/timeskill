import mongoose, { Schema, Document } from "mongoose";

export interface ISleepLog extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date; // the morning date (when they woke up)
  bedtime: Date; // when they went to bed
  wakeTime: Date; // when they woke up
  durationHours: number; // calculated
  quality: 1 | 2 | 3 | 4 | 5; // 1=very bad, 5=excellent
  notes: string;
  createdAt: Date;
}

const SleepLogSchema = new Schema<ISleepLog>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  bedtime: { type: Date, required: true },
  wakeTime: { type: Date, required: true },
  durationHours: { type: Number, default: 0 },
  quality: { type: Number, enum: [1, 2, 3, 4, 5], default: 3 },
  notes: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

SleepLogSchema.index({ userId: 1, date: -1 });

export default mongoose.models.SleepLog ||
  mongoose.model<ISleepLog>("SleepLog", SleepLogSchema);
