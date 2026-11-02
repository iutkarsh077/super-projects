# Utube — full project documentation

Utube is a **YouTube channel operations app**, not a YouTube clone. Draft videos are staged in **private AWS S3** for owner review, then published to YouTube. After publish or reject, the S3 object is deleted. Live videos stay on YouTube. This app is a control panel: people sign in with Google, then list, edit, submit for review, and (owners only) publish, reject, or delete videos on a real YouTube channel.

There are two kinds of people:

1. **Channel owner** — connects their Google account **with YouTube permission**. The server keeps an encrypted YouTube refresh token for that person. All YouTube API work for that channel uses this token.
2. **Staff** (video editor or content writer) — invited by email. They sign in with Google **without** YouTube permission. They never receive the owner’s YouTube token. The server still talks to YouTube as the owner. Removing them from the team immediately cuts off access **in this app**. It does not change YouTube Studio permissions.

In v1, editor and writer can list, edit, and **submit** videos for review. Only the owner can publish to YouTube, reject with remake notes, delete live videos, or manage the team. Roles are stored so they can be split later.

---

## 1. What the product does, end to end

### Owner journey

1. Open `http://localhost:3000`.
2. Click **Continue with Google**.
3. Google asks for profile plus YouTube scopes (`youtube.force-ssl` and `youtube.upload`).
4. After consent, the Express API stores the user in MongoDB, encrypts the refresh token, and sets an httpOnly session cookie.
5. The dashboard loads the owner’s uploads playlist from YouTube.
6. The owner can:
   - Submit a video for review (mp4 / mov / webm / mkv, max 256MB, staged in S3; default privacy **private**).
   - Preview in-app, then **Upload to YouTube** or **Request remake** (with notes).
   - Edit title and description on live YouTube videos (title 1–100 chars, description up to 5000).
   - Delete a live video (confirm dialog; permanently deletes on YouTube).
   - Invite staff by email and role. If SMTP is not configured, a copyable invite URL is shown.

### Staff journey

1. Owner copies or emails `http://localhost:3000/invite/<token>`.
2. Staff open the link. The API validates the hashed token, sets a short-lived `invite_token` cookie, then sends them to Google with **profile scopes only**.
3. After Google login, `/invite/complete` accepts the invite **only if** the Google account email matches the invited email.
4. Staff land on the same dashboard. They see the channel name and their role. They can list, edit, submit for review, and preview pending videos. They do **not** see Delete, Team, or publish/reject actions.

### What is never stored long-term

- Draft video files only exist in private S3 while `pending_review` (deleted after YouTube publish or reject). Recommend a 7-day lifecycle rule on the `reviews/` prefix for abandoned uploads.
- Google access tokens (fetched in memory when needed).
- Invite tokens in plaintext (only SHA-256 hashes in MongoDB).
- Refresh tokens in API JSON or the browser.

---

## 2. System architecture

```
┌─────────────────┐     cookie sid      ┌──────────────────────┐
│  Next.js :3000  │  credentials:include │  Express API :4000   │
│  client         │ ──────────────────► │                      │
│                 │  X-Channel-Owner-Id │  Helmet, CORS,       │
│  page.js        │                     │  rate limits, JWT    │
│  invite pages   │                     │                      │
└─────────────────┘                     │  ┌────────┐  ┌─────┐ │
                                        │  │ MongoDB│  │Google│
                                        │  │ Users  │  │OAuth │
                                        │  │ Members│  │YouTube│
                                        │  └────────┘  └─────┘ │
                                        └──────────────────────┘
```

| Layer | Location | Responsibility |
| --- | --- | --- |
| UI | `client/` Next.js 16 App Router + Tailwind | Login, dashboard, team, invite accept |
| API | `server/` Express 5 (`"type": "module"`) | OAuth, session, RBAC, YouTube proxy |
| DB | MongoDB via Mongoose | Users, memberships, review submissions, notifications |
| S3 | Private AWS bucket | Draft video staging (presigned PUT/GET) |
| Google | OAuth 2.0 + YouTube Data API v3 | Identity and live videos |

