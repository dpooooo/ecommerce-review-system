# 电商增长复盘系统

面向电商运营、店长、推广负责人和老板的经营复盘与增长诊断平台。系统覆盖数据上传、字段映射、清洗入库、指标计算、GMV/GSV 归因、异常诊断、行动清单和复盘报告。

## 技术栈

- Next.js App Router + React + TypeScript
- Tailwind CSS + Recharts + lucide-react
- Next.js Route Handlers
- Prisma ORM + PostgreSQL
- xlsx / csv 文件解析
- JWT Cookie 登录态

## 本地启动

1. 安装依赖

```bash
npm install
```

2. 配置环境变量

```bash
copy .env.example .env
```

修改 `.env` 中的 `DATABASE_URL`、`JWT_SECRET`、`UPLOAD_DIR`。

3. 初始化数据库

```bash
npm run prisma:generate
npm run prisma:migrate
npm run seed
```

默认管理员：

- email: `admin@example.com`
- password: `123456`

4. 启动开发服务

```bash
npm run dev
```

访问 `http://localhost:3000`。

## 常用脚本

```bash
npm run dev
npm run build
npm run start
npm run prisma:generate
npm run prisma:migrate
npm run prisma:deploy
npm run prisma:studio
npm run seed
```

## GitHub 同步

项目已配置 `.gitignore`，不会提交 `.env`、`.next`、`node_modules`、日志和上传文件。`uploads/.gitkeep` 会保留目录结构。

首次推送：

```bash
git init
git add .
git commit -m "init ecommerce review system"
git branch -M main
git remote add origin https://github.com/你的用户名/ecommerce-review-system.git
git push -u origin main
```

服务器更新：

```bash
git pull origin main
npm install
npm run prisma:generate
npm run prisma:deploy
npm run build
pm2 restart ecommerce-review-system
```

## 项目结构

- `app`：页面和 API Route Handlers
- `components`：布局、驾驶舱和通用组件
- `lib/analysis`：指标比较、归因、诊断、报告构建
- `lib/upload`：文件解析
- `lib/auth`：密码 hash 与 JWT session
- `prisma`：数据库 schema 和 seed
- `uploads`：本地上传目录占位

## MVP 状态

当前版本已经包含可运行的工程骨架、核心页面、demo ReportSchema、主要 API、Prisma 数据模型和 seed。上传接口支持保存文件并解析 Excel / CSV 预览。后续可继续把确认入库接口从预留逻辑扩展为完整标准化写库流程。
