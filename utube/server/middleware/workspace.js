import mongoose from "mongoose";
import { Membership } from "../models/Membership.js";
import { User } from "../models/User.js";
import { workspaceFromOwner } from "../lib/workspaces.js";

async function authorizeAgainstOwner(req, owner) {
  if (String(owner._id) === String(req.user._id)) {
    req.workspace = {
      ...workspaceFromOwner(owner, "owner"),
      owner,
    };
    return true;
  }

  const membership = await Membership.findOne({
    ownerUserId: owner._id,
    memberUserId: req.user._id,
    status: "active",
  });

  if (!membership) return false;

  req.workspace = {
    ...workspaceFromOwner(owner, membership.role),
    owner,
  };
  return true;
}

export async function requireWorkspace(req, res, next) {
  try {
    const headerId = req.get("x-channel-owner-id");

    if (headerId) {
      if (!mongoose.Types.ObjectId.isValid(headerId)) {
        return res.status(403).json({ error: "Invalid channel.", code: "FORBIDDEN" });
      }
      const owner = await User.findById(headerId);
      if (!owner) {
        return res.status(403).json({ error: "Invalid channel.", code: "FORBIDDEN" });
      }
      const ok = await authorizeAgainstOwner(req, owner);
      if (!ok) {
        return res.status(403).json({ error: "Not a member of this channel.", code: "FORBIDDEN" });
      }
      return next();
    }

    // Fallback: own channel (existing owner dashboard with no header)
    if (req.user.refreshTokenEnc || req.user.youtubeChannelId) {
      req.workspace = {
        ...workspaceFromOwner(req.user, "owner"),
        owner: req.user,
      };
      return next();
    }

    const membership = await Membership.findOne({
      memberUserId: req.user._id,
      status: "active",
    });
    if (!membership) {
      return res.status(403).json({
        error: "No channel workspace available.",
        code: "NO_WORKSPACE",
      });
    }

    const owner = await User.findById(membership.ownerUserId);
    if (!owner) {
      return res.status(403).json({
        error: "No channel workspace available.",
        code: "NO_WORKSPACE",
      });
    }

    req.workspace = {
      ...workspaceFromOwner(owner, membership.role),
      owner,
    };
    return next();
  } catch (err) {
    next(err);
  }
}

export function requireOwnerRole(req, res, next) {
  if (req.workspace?.role !== "owner") {
    return res.status(403).json({
      error: "Only the channel owner can do that.",
      code: "FORBIDDEN",
    });
  }
  return next();
}
