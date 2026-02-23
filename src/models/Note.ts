import mongoose, { Schema, Document } from "mongoose";

export interface INote extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  content: string; // markdown text
  subject: string; // môn học
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema<INote>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    content: { type: String, default: "" },
    subject: { type: String, default: "" },
    tags: [{ type: String }],
  },
  { timestamps: true },
);

NoteSchema.index({ userId: 1, createdAt: -1 });
NoteSchema.index({ userId: 1, subject: 1 });

export default mongoose.models.Note ||
  mongoose.model<INote>("Note", NoteSchema);
