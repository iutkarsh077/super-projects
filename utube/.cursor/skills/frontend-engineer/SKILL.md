---
name: frontend-engineer
description: >
  Design and implement the frontend of Utube, a YouTube video review and
  publishing app, so every new screen looks and behaves like the existing
  channel control panel. Use whenever the user asks to add, change, restyle,
  or review anything in client/: the review queue, the video player and
  decision panel, upload and submit forms, remake and reject flows, status
  badges, team and invite screens, empty/loading/error states, or any layout
  and visual work. Also use for vague requests like "make the review flow
  better", "polish the dashboard", "this looks bad", "add a page", or "make
  reviewing faster", even if the user never says "frontend" or "design".
---

# Utube frontend

Utube is a YouTube **channel operations and review** app. Staff (video editors, content writers) stage drafts. The channel owner reviews each draft, then either publishes it to the real YouTube channel or sends it back for a remake with notes. It is not a watch page, a YouTube clone, or a marketing site.

The UI should feel like a calm work tool:

- one job per region
- the channel and the user's role always visible
- the review decision (publish vs. remake) unmistakable
- dangerous actions obviously dangerous

Stack: Next.js 16 App Router, React 19, Tailwind CSS 4. No component library. Almost all UI lives in `client/src/app/page.js`, `client/src/app/invite/[token]/page.js`, and `client/src/app/invite/complete/page.js`. Data goes through `client/src/lib/api.js`.

Read the screen you are changing before inventing a new look. Match what is already there unless the user asked to change the visual system.

## The review lifecycle (know this before touching UI)

A video moves through these states. Every screen should make the current state obvious and offer only the actions that make sense for that state and role.

```
draft/uploaded  ->  pending review  ->  published   (owner publishes)
                         |
                         +-> needs remake  ->  (staff edits/re-uploads, resubmits)  ->  pending review
```

- **Staff** (`video_editor`, `content_writer`) can list, edit, upload, and submit for review. They see remake notes on their own rejected drafts so they know what to fix.
- **Owner** reviews the queue, previews the draft, then publishes or requests a remake. Only the owner deletes live videos and manages the team.
- Publish and request-remake are separate actions. Remake requires notes (the API rejects empty notes). Never merge them into one ambiguous button.
- A remake is a loop, not a dead end. The staff view must show the owner's notes prominently, and resubmitting must put the video back in the owner's queue.

## Product rules that shape the UI

- The browser never calls YouTube or Google token endpoints. Use `api()` from `client/src/lib/api.js`. It sends the session cookie and `X-Channel-Owner-Id`. Never put tokens, secrets, or invite tokens in `localStorage`, JSX, or the URL after login.
- Login is a full-page link to `googleLoginUrl()`, not an embedded Google button. Owner login requests YouTube scopes. Invite login uses `googleLoginUrl({ intent: "member" })`. Do not swap those.
- Roles: `owner`, `video_editor`, `content_writer`. Show labels with the existing `roleBadge` mapping ("Owner", "Video editor", "Content writer").
- Hide controls the role cannot use (`canDelete`, `canManageTeam`, `workspace.role === "owner"`). Hiding is not security; the API still enforces it. Do not add a disabled control that explains a permission the server will refuse, unless the user asked for that.
- Do not add YouTube comments, analytics, playlists, a public watch page, or long-term video hosting. Draft files are temporary. Say that in helper copy when a form needs it.
- Reviewer notes on a draft (the remake notes) are part of the review flow and are fine. They are not YouTube comments and must never be posted to YouTube.

## Layout

| Screen | Container |
| --- | --- |
| Signed out | Centered column, `flex flex-1 flex-col items-center justify-center`, short paragraph `max-w-md text-center` |
| Signed in, no workspace | `mx-auto w-full max-w-lg flex-1 flex-col gap-4 p-8` |
| Dashboard | `mx-auto w-full max-w-5xl flex-1 flex-col gap-8 p-6 sm:p-10` |
| Invite | Same centered column as signed out |

Dashboard order, top to bottom: identity header, page error, missing-channel notice, Team (owner only), Submit for review, Needs remake (only when there is something to remake), In review, Your videos.

