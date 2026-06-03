import { access, mkdir, writeFile, unlink } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import process from "node:process";
import { setTimeout as sleep } from "node:timers/promises";
import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");

const required = ["DATABASE_URL", "JWT_SECRET", "NEXT_PUBLIC_APP_URL", "UPLOAD_DIR", "NODE_ENV"];
const missing = required.filter((key) => !process.env[key]);

if (missing.length) {
  console.error(`缺少必要环境变量：${missing.join(", ")}`);
  console.error("请先根据 .env.production.example 创建 .env.production，并确保部署环境能加载这些变量。");
  process.exit(1);
}

if (!process.env.DATABASE_URL?.startsWith("postgresql://") && !process.env.DATABASE_URL?.startsWith("postgres://")) {
  console.error("DATABASE_URL 必须是 PostgreSQL 连接字符串。");
  process.exit(1);
}

if ((process.env.JWT_SECRET || "").length < 16) {
  console.error("JWT_SECRET 至少建议 16 位以上。");
  process.exit(1);
}

const uploadDir = path.resolve(process.env.UPLOAD_DIR || "./uploads");
await mkdir(uploadDir, { recursive: true });
await access(uploadDir, constants.W_OK);

const testFile = path.join(uploadDir, `.write-test-${Date.now()}`);
await writeFile(testFile, "ok");
let cleaned = false;
for (let attempt = 0; attempt < 3; attempt += 1) {
  try {
    await unlink(testFile);
    cleaned = true;
    break;
  } catch {
    await sleep(150);
  }
}

console.log("部署前检查通过：环境变量和上传目录可用。");
if (!cleaned) {
  console.warn(`警告：测试文件已写入但未能立即删除，请手动检查并删除：${testFile}`);
}
