# Building a YouTube review desk that never hands the channel keys to the browser

Most “YouTube tools” are either a thin wrapper around the Data API or a second copy of YouTube Studio. Utube is neither. It is a channel operations desk: editors and writers stage a draft, the channel owner watches it inside the app, and only then does the file become a real video on the channel. Staff can work on the channel without ever receiving the owner’s YouTube credential.

This post is about that split, and about the path a file takes from a browser upload to a published video.

## The job, not the clone

A channel has one owner and any number of staff. Staff are video editors or content writers. They can list live videos, edit titles and descriptions, and submit a new file for review. They cannot publish, send a video back for a remake, delete a live video, or manage the team. The interface hides those controls. The API refuses them anyway.

A draft moves through a short loop:

1. Someone uploads a file. It is not on YouTube yet.
2. The owner previews it in the app.
3. The owner either publishes it to the channel, with an explicit privacy setting, or sends it back with notes.
4. A remake is not a dead end. The uploader sees the notes, replaces the file, and the draft returns to the queue.

Privacy defaults to private. Publishing asks for confirmation and names that privacy setting, because the result is visible outside the app.

## Two processes, one credential

The interface is a Next.js app. The API is Express. The browser talks only to the API, with a session cookie. It never calls Google’s token endpoint, and it never calls YouTube.

That constraint forces the interesting design. The owner signs in with Google and grants YouTube access. The API keeps a long-lived refresh token, encrypted at rest, and mints short-lived access tokens in memory when it needs them. Staff sign in with Google too, but only for identity: name, email, and profile. Their session can act on a channel only because the API checks a membership record and then uses the *owner’s* token.

Removing someone from the team deletes that membership. Their next request fails the workspace check. It does not change anything inside YouTube Studio. Access in this app and access in Google are different things, and the product treats them that way.

The session itself is a signed token in an httpOnly cookie. It identifies the user. It does not carry a role, an email, or a Google token. Role is loaded from the database on each request, so a removed teammate cannot keep a stale permission inside a cookie.

## How the API knows which channel you mean

A person can own one channel and also belong to others. Each request that touches videos or the team is resolved to a workspace: a channel owner, plus the caller’s role on that channel.

The client remembers the selected owner in memory and sends it as a header. If the header is present, the API allows the call only when the caller *is* that owner or has an active membership on that owner. There is no fallback to “some other channel I can see.” That blocks a staff member from substituting another user’s id.

If the header is missing, an owner still reaches their own channel. A staff member with exactly one membership reaches that channel. Anyone else is refused.

Publish, reject, delete, and team management then require the owner role a second time. Hiding a button is not the security boundary.

## Drafts live in object storage, briefly

A review upload does not stream the video through the API process. The client asks the API to open a submission. The API records the title, description, privacy, and content type, then returns a short-lived URL the browser can PUT to directly. The file goes to a private bucket. The session cookie is not sent with that PUT.

When the upload finishes, the uploader calls back. The API checks that the object exists, that the type is one of the allowed video types, and that it is within the size cap. Only then does the submission become “pending review.”

Preview is the same idea in reverse: a short-lived read URL, played in a normal video element. The owner watches that preview before the publish and remake actions appear.

Publish streams the object into a YouTube insert, using the owner’s credential. On success the app marks the submission published and deletes the object. On failure it returns the submission to pending review and leaves the file in place so the owner can retry. A remake request stores the notes, deletes the object, and notifies the uploader inside the app. Draft files are staging, not a video host. Abandoned uploads are expected to expire from the bucket on their own.

Direct upload to YouTube, skipping review, is a retired route. It answers with a gone status and tells the client to use the review queue.

## Invites are secrets the database never stores

An owner invites an email address and a role. The API generates a random token, stores only a hash, and sets an expiry. The raw token appears once, in a link. If mail is not configured, the owner copies the link. If it is configured, the link can be mailed. Either way, the database cannot be dumped into a list of usable invite URLs.

Opening the link prepares the invite and sets a short-lived cookie so the token can survive the redirect to Google without remaining in the address bar afterward. After Google returns, accept succeeds only when the signed-in email matches the invited email. A mismatch leaves the invite unused. Accepting clears the hash, so the link cannot be reused.

## What the team sees on the channel

The live video list comes from the channel’s uploads playlist, a page at a time, then a details call for titles, privacy, and basic counts. View and like totals on the dashboard are those counts for the videos loaded so far, not a separate analytics product. There is no watch-time report, no audience breakdown, and no comment thread. Editors and writers see the same counts as the owner, because the API reads them with the owner’s credential after the membership check.

Cards for live videos link out to YouTube. The app does not try to be the watch page.

## The shape of the interface

The UI is one dashboard, not a set of products. Signed out, it is a short sign-in screen. Signed in, the order is fixed: who you are and which channel you are on, then errors, then team management for the owner, then submit, then remakes, then the review queue, then live videos.

A review card is the owner’s working surface. Thumbnail and title, then who submitted it and when, then the player, then the description, then the decision. Publish is the one filled action. Requesting a remake is a separate text action that opens a required notes field. Destructive confirms (delete, remove, publish) are toasts with an explicit yes or no, not a browser dialog, and nothing proceeds until that choice is made.

The palette stays pale red, white, and black. Status is words, not a second color system.

## What this design refuses

A few things look like obvious features and are intentionally absent.

The browser is not a YouTube client. Putting the owner’s refresh token in the page, or letting staff complete the YouTube OAuth flow “for convenience,” would collapse the permission model.

Object storage is not a library. Keeping drafts after publish would turn a review queue into a second host, with its own retention and access problems.

Editor and writer are stored as different roles, but they share the same capabilities for now. The split is there so a later change can narrow one of them without a migration of the membership model.

There is no in-app comment system, no playlist manager, and no analytics dashboard beyond the view and like counts YouTube already returns with each video.

## Why the awkward parts are worth it

Presigned uploads, hashed invites, encrypted refresh tokens, and a workspace header are more machinery than a single-user “list my videos” demo. They exist so that three statements stay true at once:

- Staff can do real channel work.
- Only the owner can publish or destroy a live video.
- A leaked browser session, a copied invite after it is used, or a database read of the user record is not a YouTube credential.

That is the whole product. Everything else is the control panel around that rule.
