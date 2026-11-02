export function errorHandler(err, _req, res, _next) {
  if (err?.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "Video is too large (max 256MB).", code: "FILE_TOO_LARGE" });
  }
  if (err?.code === "LIMIT_UNEXPECTED_FILE" || err?.message === "INVALID_VIDEO_TYPE") {
    return res.status(400).json({ error: "Upload a mp4, mov, webm, or mkv file.", code: "INVALID_FILE" });
  }
  console.error(err?.message || err);
  return res.status(500).json({ error: "Something went wrong.", code: "INTERNAL" });
}