The browser **never** calls YouTube or Google token endpoints. Draft files are uploaded **directly to S3** with a short-lived presigned URL (no session cookies). Everything else talks to `http://localhost:4000`.

Ports are fixed by env:

- Client origin: `JAVASCRIPT_ORIGIN` = `http://localhost:3000`
- API and OAuth callback: `REDIRECT_URI` = `http://localhost:4000/auth/google/callback`

---

## 3. Repository layout

```
utube/
  README.md
  client/
    .env                      NEXT_PUBLIC_API_URL=http://localhost:4000
    src/app/layout.js         Root layout, title "Utube"
    src/app/page.js           Login + authenticated dashboard
    src/app/invite/[token]/page.js    Start invite accept
    src/app/invite/complete/page.js   Finish invite after Google
    src/lib/api.js            fetch wrapper (cookies + workspace header)
  server/
    .env                      Secrets (never commit)
    .env.example              Placeholders
    index.js                  App bootstrap
    db.js                     mongoose.connect(DATABASE_URL)
    config/env.js             Required env, fail-fast
    models/User.js
    models/Membership.js
    models/VideoSubmission.js Draft review queue
    models/Notification.js    In-app remake notes
    middleware/auth.js        JWT cookie → req.user
    middleware/csrfOrigin.js  Origin allowlist
    middleware/workspace.js   Channel RBAC
    middleware/error.js       Fallback 500
    routes/auth.js
    routes/youtube.js         List / edit / delete (+ retired upload 410)
    routes/reviews.js         S3 submit, preview, publish, reject
    routes/notifications.js   Remake notes
    routes/team.js
    lib/google.js             OAuth client, PKCE, YouTube client
    lib/s3.js                 Presign PUT/GET, Head, stream, delete
    lib/crypto.js             AES-256-GCM for refresh tokens
    lib/cookies.js            Cookie names and flags
    lib/workspaces.js         Build workspace list for /api/me
    lib/youtubeErrors.js      Map Google errors to safe JSON
    lib/mail.js               Optional nodemailer
```

---

## 4. Environment variables

### `server/.env` (required unless noted)

| Variable | Meaning |
| --- | --- |
| `DATABASE_URL` | MongoDB connection string |
| `GOOGLE_CLIENT_ID` | OAuth web client ID |
| `GOOGLE_CLIENT_SECRET` | OAuth web client secret (server only) |
| `REDIRECT_URI` | Must be `http://localhost:4000/auth/google/callback` and match Google Cloud |
| `JAVASCRIPT_ORIGIN` | Browser origin, `http://localhost:3000`. Used for CORS and CSRF Origin checks |
| `JWT_SECRET` | HMAC secret for the session JWT |
| `TOKEN_ENCRYPTION_KEY` | 32-byte key as 64 hex chars (preferred) or any string hashed with SHA-256 |
| `PORT` | Optional, default `4000` |
| `MONGODB_DNS_SERVERS` | Optional comma-separated DNS (helps Atlas SRV lookup) |
| `SMTP_URL` | Optional nodemailer URL. If missing, invites return a copyable link |
| `SMTP_FROM` | Optional From address |
| `AWS_REGION` | Optional. Required for review submit/publish (e.g. `ap-south-1`) |
| `AWS_S3_BUCKET` | Optional. Private bucket for draft videos |
| `AWS_ACCESS_KEY_ID` | Optional. IAM user/key with Put/Get/Delete/Head on `reviews/*` |
| `AWS_SECRET_ACCESS_KEY` | Optional. Pair for the access key |
| `NODE_ENV` | `production` sets cookie `Secure` |

The process **refuses to start** if a required var is empty (`server/config/env.js`). AWS vars are **optional at boot**: list/edit/delete/team still work without them; review create returns `503 S3_NOT_CONFIGURED`.

### `client/.env`

