import mongoose, { Schema, Document } from "mongoose";

export interface IWaterEntry {
  time: Date;
  amount: number; // ml
}

export interface IWaterLog extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date; // date only (midnight)
  entries: IWaterEntry[];
  totalMl: number;
  goalMl: number;
  createdAt: Date;
}

const WaterLogSchema = new Schema<IWaterLog>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  entries: [
    {
      time: { type: Date, default: Date.now },
      amount: { type: Number, required: true, min: 1 },
    },
  ],
  totalMl: { type: Number, default: 0 },
  goalMl: { type: Number, default: 2000 },
  createdAt: { type: Date, default: Date.now },
});

// One log per user per day
WaterLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.models.WaterLog ||
  mongoose.model<IWaterLog>("WaterLog", WaterLogSchema);
