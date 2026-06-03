const fs = require("fs");
const path = require("path");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};

  return fs
    .readFileSync(filePath, "utf8")
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

const projectEnv = loadEnvFile(path.join(__dirname, ".env.production"));

module.exports = {
  apps: [
    {
      name: "ecommerce-review-system",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3001",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      env: {
        ...projectEnv,
        NODE_ENV: "production"
      },
      max_memory_restart: "512M",
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      merge_logs: true,
      time: true
    }
  ]
};