| Variable | Meaning |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` |

Do not put Google client secret in the client. Homepage login is a full-page redirect to the API, not Google Identity Services in the browser.

---

## 5. Data in MongoDB

### 5.1 Collection `users`

Created from `server/models/User.js`.

| Field | Type | Notes |
| --- | --- | --- |
| `googleId` | string, unique | Google subject |
| `email` | string | Login email; invite accept compares this (lowercase) |
| `name`, `picture` | string | Profile |
| `youtubeChannelId` | string | Empty for staff |
| `youtubeChannelTitle` | string | Shown in UI |
| `uploadsPlaylistId` | string | YouTube “uploads” playlist used to list videos |
| `refreshTokenEnc` | string | `iv:tag:ciphertext` hex; empty for staff |
| `createdAt`, `updatedAt` | dates | Mongoose timestamps |

**Public JSON** (`toPublicJSON`) never includes tokens:

```json
{
  "id": "...",
  "email": "...",
  "name": "...",
  "picture": "...",
  "youtubeChannelId": "...",
  "youtubeChannelTitle": "...",
  "hasYouTubeChannel": true
}
```

### 5.2 Collection `memberships`

Created from `server/models/Membership.js`. Unique index: `(ownerUserId, email)`.

| Field | Type | Notes |
| --- | --- | --- |
| `ownerUserId` | ObjectId → User | Channel owner |
| `memberUserId` | ObjectId or null | Set on accept |
| `email` | string, lowercase | Invited Gmail |
| `role` | `video_editor` \| `content_writer` | |
| `status` | `pending` \| `active` | |
| `inviteTokenHash` | SHA-256 hex | Cleared after accept |
| `expiresAt` | date | 7 days from invite; null after accept |

The owner is **not** stored as a membership. Ownership = “this user has `refreshTokenEnc` / a YouTube channel.”

### 5.3 Workspace object (not a collection)

Built in memory for `/api/me`:

```json
{
  "ownerUserId": "<mongo user id of the channel owner>",
  "title": "Channel title or owner email",
  "role": "owner | video_editor | content_writer",
  "canDelete": true,
  "canManageTeam": true
}
```

`canDelete` and `canManageTeam` are true only for `role === "owner"`.

---

## 6. Authentication in detail

### 6.1 Session

- Cookie name: `sid`
- Value: JWT `{ sub: userId }`, algorithm **HS256**, expiry **7 days**
- Flags: `httpOnly`, `sameSite=lax`, `path=/`, `secure` only when `NODE_ENV=production`
- Middleware `requireAuth` reads the cookie, verifies JWT, loads User, sets `req.user`
- Missing/invalid cookie → `401 { code: "UNAUTHENTICATED" }`

The JWT does **not** contain Google tokens, email, or role. Role is loaded from DB on each request.

### 6.2 OAuth cookies (10 minutes)

| Cookie | Purpose |
| --- | --- |
| `oauth_state` | CSRF `state` compared on callback |
| `pkce_verifier` | PKCE S256 verifier for the code exchange |
| `oauth_intent` | `youtube` (default) or `member` |

### 6.3 Owner login — `GET /auth/google`

Used by the homepage **Continue with Google** button.

1. Generate random `state` (32 bytes hex) and PKCE verifier/challenge.
2. Set the three OAuth cookies.
3. Redirect to Google with:
   - `access_type=offline` (so Google can issue a refresh token)
   - `include_granted_scopes=true`
   - scopes: `openid email profile` + `youtube.force-ssl` + `youtube.upload`
   - `prompt=select_account`, or `prompt=consent` when `?force=1`

`force=1` is how an owner reconnects after Google revokes access (`REAUTH_REQUIRED`).

If the request `Accept` header includes `application/json`, the API returns `{ url }` instead of redirecting.

### 6.4 Owner callback — `GET /auth/google/callback`

1. If Google sent `error`, redirect to `http://localhost:3000/?authError=denied|failed`.
2. Require `code`, matching `state` cookie, and PKCE verifier. Mismatch → `authError=failed`.
3. Exchange code with `codeVerifier`.
4. Load Google userinfo (`id` + `email` required).
5. If this is **not** a member intent:
   - If Google did not return a refresh token **and** the user has none stored → redirect to `/auth/google?force=1` to force consent.
   - Encrypt a new refresh token if Google sent one; otherwise keep the stored one.
   - Call `youtube.channels.list({ mine: true, part: snippet,contentDetails })`.
   - Save channel id, title, uploads playlist id (or leave empty if they have no channel).
   - Upsert User.
   - Clear OAuth cookies, set `sid`, redirect to `/`.

