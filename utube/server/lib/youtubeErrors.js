export function mapGoogleError(err, { asStaff = false } = {}) {
  const message = String(err?.message || "");
  const gStatus = err?.response?.status || err?.code;
  const gError = err?.response?.data?.error;
  const gErrorStr =
    typeof gError === "string" ? gError : gError?.status || gError?.message || "";

  const reauth = () => {
    if (asStaff) {
      return {
        status: 403,
        body: {
          error: "The channel owner must reconnect Google YouTube access.",
          code: "OWNER_REAUTH_REQUIRED",
        },
      };
    }
    return {
      status: 401,
      body: {
        error: "Google access was revoked. Sign in again.",
        code: "REAUTH_REQUIRED",
      },
    };
  };

  if (
    gError === "invalid_grant" ||
    gErrorStr === "invalid_grant" ||
    /invalid_grant/i.test(message)
  ) {
    return reauth();
  }

  if (gStatus === 403 || /quota|forbidden/i.test(message)) {
    return {
      status: 403,
      body: { error: "YouTube API quota or permission error.", code: "YOUTUBE_FORBIDDEN" },
    };
  }

  if (gStatus === 400) {
    return {
      status: 400,
      body: { error: "YouTube rejected the request.", code: "YOUTUBE_BAD_REQUEST" },
    };
  }

  if (gStatus === 401) {
    return reauth();
  }

  return {
    status: 502,
    body: { error: "YouTube request failed.", code: "YOUTUBE_UPSTREAM" },
  };
}
