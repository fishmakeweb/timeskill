import mongoose, { Schema, Document } from "mongoose";

export interface IHabitRules {
  exercise: { weight: number; target: number };
  water: { weight: number; target: number };
  sleep: { weight: number; target: number };
  calories: { weight: number; min: number; max: number };
}

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  settings?: {
    habitRules?: IHabitRules;
  };
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  settings: {
    habitRules: {
      exercise: {
        weight: { type: Number, default: 20 },
        target: { type: Number, default: 1 },
      },
      water: {
        weight: { type: Number, default: 20 },
        target: { type: Number, default: 2 },
      },
      sleep: {
        weight: { type: Number, default: 30 },
        target: { type: Number, default: 7 },
      },
      calories: {
        weight: { type: Number, default: 30 },
        min: { type: Number, default: 2000 },
        max: { type: Number, default: 2500 },
      },
    },
  },
});

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
