import { Membership } from "../models/Membership.js";
import { User } from "../models/User.js";

export function workspaceFromOwner(ownerUser, role = "owner") {
  const isOwner = role === "owner";
  return {
    ownerUserId: String(ownerUser._id),
    title: ownerUser.youtubeChannelTitle || ownerUser.email || "Channel",
    role,
    canDelete: isOwner,
    canManageTeam: isOwner,
  };
}

export async function listWorkspacesForUser(user) {
  const workspaces = [];

  if (user.refreshTokenEnc || user.youtubeChannelId) {
    workspaces.push(workspaceFromOwner(user, "owner"));
  }

  const memberships = await Membership.find({
    memberUserId: user._id,
    status: "active",
  }).lean();

  if (memberships.length) {
    const owners = await User.find({
      _id: { $in: memberships.map((m) => m.ownerUserId) },
    });
    const byId = new Map(owners.map((o) => [String(o._id), o]));
    for (const m of memberships) {
      const owner = byId.get(String(m.ownerUserId));
      if (!owner) continue;
      // Skip duplicate if user is somehow also listed as owner workspace
      if (workspaces.some((w) => w.ownerUserId === String(owner._id) && w.role === "owner")) {
        continue;
      }
      workspaces.push(workspaceFromOwner(owner, m.role));
    }
  }

  return workspaces;
}
