const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    githubMetaData: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pre", "InProgress", "Done"],
      default: "Pre",
      required: true,
    },
    score: {
      type: Number,
      default: 0,
      required: true,
    },
  },
  {
    collection: "Interview",
    timestamps: true,
  }
);

module.exports = mongoose.models.Interview || mongoose.model("Interview", interviewSchema);