### 6.5 Staff / invite login — `GET /auth/google?intent=member`

Same PKCE/`state` machinery, but:

- Scopes: `openid email profile` only
- `access_type=online` (no refresh token needed)
- Callback **does not overwrite** existing YouTube token fields
- After `sid` is set: if `invite_token` cookie exists, redirect to `/invite/complete`; else `/`

This is why homepage login is **not** profile-only: changing that would break owner YouTube connect.

### 6.6 Logout — `POST /auth/logout`

- Requires `Origin: http://localhost:3000`
- Best-effort `revokeToken` on the owner refresh token
- Clears `sid` and `invite_token`

### 6.7 CSRF on mutations

`requireSameOrigin` allows the request only if `Origin` equals `JAVASCRIPT_ORIGIN`. Localhost ports are same-site, so `SameSite=Lax` is not enough by itself. Applied to logout, invite, accept, patch, delete, upload.

---

## 7. Workspace resolution (how the API picks a channel)

Middleware: `requireWorkspace` (`server/middleware/workspace.js`).

Every YouTube and most team routes need a **workspace**: `{ owner, role }`. YouTube is always called with `owner.refreshTokenEnc`.

### If header `X-Channel-Owner-Id` is present

1. Validate it as a Mongo ObjectId.
2. Load that User as the channel owner.
3. Allow if `req.user._id` is that owner **or** there is an **active** membership for this member on that owner.
4. Otherwise `403 FORBIDDEN`. **No fallback** — prevents IDOR (staff cannot pass some other user’s id).

### If header is absent (owner dashboard as originally built)

1. If the signed-in user has `refreshTokenEnc` or `youtubeChannelId` → they are owner of **their** channel. This keeps list/edit/upload working without any new header.
2. Else use their **single** active membership.
3. Else `403 NO_WORKSPACE`.

The client (`src/lib/api.js`) stores `activeOwnerId` in memory and sends the header on later calls. First `/api/me` does not need it.

---

## 8. YouTube data flow in detail

All routes under `/api/youtube` run `requireAuth` then `requireWorkspace`. Client: `youtubeFor(req.workspace.owner)`.

### 8.1 List — `GET /api/youtube/videos?pageToken=`

1. If owner has no `uploadsPlaylistId` → `{ videos: [], needsChannel: true }`.
2. `playlistItems.list` on the uploads playlist, 12 at a time, optional `pageToken`.
3. Collect video ids, then `videos.list` for snippet, status, contentDetails.
4. Response:

```json
{
  "videos": [
    {
      "id": "xxxxxxxxxxx",
      "title": "...",
      "description": "...",
      "thumbnail": "https://...",
      "privacyStatus": "private",
      "publishedAt": "..."
    }
  ],
  "nextPageToken": "...",
  "needsChannel": false
}
```

### 8.2 Edit — `PATCH /api/youtube/videos/:id`

- Origin check.
- Video id must match `/^[a-zA-Z0-9_-]{11}$/`.
- Title required, 1–100 chars. Description max 5000. Optional privacy `private|unlisted|public`.
- Load existing video (need `categoryId` and other snippet fields or YouTube rejects update).
- `videos.update` with merged snippet + status.
- Staff **are** allowed.

### 8.3 Delete — `DELETE /api/youtube/videos/:id`

