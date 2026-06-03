import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";

const validNodeEnvs = new Set(["production", "development", "test"]);
const inheritedNodeEnv = process.env.NODE_ENV;
const env = { ...process.env, NODE_ENV: "production" };

if (inheritedNodeEnv && !validNodeEnvs.has(inheritedNodeEnv)) {
  console.warn(`检测到非标准 NODE_ENV=${inheritedNodeEnv}，本次构建将使用 NODE_ENV=production。`);
}

const nextBin = path.join(process.cwd(), "node_modules", "next", "dist", "bin", "next");
const child = spawn(process.execPath, [nextBin, "build"], {
  env,
  stdio: "inherit"
});

child.on("exit", (code, signal) => {
  if (signal) {
    console.error(`next build 被信号中止：${signal}`);
    process.exit(1);
  }

  process.exit(code ?? 1);
});
