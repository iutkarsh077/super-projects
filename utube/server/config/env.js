const REQUIRED = [
  "DATABASE_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "REDIRECT_URI",
  "JAVASCRIPT_ORIGIN",
  "JWT_SECRET",
  "TOKEN_ENCRYPTION_KEY",
];

export function loadEnv() {
  const missing = REQUIRED.filter((key) => !process.env[key]?.trim());
  if (missing.length) {
    throw new Error(`Missing required env: ${missing.join(", ")}`);
  }

  return {
    port: Number(process.env.PORT) || 4000,
    databaseUrl: process.env.DATABASE_URL,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI,
    clientOrigin: process.env.JAVASCRIPT_ORIGIN,
    jwtSecret: process.env.JWT_SECRET,
    tokenEncryptionKey: process.env.TOKEN_ENCRYPTION_KEY,
    mongoDnsServers: process.env.MONGODB_DNS_SERVERS
      ? process.env.MONGODB_DNS_SERVERS.split(",").map((s) => s.trim()).filter(Boolean)
      : [],
    isProd: process.env.NODE_ENV === "production",
  };
}