- Origin check + `requireOwnerRole`.
- Staff get `403 { code: "FORBIDDEN" }` even if they craft the request.
- `youtube.videos.delete` — permanent on YouTube.

### 8.4 Review queue (S3 → owner → YouTube)

Direct YouTube upload is retired. `POST /api/youtube/upload` returns `410 REVIEW_REQUIRED`.

**Submit**

1. `POST /api/reviews` (Origin, workspace, 10/hour) with `{ title, description, privacyStatus, contentType, fileName }`.
2. Server creates a `VideoSubmission` (`awaiting_file`), builds key `reviews/{ownerId}/{submissionId}/{safeName}`, returns a **presigned PUT**.
3. Browser `PUT`s the file to S3 with `credentials: "omit"` and locked `Content-Type`.
4. `POST /api/reviews/:id/complete` (uploader only) runs `HeadObject` (exists, MIME, ≤256MB) then sets `pending_review`.

**Preview**

- `GET /api/reviews` — team sees pending items; uploader also sees own rejected rows with notes.
- `GET /api/reviews/:id/playback` — short-lived presigned GET for in-app `<video>`.

**Publish (owner only)**

- Atomic `pending_review` → `publishing`.
- Stream S3 `GetObject` into `youtube.videos.insert` (same metadata rules as before, including `selfDeclaredMadeForKids: false`).
- On success: `published`, delete S3 object, return `{ video }` in the same shape as the old upload response.
- On YouTube failure: revert to `pending_review`, **keep** S3 for retry.

**Reject (owner only)**

- `POST /api/reviews/:id/reject` with required `notes`.
- Sets `rejected`, deletes S3, creates an in-app `Notification` for the uploader (no email).

**S3 bucket checklist**

- Block Public Access on; no public ACLs.
- CORS: allow `JAVASCRIPT_ORIGIN` for `GET, PUT, HEAD`; expose `ETag`.
- IAM: `s3:PutObject`, `GetObject`, `DeleteObject`, `HeadObject` on `reviews/*`.
- Lifecycle: expire `reviews/` after ~7 days (abandoned `awaiting_file`).

### 8.5 Google error mapping

`mapGoogleError(err, { asStaff })`:

| Situation | Owner sees | Staff sees |
| --- | --- | --- |
| `invalid_grant` / 401 | `401 REAUTH_REQUIRED` → client redirects to `/auth/google?force=1` | `403 OWNER_REAUTH_REQUIRED` (no redirect to owner OAuth) |
| 403 quota | `YOUTUBE_FORBIDDEN` | same |
| 400 | `YOUTUBE_BAD_REQUEST` | same |
| other | `502 YOUTUBE_UPSTREAM` | same |

Raw Google payloads are not sent to the browser.

---

## 9. Team / invite data flow in detail

### 9.1 Create invite — `POST /api/team/invites`

Body: `{ "email": "person@gmail.com", "role": "video_editor" | "content_writer" }`

Rules:

- Owner only (`requireOwnerRole`).
- Valid email, not the owner’s own email.
- If that email is already **active** on this channel → `409 ALREADY_MEMBER`.
- If pending, rotate the token (resend).
- Generate 32-byte base64url token, store **SHA-256 hash**, expiry 7 days, `memberUserId: null`, `status: pending`.
- Invite URL: `${JAVASCRIPT_ORIGIN}/invite/${rawToken}`.
- Try SMTP. If unconfigured or send fails: `emailed: false` and `inviteUrl` in the JSON so the owner can copy it. Active-member 409 does **not** reveal whether the email exists as a User globally.

### 9.2 Prepare — `GET /api/team/invites/prepare/:token`

No session required (staff may not be logged in yet).

- Token shape check.
- Lookup pending membership by hash; must not be expired.
- Set httpOnly `invite_token` cookie (15 minutes) so the token survives the Google redirect without staying in the URL after login.
- Returns `{ ok, email, role }`.

### 9.3 Accept — `POST /api/team/invites/accept`

