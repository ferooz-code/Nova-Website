import { createServer } from "node:http";
import { createReadStream, existsSync, mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const ROOT = dirname(fileURLToPath(import.meta.url));
const DIST = join(ROOT, "dist");
const DATA_DIR = join(ROOT, "server-data");
const UPLOAD_DIR = join(ROOT, "public", "uploads");
const DEFAULT_CONTENT_FILE = join(ROOT, "src", "data", "site-content.json");
const CONTENT_FILE = join(DATA_DIR, "content.json");
const ADMIN_FILE = join(DATA_DIR, "admin.json");
const INQUIRIES_FILE = join(DATA_DIR, "inquiries.json");

function loadEnv() {
  const envPath = join(ROOT, ".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2];
  }
}

loadEnv();
mkdirSync(DATA_DIR, { recursive: true });
mkdirSync(UPLOAD_DIR, { recursive: true });

function writeJson(file, value) {
  const temporary = `${file}.${randomBytes(5).toString("hex")}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
  renameSync(temporary, file);
}

function readJson(file, fallback) {
  try { return JSON.parse(readFileSync(file, "utf8")); } catch { return fallback; }
}

if (!existsSync(CONTENT_FILE)) writeJson(CONTENT_FILE, readJson(DEFAULT_CONTENT_FILE, {}));
if (!existsSync(INQUIRIES_FILE)) writeJson(INQUIRIES_FILE, []);

function hashPassword(password, salt = randomBytes(16).toString("hex")) {
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored?.includes(":")) return false;
  const [salt, hex] = stored.split(":");
  const expected = Buffer.from(hex, "hex");
  const actual = scryptSync(password, salt, 64);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

if (!existsSync(ADMIN_FILE) && process.env.ADMIN_PASSWORD) {
  writeJson(ADMIN_FILE, {
    username: process.env.ADMIN_USERNAME || "Admin",
    passwordHash: hashPassword(process.env.ADMIN_PASSWORD),
    mustChangePassword: true,
  });
}

const sessions = new Map();
const loginAttempts = new Map();
const inquiryAttempts = new Map();
const SESSION_TTL = 8 * 60 * 60 * 1000;
const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || "127.0.0.1";

function json(res, status, value, extraHeaders = {}) {
  const body = JSON.stringify(value);
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Content-Length": Buffer.byteLength(body), ...extraHeaders });
  res.end(body);
}

function readBody(req, limit = 1_000_000) {
  return new Promise((resolveBody, rejectBody) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > limit) {
        rejectBody(new Error("Request is too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      try { resolveBody(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}")); }
      catch { rejectBody(new Error("Invalid JSON")); }
    });
    req.on("error", rejectBody);
  });
}

function cookies(req) {
  return Object.fromEntries((req.headers.cookie || "").split(";").map((part) => part.trim().split("=")).filter(([key, value]) => key && value));
}

function sessionFor(req) {
  const token = cookies(req).nova_session;
  const session = token && sessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    if (token) sessions.delete(token);
    return null;
  }
  session.expiresAt = Date.now() + SESSION_TTL;
  return session;
}

function requireSession(req, res) {
  const session = sessionFor(req);
  if (!session) json(res, 401, { error: "Administrator sign-in required" });
  return session;
}

function rateAllowed(store, key, maximum, windowMs) {
  const now = Date.now();
  const current = (store.get(key) || []).filter((timestamp) => now - timestamp < windowMs);
  if (current.length >= maximum) return false;
  current.push(now);
  store.set(key, current);
  return true;
}

function safeText(value, maximum = 4000) {
  return String(value || "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, maximum);
}

function mimeType(file) {
  return ({
    ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
    ".webp": "image/webp", ".gif": "image/gif", ".svg": "image/svg+xml", ".ico": "image/x-icon",
    ".woff": "font/woff", ".woff2": "font/woff2", ".mp4": "video/mp4", ".webm": "video/webm",
  })[extname(file).toLowerCase()] || "application/octet-stream";
}

function sendFile(res, file) {
  if (!existsSync(file) || !statSync(file).isFile()) return false;
  res.writeHead(200, { "Content-Type": mimeType(file), "Cache-Control": extname(file) === ".html" ? "no-cache" : "public, max-age=86400" });
  createReadStream(file).pipe(res);
  return true;
}

function serveSite(pathname, res) {
  let root = DIST;
  let relative = pathname;
  if (pathname.startsWith("/uploads/")) {
    root = UPLOAD_DIR;
    relative = pathname.slice("/uploads".length);
  }
  const candidate = resolve(root, `.${normalize(decodeURIComponent(relative))}`);
  if (candidate.startsWith(resolve(root)) && sendFile(res, candidate)) return;
  if (!sendFile(res, join(DIST, "index.html"))) json(res, 503, { error: "Build the website before starting the server" });
}

const server = createServer(async (req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const path = requestUrl.pathname;
  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";

  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Content-Security-Policy", "default-src 'self'; img-src 'self' data: blob: https:; media-src 'self' blob: https:; style-src 'self' 'unsafe-inline'; script-src 'self'; frame-src https://www.youtube-nocookie.com https://player.vimeo.com; connect-src 'self'");

  try {
    if (path === "/api/content" && req.method === "GET") return json(res, 200, readJson(CONTENT_FILE, readJson(DEFAULT_CONTENT_FILE, {})));

    if (path === "/api/auth/session" && req.method === "GET") {
      const session = sessionFor(req);
      const admin = readJson(ADMIN_FILE, null);
      return json(res, 200, session ? { authenticated: true, username: session.username, mustChangePassword: admin?.mustChangePassword !== false } : { authenticated: false });
    }

    if (path === "/api/auth/login" && req.method === "POST") {
      if (!rateAllowed(loginAttempts, ip, 7, 15 * 60 * 1000)) return json(res, 429, { error: "Too many sign-in attempts. Try again later." });
      const admin = readJson(ADMIN_FILE, null);
      if (!admin) return json(res, 503, { error: "Administrator credentials have not been configured on this server." });
      const body = await readBody(req, 32_000);
      if (safeText(body.username, 100).toLowerCase() !== admin.username.toLowerCase() || !verifyPassword(String(body.password || ""), admin.passwordHash)) return json(res, 401, { error: "Incorrect username or password" });
      const token = randomBytes(32).toString("hex");
      sessions.set(token, { username: admin.username, expiresAt: Date.now() + SESSION_TTL });
      const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
      return json(res, 200, { authenticated: true, username: admin.username, mustChangePassword: admin.mustChangePassword !== false }, { "Set-Cookie": `nova_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_TTL / 1000}${secure}` });
    }

    if (path === "/api/auth/logout" && req.method === "POST") {
      const token = cookies(req).nova_session;
      if (token) sessions.delete(token);
      return json(res, 200, { ok: true }, { "Set-Cookie": "nova_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0" });
    }

    if (path === "/api/auth/change-password" && req.method === "POST") {
      if (!requireSession(req, res)) return;
      const admin = readJson(ADMIN_FILE, null);
      const body = await readBody(req, 32_000);
      if (!verifyPassword(String(body.currentPassword || ""), admin.passwordHash)) return json(res, 400, { error: "Current password is incorrect" });
      if (String(body.newPassword || "").length < 12) return json(res, 400, { error: "New password must be at least 12 characters" });
      writeJson(ADMIN_FILE, { ...admin, passwordHash: hashPassword(String(body.newPassword)), mustChangePassword: false });
      return json(res, 200, { ok: true });
    }

    if (path === "/api/content" && req.method === "PUT") {
      if (!requireSession(req, res)) return;
      const body = await readBody(req, 2_000_000);
      if (!body?.brand?.name || !body?.home?.headline || !body?.contact?.address || typeof body.pageOverrides !== "object") return json(res, 400, { error: "Content is missing required site fields" });
      writeJson(CONTENT_FILE, body);
      return json(res, 200, { content: body });
    }

    if (path === "/api/media" && req.method === "POST") {
      if (!requireSession(req, res)) return;
      const body = await readBody(req, 72_000_000);
      const allowed = new Map([["image/jpeg", ".jpg"], ["image/png", ".png"], ["image/webp", ".webp"], ["image/gif", ".gif"], ["video/mp4", ".mp4"], ["video/webm", ".webm"]]);
      const extension = allowed.get(body.mime);
      if (!extension) return json(res, 400, { error: "Unsupported file type" });
      const bytes = Buffer.from(String(body.data || ""), "base64");
      if (!bytes.length || bytes.length > 50 * 1024 * 1024) return json(res, 400, { error: "Files must be smaller than 50 MB" });
      const base = safeText(body.filename, 120).replace(/\.[^.]+$/, "").replace(/[^a-z0-9_-]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || "media";
      const filename = `${Date.now()}-${randomBytes(4).toString("hex")}-${base}${extension}`;
      writeFileSync(join(UPLOAD_DIR, filename), bytes, { mode: 0o644 });
      return json(res, 201, { url: `/uploads/${filename}` });
    }

    if (path === "/api/inquiries" && req.method === "POST") {
      if (!rateAllowed(inquiryAttempts, ip, 8, 60 * 60 * 1000)) return json(res, 429, { error: "Too many inquiries. Try again later." });
      const body = await readBody(req, 128_000);
      if (body.website) return json(res, 200, { ok: true });
      const inquiry = {
        id: randomBytes(10).toString("hex"), createdAt: new Date().toISOString(),
        name: safeText(body.name, 180), organization: safeText(body.organization, 180), email: safeText(body.email, 240),
        phone: safeText(body.phone, 80), region: safeText(body.region, 180), interest: safeText(body.interest, 180), message: safeText(body.message, 6000),
      };
      if (!inquiry.name || !inquiry.organization || !inquiry.email || !inquiry.region || !inquiry.message) return json(res, 400, { error: "Complete all required inquiry fields" });
      const inquiries = readJson(INQUIRIES_FILE, []);
      inquiries.unshift(inquiry);
      writeJson(INQUIRIES_FILE, inquiries.slice(0, 5000));
      return json(res, 201, { ok: true });
    }

    if (path === "/api/inquiries" && req.method === "GET") {
      if (!requireSession(req, res)) return;
      return json(res, 200, { inquiries: readJson(INQUIRIES_FILE, []) });
    }

    if (path.startsWith("/api/")) return json(res, 404, { error: "API route not found" });
    return serveSite(path, res);
  } catch (error) {
    if (!res.headersSent) json(res, error.message === "Request is too large" ? 413 : 500, { error: error.message || "Server error" });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Nova website server running at http://${HOST}:${PORT}`);
});
