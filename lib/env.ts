const requiredRuntimeEnv = ["DATABASE_URL", "JWT_SECRET", "UPLOAD_DIR"] as const;

export function assertRuntimeEnv() {
  const missing = requiredRuntimeEnv.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`缺少必要环境变量：${missing.join(", ")}。请参考 .env.example 配置。`);
  }
}

export function uploadDir() {
  return process.env.UPLOAD_DIR || "./uploads";
}
