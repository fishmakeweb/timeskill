import mongoose, { Schema, Document } from "mongoose";

export type EventColor = "purple" | "blue" | "green" | "orange" | "red";

export interface ICalendarEvent extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  color: EventColor; // purple=study, blue=personal, green=rest, orange=work, red=urgent
  isAllDay: boolean;
  reminder: number | null; // minutes before
  createdAt: Date;
}

const CalendarEventSchema = new Schema<ICalendarEvent>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  color: {
    type: String,
    enum: ["purple", "blue", "green", "orange", "red"],
    default: "purple",
  },
  isAllDay: { type: Boolean, default: false },
  reminder: { type: Number, default: null },
  createdAt: { type: Date, default: Date.now },
});

CalendarEventSchema.index({ userId: 1, startTime: 1 });

export default mongoose.models.CalendarEvent ||
  mongoose.model<ICalendarEvent>("CalendarEvent", CalendarEventSchema);
