import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return {};

  return readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .reduce((env, line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return env;

      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex === -1) return env;

      const key = trimmed.slice(0, separatorIndex).trim();
      let value = trimmed.slice(separatorIndex + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      env[key] = value;
      return env;
    }, {});
}

const validNodeEnvs = new Set(["production", "development", "test"]);
const inheritedNodeEnv = process.env.NODE_ENV;
const productionEnv = loadEnvFile(path.join(process.cwd(), ".env.production"));
const env = { ...process.env, ...productionEnv, NODE_ENV: "production" };

if (inheritedNodeEnv && !validNodeEnvs.has(inheritedNodeEnv)) {
  console.warn(`Detected non-standard NODE_ENV=${inheritedNodeEnv}; building with NODE_ENV=production.`);
}

if (productionEnv.NEXT_PUBLIC_APP_URL) {
  console.log(`Building with NEXT_PUBLIC_APP_URL=${productionEnv.NEXT_PUBLIC_APP_URL}`);
}

const nextBin = path.join(process.cwd(), "node_modules", "next", "dist", "bin", "next");
const child = spawn(process.execPath, [nextBin, "build"], {
  env,
  stdio: "inherit"
});

child.on("exit", (code, signal) => {
  if (signal) {
    console.error(`next build stopped by signal: ${signal}`);
    process.exit(1);
  }

  process.exit(code ?? 1);
});