Requires session + Origin.

- Token from JSON body or `invite_token` cookie.
- Pending + unexpired.
- `req.user.email` (lowercase) must equal membership email → else `403 EMAIL_MISMATCH` and the invite stays unused.
- Set `status: active`, `memberUserId`, clear hash and expiry.
- Clear invite cookie.

### 9.4 List / remove

- `GET /api/team` — owner only; pending and active rows.
- `DELETE /api/team/members/:id` — owner only; deletes the membership. Next staff YouTube call fails workspace checks. Does not revoke Google login, only channel access.

### 9.5 Full invite sequence

```
Owner UI
  POST /api/team/invites
Staff browser
  GET /invite/<token>
  GET /api/team/invites/prepare/<token>     → invite_token cookie
  GET /auth/google?intent=member            → Google profile OAuth
  GET /auth/google/callback                 → sid cookie, redirect /invite/complete
  POST /api/team/invites/accept             → membership active
  GET /api/me                               → workspaces includes this channel
  GET /api/youtube/videos                   → YouTube via owner's token
```

---

## 10. Client behavior in detail

### 10.1 `src/lib/api.js`

- Base URL: `NEXT_PUBLIC_API_URL`.
- Always `credentials: "include"` so `sid` is sent (cross-port on localhost is still `http://localhost`, so the cookie set by :4000 is sent to :4000).
- JSON `Content-Type` unless body is `FormData`.
- Injects `X-Channel-Owner-Id` when a workspace was selected.
- `401 REAUTH_REQUIRED` → navigate to `/auth/google?force=1` (owner reconnect).
- `OWNER_REAUTH_REQUIRED` → throw a message; **does not** start owner OAuth as the staff user.

### 10.2 Home page (`src/app/page.js`)

Unauthenticated: marketing copy + Continue with Google (`googleLoginUrl()` with YouTube scopes). Reads `?authError=`.

Authenticated with no workspace: message + **Connect YouTube** (`force=1`).

Authenticated with workspace:

- Header: avatar, name, channel title, role badge, logout.
- Workspace `<select>` if more than one workspace (own channel plus memberships).
- Team panel if `canManageTeam`.
- Upload form.
- Video grid: Edit for everyone; Delete if `canDelete` (confirm: “Delete this video from YouTube permanently?”).
- Pagination via `nextPageToken`.

### 10.3 Invite pages

`/invite/[token]`: prepare → if already logged in, accept immediately; else redirect to member Google login.

`/invite/complete`: POST accept using the cookie, then go home. Shows email-mismatch errors.

---

## 11. HTTP API reference

Unless noted, JSON in/out. Session = cookie `sid`.

| Method | Path | Guards | Body / query | Success |
| --- | --- | --- | --- | --- |
| GET | `/health` | none | | `{ ok: true }` |
| GET | `/auth/google` | none | `force=1`, `intent=member` | 302 Google |
| GET | `/auth/google/callback` | state+PKCE | `code`, `state` | 302 client |
| GET | `/auth/me` | session | | `{ user, workspaces }` |
| POST | `/auth/logout` | Origin | | `{ ok: true }` |
| GET | `/api/me` | session | | `{ user, workspaces }` |
| GET | `/api/youtube/videos` | session, workspace | `pageToken` | video list |
| PATCH | `/api/youtube/videos/:id` | session, workspace, Origin | `{ title, description, privacyStatus? }` | `{ video }` |
| DELETE | `/api/youtube/videos/:id` | **owner**, Origin | | `{ ok, id }` |
| POST | `/api/youtube/upload` | session, workspace, Origin | | **410** `REVIEW_REQUIRED` |
| POST | `/api/reviews` | session, workspace, Origin | `{ title, description, privacyStatus, contentType, fileName }` | 201 `{ id, uploadUrl }` |
| POST | `/api/reviews/:id/complete` | uploader, Origin | | `{ submission }` |
| GET | `/api/reviews` | session, workspace | | `{ pending, rejected }` |
| GET | `/api/reviews/:id/playback` | session, workspace | | `{ playbackUrl, expiresIn }` |
| POST | `/api/reviews/:id/publish` | **owner**, Origin | | 201 `{ video }` |
| POST | `/api/reviews/:id/reject` | **owner**, Origin | `{ notes }` | `{ submission }` |
| GET | `/api/notifications` | session, workspace | | `{ notifications }` |
| POST | `/api/notifications/:id/read` | recipient, Origin | | `{ notification }` |
| POST | `/api/notifications/read-all` | session, Origin | | `{ ok: true }` |
| GET | `/api/team` | owner | | `{ members: [...] }` |
| POST | `/api/team/invites` | owner, Origin | `{ email, role }` | 201 member + optional `inviteUrl` |
| DELETE | `/api/team/members/:id` | owner, Origin | | `{ ok: true }` |
| GET | `/api/team/invites/prepare/:token` | none | | `{ ok, email, role }` |
| POST | `/api/team/invites/accept` | session, Origin | `{ token? }` or cookie | `{ ok, ownerUserId, role }` |