New sections go where the job happens, not in a new nav, unless the page is genuinely too long to scan.

The header always shows avatar (if `user.picture`), name or email, channel title, and role. The workspace `<select>` appears only when `workspaces.length > 1`. Log out stays a quiet secondary button.

### Review card layout

A card in the "In review" list is the owner's main working surface. Keep this structure:

1. Thumbnail (or "Processing" placeholder) and title
2. Meta line: submitter, submitted time, privacy (uppercased, tracking-wide), status
3. Preview player (`ReviewPlayer`), shown inline or on demand
4. Description, collapsed past a few lines
5. Decision row: one `primaryBtn` ("Publish to YouTube") and one `dangerBtn` text action ("Request remake") that reveals a notes textarea and a confirm button

Do not put the decision row above the preview. The owner should see the video before they see the buttons that act on it.

## Visual system

Tailwind utilities only. Do not add CSS modules, styled-components, or a UI kit.

The theme is fixed. Do not add a dark-mode inversion or `dark:` color overrides. The page stays a pale red, cards stay white, and text stays black even when the OS is in dark mode.

Use the tokens in `globals.css`: `bg-background`, `bg-card`, `text-foreground`, `text-muted`, `text-brand`, `border-line`, `bg-brand`. Shared class strings live in `client/src/components/ui.js`.

- Page background is pale red (`bg-background`). A 4px brand bar sits at the top of every screen.
- Text is black (`text-foreground`). Secondary copy is `text-muted`, which is still a near-black, not gray.
- Wordmarks ("Utube", invite titles) are `text-brand`.
- Cards and panels: `panelClass` (white, `border-line`, `rounded-2xl`). Nested rows use the same border on white.
- Primary action: `primaryBtn` (brand red, white label). One primary button per region. White on the button is for contrast, not a second text color.
- Secondary action: `secondaryBtn` (white, black text, `border-line`).
- Inline text actions (Edit, Cancel, Retry): `textBtn` (black underline).
- Destructive (Delete, Remove, Request remake): `dangerBtn` (brand red underline), never the filled primary pill.
- Remake: white card with a brand-red left border. Inner notes sit on `bg-background`.
- Errors: `text-brand` inside a white card. One page-level error near the header is enough.
- Invite links: `break-all rounded-lg border border-line bg-background p-3 text-sm`.
- Inputs: `inputClass`.
- Video thumbs: `h-40 w-full object-cover` inside `overflow-hidden rounded-2xl border border-line bg-card`. Missing thumb: a `h-40 bg-background` placeholder that says "Processing".
- In-app preview: `<video controls className="max-h-64 w-full rounded-lg bg-black">`. The black frame is the player, not the page theme.

### Status

Status is shown as plain text in the meta line, not as a new colored badge system. Replace underscores with spaces (`pending_review` becomes `pending review`). Do not introduce green/amber/blue status chips; that adds colors outside the red, white, and black tokens. If a status needs emphasis, use `font-medium` or `text-brand`.

### Type

- `h1` is `text-3xl font-semibold tracking-tight text-brand` on the signed-out screen only.
- Section titles are `text-lg font-semibold`.
- Card titles are `font-medium`.
- Meta lines are `text-xs` or `text-sm text-muted`.
- Geist is already loaded in `layout.js` as `--font-geist-sans`. Prefer `font-sans`. Do not add another font.

### Spacing

Stay on the existing scale: page `gap-8`, inside a card `gap-3` or `gap-4`, button rows `gap-2`. Do not tighten the dashboard into a dense admin table unless the user asks.

## Interaction

Every async region has four states, in this order of attention: loading, error, empty, content. Empty copy names the next action ("No videos waiting for review.", "No invites yet.", "No uploads yet."), not "Nothing here."

Buttons that mutate show the in-progress label and are `disabled` until the request finishes: "Submitting…", "Uploading to YouTube…", "Publishing…", "Sending…", "Saving…", "Deleting…". Never leave the idle label up while the request runs.

Confirm before irreversible actions, with a sentence that says what is destroyed:

