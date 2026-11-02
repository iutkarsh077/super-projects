import crypto from "node:crypto";
import { loadEnv } from "../config/env.js";

function keyBuffer() {
  const { tokenEncryptionKey } = loadEnv();
  if (/^[0-9a-f]{64}$/i.test(tokenEncryptionKey)) {
    return Buffer.from(tokenEncryptionKey, "hex");
  }
  return crypto.createHash("sha256").update(tokenEncryptionKey).digest();
}

export function encrypt(plain) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", keyBuffer(), iv);
  const encrypted = Buffer.concat([cipher.update(String(plain), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decrypt(payload) {
  const [ivHex, tagHex, dataHex] = String(payload || "").split(":");
  if (!ivHex || !tagHex || !dataHex) {
    throw new Error("Invalid encrypted token");
  }
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    keyBuffer(),
    Buffer.from(ivHex, "hex"),
  );
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  return Buffer.concat([
    decipher.update(Buffer.from(dataHex, "hex")),
    decipher.final(),
  ]).toString("utf8");
}