### Error codes

| Code | HTTP | When |
| --- | --- | --- |
| `UNAUTHENTICATED` | 401 | No/invalid session |
| `REAUTH_REQUIRED` | 401 | Owner YouTube grant dead |
| `OWNER_REAUTH_REQUIRED` | 403 | Staff YouTube call, owner grant dead |
| `CSRF_ORIGIN` | 403 | Wrong or missing Origin |
| `FORBIDDEN` | 403 | Not owner / not member / invalid channel header |
| `NO_WORKSPACE` | 403 | Signed in but no channel and no membership |
| `EMAIL_MISMATCH` | 403 | Google email ≠ invite email |
| `INVALID_INVITE` | 400 | Bad token shape |
| `INVITE_EXPIRED` | 410 | Unknown, used, or expired invite |
| `INVALID_EMAIL` / `INVALID_ROLE` | 400 | Invite validation |
| `ALREADY_MEMBER` | 409 | Email already active on channel |
| `INVALID_VIDEO_ID` / `INVALID_TITLE` / `INVALID_DESCRIPTION` / `INVALID_PRIVACY` | 400 | Edit/delete validation |
| `MISSING_FILE` / `INVALID_FILE` / `FILE_TOO_LARGE` | 400 | Review file checks |
| `INVALID_NOTES` | 400 | Reject without notes |
| `INVALID_STATUS` | 409 | Wrong submission state / concurrent publish |
| `REVIEW_REQUIRED` | 410 | Old direct YouTube upload path |
| `S3_NOT_CONFIGURED` | 503 | AWS env missing for review actions |
| `NOT_FOUND` | 404 | Video, submission, or member |
| `YOUTUBE_*` | 400/403/502 | Upstream YouTube |
| `INTERNAL` | 500 | Unexpected |

### Rate limits

| Scope | Limit |
| --- | --- |
| `/auth/*` | 20 / minute |
| most `/api/*` | 60 / minute |
| `POST /api/reviews` (create) | 10 / hour |
| `/api/team/invites` | 30 / hour |

---

## 12. Permissions matrix

| Action | Owner | Video editor | Content writer |
| --- | --- | --- | --- |
| Sign in with Google | Yes (YouTube scopes) | Yes (profile via invite) | Yes (profile via invite) |
| List live YouTube videos | Yes | Yes | Yes |
| Edit live metadata | Yes | Yes | Yes |
| Submit for review (S3) | Yes | Yes | Yes |
| Preview pending in-app | Yes | Yes | Yes |
| Publish to YouTube | **Yes** | No | No |
| Reject with remake notes | **Yes** | No | No |
| Delete live video | **Yes** | No (API 403) | No (API 403) |
| Invite / remove staff | **Yes** | No | No |
| See Team panel | **Yes** | No | No |

UI hiding is not security. Publish, reject, delete, and team routes check `requireOwnerRole` on the server.