- Delete a live video: "Delete this video from YouTube permanently?"
- Remove a teammate: "Remove this person from the channel?"
- Publish: "Publish this video to the channel as {privacy}?" Publishing is visible to the outside world, so name the privacy setting in the confirmation.

Request-remake flow: clicking "Request remake" reveals a notes textarea (`maxLength={2000}`, required) and a "Send back for remake" button, disabled while notes are empty. Cancel is a `textBtn`.

Forms keep the real limits in the control, not only in placeholder text: title `maxLength={100}` and required, description `maxLength={5000}`, reject notes `maxLength={2000}`, file `accept` for mp4, mov, webm, mkv. Default privacy is `private`. Helper text under submit says the 256MB cap and that the owner reviews before YouTube.

After a successful mutation, refresh the list that changed (`loadVideos`, `loadReviews`, `loadTeam`) instead of using optimistic UI that can lie about YouTube or S3. Clear the form fields you own. Surface `err.message` from `api()`; those strings are already safe.

`user === undefined` means the session check is still running. Show the centered "Loading…" state. `user === null` is signed out. Do not flash the dashboard in between.

### Upload and long-running work

- Large uploads can take a while. Keep the submit button disabled and labeled with progress ("Uploading…") for the whole request, and keep the form values on failure so the user can retry.
- If the API exposes progress, show a simple bar inside the card using `bg-brand` on `bg-background`. If it does not, do not fake a percentage.
- A video that was just uploaded may not have a thumbnail yet. Use the "Processing" placeholder rather than a broken image.

## Copy

Short, operational, second person only when giving an instruction. No exclamation marks, no "Awesome", no feature marketing on the dashboard. The signed-out line can stay a single sentence about listing, editing, and uploading on the channel.

Privacy values render as the API sends them (`private`, `unlisted`, `public`), uppercased only in the small tracking-wide meta line on video cards. Status strings with underscores are shown with the underscore replaced by a space (`pending review`).

Remake notes are shown to staff verbatim, labeled "Notes from the owner". Do not paraphrase, truncate, or style them as errors.

## When you change the UI

1. Find the existing screen and copy its structure. Extract a component only when a block is reused or the page function is getting hard to follow (as `ReviewPlayer` already is). Keep new components in `client/src/app/` or `client/src/components/` as plain functions, with `"use client"` only if they use state or browser APIs.
2. Do not add a dependency for icons, modals, or toasts. A bordered card, a confirm dialog, and inline text cover this app.
3. Preserve keyboard use: real `<button type="button">` or `type="submit"`, associated labels or visible placeholders on inputs, and focusable actions. Do not replace buttons with clickable divs. Keep the native video `controls` so the player stays keyboard accessible.
4. Stay on the red, white, and black tokens. A new surface that introduces zinc, amber, green, or a dark-mode flip splits the product.
5. Staff and owner must both still make sense. If you add an owner action, gate it. If you add a staff-visible list, do not show publish, reject, delete, or team controls.
6. Verify in the browser before calling the work done:
   - signed-out (or the closest reachable state)
   - the changed dashboard region, as both owner and staff if the change touches either
   - empty and error states if you touched them
   - a narrow viewport around 375px

   The dashboard wraps with `flex-wrap`; do not introduce horizontal scroll from a fixed-width control.

## Anti-patterns

- A second primary button in the same region (for example "Publish" and "Request remake" both filled red).
- Filled red "Delete" or "Remove" buttons.
- Toasts, modals, or icon packs added for one feature.
- Status colors, gradients, shadows heavier than the existing cards, or any dark-mode styling.
- Optimistic UI for publish, reject, or delete.
- Showing owner tools to staff, or explaining a permission the server will refuse.
- Reading or writing tokens in client storage.
- Features outside scope: comments, analytics, playlists, public watch pages, long-term hosting.

## What "good" means here

A change is good when someone who already uses the dashboard can find the new control without being told where it is, the primary action is the red pill, destructive actions stay red underlined text, the owner can watch a draft and make a decision without leaving the card, staff can see exactly what to fix after a remake, and the screen still works for a staff member who should not see owner tools.

Novelty is not a goal. A new visual language is a separate request, and it should be applied to the signed-out screen, the dashboard, and both invite pages together so the product does not split in two.