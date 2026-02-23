import mongoose, { Schema, Document } from "mongoose";

export interface ICourse extends Document {
  userId: mongoose.Types.ObjectId;
  semester: string;
  courseName: string;
  grade: number;
  credits: number;
  gradeScale: "10" | "4";
  createdAt: Date;
}

const CourseSchema = new Schema<ICourse>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  semester: { type: String, required: true },
  courseName: { type: String, required: true },
  grade: { type: Number, required: true },
  credits: { type: Number, required: true },
  gradeScale: { type: String, enum: ["10", "4"], default: "10" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Course ||
  mongoose.model<ICourse>("Course", CourseSchema);
