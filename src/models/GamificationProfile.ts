import mongoose, { Schema, Document } from "mongoose";

export interface IBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
}

export interface IWeeklyQuest {
  weekStart: Date;
  title: string;
  description: string;
  target: Record<string, number>;
  progress: Record<string, number>;
  completed: boolean;
  rewardBadge?: string;
}

export interface IGamificationProfile extends Document {
  userId: mongoose.Types.ObjectId;
  totalPoints: number;
  level: number;
  badges: IBadge[];
  weeklyQuest: IWeeklyQuest | null;
  updatedAt: Date;
}

const GamificationProfileSchema = new Schema<IGamificationProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    totalPoints: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    badges: [
      {
        id: String,
        name: String,
        description: String,
        icon: String,
        earnedAt: { type: Date, default: Date.now },
      },
    ],
    weeklyQuest: {
      weekStart: Date,
      title: String,
      description: String,
      target: { type: Map, of: Number },
      progress: { type: Map, of: Number },
      completed: { type: Boolean, default: false },
      rewardBadge: String,
    },
  },
  { timestamps: true },
);

export default mongoose.models.GamificationProfile ||
  mongoose.model<IGamificationProfile>(
    "GamificationProfile",
    GamificationProfileSchema,
  );