---

## 13. Security summary

- Authorization code + PKCE S256 + `state` cookie.
- Refresh tokens encrypted at rest (AES-256-GCM).
- Tokens never in JWT, localStorage, or `/api/me`.
- Staff YouTube calls use the owner token only after membership check.
- Invite tokens hashed, 7-day expiry, single-use, email-bound.
- Origin CSRF on POST/PATCH/DELETE.
- Helmet, CORS allowlist, cookie httpOnly.
- Draft videos in a private S3 bucket; short-lived presigned URLs; MIME/size checks on complete.
- S3 object deleted after successful YouTube publish or reject.
- Least privilege: member OAuth does not request YouTube scopes.

---

## 14. Google Cloud setup (required for login)

Same project as the OAuth client:

1. Enable **YouTube Data API v3**.
2. OAuth consent scopes:
   - `openid`
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `https://www.googleapis.com/auth/youtube.force-ssl`
   - `https://www.googleapis.com/auth/youtube.upload`
3. Authorized redirect: `http://localhost:4000/auth/google/callback`
4. Authorized JS origin: `http://localhost:3000`
5. Publishing **Testing**: add **every** Google account (owner and each staff member) as a **test user**. Otherwise Google shows `403: access_denied` / “has not completed verification”.
6. You do **not** need Google app verification to test with listed test users.

---

## 15. How to run

Terminal 1 — API:

```bash
cd server
npm install
npm run dev
```

Expect: `API listening on http://localhost:4000`

Terminal 2 — UI:

```bash
cd client
npm install
npm run dev
```

Expect: `http://localhost:3000`

Fill `server/.env` from `.env.example`. Generate `TOKEN_ENCRYPTION_KEY` as 64 hex chars (32 random bytes). Changing it later makes existing encrypted refresh tokens unreadable (owners must sign in with `force=1` again).

Optional SMTP: set `SMTP_URL` (for example a provider SMTP URL). If unset, the Team panel shows **Copy invite link**.

---

## 16. Request tracing examples

### Owner lists videos (no invite involved)

```
GET /api/me                         → { user, workspaces: [{ role: "owner", ... }] }
GET /api/youtube/videos             → requireWorkspace fallback to req.user
                                      decrypt refresh token
                                      playlistItems.list + videos.list
```

### Staff submits for review after invite

```
POST /api/reviews
  Cookie: sid=...
  Header: X-Channel-Owner-Id=<owner mongo id>
  Body: { title, description, privacyStatus, contentType, fileName }
→ create VideoSubmission + presigned PUT
→ browser PUT file to S3 (no cookies)
POST /api/reviews/:id/complete
→ HeadObject + status pending_review
```

Owner later:

```
POST /api/reviews/:id/publish   → S3 stream → videos.insert → delete S3
POST /api/reviews/:id/reject    → notes + delete S3 + in-app notification
```

### Owner deletes (staff cannot)

```
DELETE /api/youtube/videos/dQw4w9WgXcQ
  Origin: http://localhost:3000
→ requireOwnerRole
→ videos.delete
```

Staff sending the same request: `403 FORBIDDEN`.

---

## 17. Explicit non-goals

- Long-term video hosting or transcoding (S3 is temporary staging only).
- Granting YouTube Studio manager access (Google-side).
- Different capabilities for editor vs writer.
- Comments, playlists other than uploads, analytics, public watch page.
- Production Google verification, HTTPS, or a dedicated session store.
- Email alerts for remake requests (in-app notifications only).

---

## 18. Quick glossary

| Term | Meaning |
| --- | --- |
| Owner | User who connected YouTube; their token drives the API |
| Staff / member | Invited user; identity only |
| Workspace | Pair of (channel owner, caller role) for one request |
| Refresh token | Long-lived Google credential; encrypted in MongoDB |
| Access token | Short-lived; obtained in memory by `googleapis` |
| Invite token | Random URL secret; only the hash is stored |
