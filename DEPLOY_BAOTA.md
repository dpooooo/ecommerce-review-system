# 宝塔面板部署说明

本文档适合新手按步骤把“电商增长复盘系统”部署到 Linux 服务器。

## 1. 宝塔面板准备

在宝塔软件商店安装：

- Nginx
- Node.js 20+
- PostgreSQL
- PM2 管理器，或使用宝塔 Node 项目管理器

## 2. 创建 PostgreSQL 数据库

建议数据库名：

```text
ecommerce_review_system
```

创建数据库用户并设置强密码，然后准备连接字符串：

```bash
DATABASE_URL="postgresql://数据库用户:数据库密码@127.0.0.1:5432/ecommerce_review_system?schema=public"
```

## 3. 上传或拉取项目代码

推荐目录：

```bash
/www/wwwroot/ecommerce-review-system
```

如果使用 GitHub：

```bash
cd /www/wwwroot
git clone https://github.com/你的用户名/ecommerce-review-system.git
cd ecommerce-review-system
```

后续更新：

```bash
cd /www/wwwroot/ecommerce-review-system
git pull origin main
```

## 4. 安装依赖

```bash
npm install
```

如果 npm 镜像异常，可以切换：

```bash
npm config set registry https://registry.npmjs.org/
```

或使用 npmmirror：

```bash
npm config set registry https://registry.npmmirror.com/
```

## 5. 配置环境变量

```bash
cp .env.production.example .env.production
```

填写：

- `DATABASE_URL`
- `JWT_SECRET`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `UPLOAD_DIR`

生产建议：

```bash
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://你的域名"
UPLOAD_DIR="/www/wwwroot/ecommerce-review-system/uploads"
```

## 6. 初始化数据库

```bash
npx prisma generate
npx prisma migrate deploy
npm run seed
```

`npm run seed` 是可选步骤，用于生成演示数据和默认管理员账号。

默认管理员：

- email: `admin@example.com`
- password: `123456`

## 7. 构建项目

```bash
npm run build
```

如果内存不足，可以在宝塔里增加 swap，或临时关闭其他占用内存的进程后重试。

## 8. 启动项目

直接启动：

```bash
npm run start
```

PM2 启动：

```bash
pm2 start npm --name ecommerce-review-system -- start
pm2 save
```

默认端口为 `3000`。

## 9. 宝塔反向代理

在宝塔网站中绑定域名，然后配置反向代理：

```text
目标 URL：http://127.0.0.1:3000
```

开启 SSL 证书，并建议开启强制 HTTPS。

## 10. 上传目录权限

创建上传目录：

```bash
mkdir -p /www/wwwroot/ecommerce-review-system/uploads
```

确保 Node 进程可写：

```bash
chmod -R 755 /www/wwwroot/ecommerce-review-system/uploads
```

如果仍然无法上传，请检查项目运行用户是否有目录写入权限。

## 11. 常见问题排查

`npm install` 失败：检查 Node 版本是否为 20+，并尝试切换 npm registry。

Prisma 连接 PostgreSQL 失败：检查 `DATABASE_URL`、数据库用户密码、端口和 PostgreSQL 服务状态。

端口 3000 被占用：使用 `lsof -i:3000` 找到进程，或调整启动端口。

上传文件失败：检查 `UPLOAD_DIR` 是否存在，Node 进程是否有写入权限。

反向代理 502：确认 `npm run start` 或 PM2 进程正在运行，端口是 3000。

页面可以访问但 API 报错：检查 `.env.production` 是否配置完整，尤其是 `JWT_SECRET` 和 `DATABASE_URL`。

登录后 Cookie 异常：确认域名、HTTPS 和反向代理配置正确。

PostgreSQL 权限不足：确认数据库用户拥有目标数据库的建表、读写权限。
