import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

// SESSION SCHEMA for Phase 5A
const sessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    learningMode: {
      type: String,
      enum: ['Learn', 'Explore', 'Create', 'Assess'],
      required: true,
    },
    messageCount: {
      type: Number,
      default: 0,
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    metadata: {
      deviceInfo: {
        userAgent: String,
        platform: String,
        language: String,
      },
      performance: {
        initTime: Number,
        avgResponseTime: Number,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Create compound index for efficient queries
sessionSchema.index({ userId: 1, isActive: 1 });
sessionSchema.index({ userId: 1, startTime: -1 });

// Add plugin that converts mongoose to json
sessionSchema.plugin(toJSON);

export default mongoose.models.ls_chat_sessions || mongoose.model("ls_chat_sessions", sessionSchema);
