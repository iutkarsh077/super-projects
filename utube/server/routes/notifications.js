import mongoose from "mongoose";
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireSameOrigin } from "../middleware/csrfOrigin.js";
import { requireWorkspace } from "../middleware/workspace.js";
import { Notification } from "../models/Notification.js";

export const notificationsRouter = Router();

notificationsRouter.use(requireAuth, requireWorkspace);

notificationsRouter.get("/", async (req, res) => {
  try {
    const notes = await Notification.find({
      userId: req.user._id,
      ownerUserId: req.workspace.owner._id,
    })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.json({
      notifications: notes.map((n) => ({
        id: String(n._id),
        type: n.type,
        title: n.title,
        notes: n.notes,
        submissionId: String(n.submissionId),
        readAt: n.readAt,
        createdAt: n.createdAt,
      })),
    });
  } catch (err) {
    console.error(err?.message || err);
    return res.status(500).json({ error: "Something went wrong.", code: "INTERNAL" });
  }
});

notificationsRouter.post("/read-all", requireSameOrigin, async (req, res) => {
  try {
    await Notification.updateMany(
      {
        userId: req.user._id,
        ownerUserId: req.workspace.owner._id,
        readAt: null,
      },
      { $set: { readAt: new Date() } },
    );
    return res.json({ ok: true });
  } catch (err) {
    console.error(err?.message || err);
    return res.status(500).json({ error: "Something went wrong.", code: "INTERNAL" });
  }
});

notificationsRouter.post("/:id/read", requireSameOrigin, async (req, res) => {
  try {
    const id = String(req.params.id || "");
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "Notification not found.", code: "NOT_FOUND" });
    }

    const updated = await Notification.findOneAndUpdate(
      {
        _id: id,
        userId: req.user._id,
        ownerUserId: req.workspace.owner._id,
      },
      { $set: { readAt: new Date() } },
      { new: true },
    );

    if (!updated) {
      return res.status(404).json({ error: "Notification not found.", code: "NOT_FOUND" });
    }

    return res.json({
      notification: {
        id: String(updated._id),
        type: updated.type,
        title: updated.title,
        notes: updated.notes,
        submissionId: String(updated.submissionId),
        readAt: updated.readAt,
        createdAt: updated.createdAt,
      },
    });
  } catch (err) {
    console.error(err?.message || err);
    return res.status(500).json({ error: "Something went wrong.", code: "INTERNAL" });
  }
});
