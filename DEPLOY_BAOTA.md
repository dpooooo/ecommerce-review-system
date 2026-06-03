# 宝塔服务器部署文档

本文档用于把“电商增长复盘系统”部署到宝塔 Linux 服务器。项目技术栈为 Next.js + Prisma + PostgreSQL，生产端口固定使用 `3001`。

## 1. 部署前确认

服务器建议配置：

- Linux 服务器，建议 2C4G 起步
- 宝塔面板
- Node.js 20 或更高版本
- PostgreSQL 13 或更高版本
- Nginx
- PM2 管理器，或宝塔 Node 项目管理器

项目目录建议使用：

```bash
/www/wwwroot/ecommerce-review-system
```

检查 Node 和 npm：

```bash
node -v
npm -v
```

如果 Node 版本低于 20，先在宝塔软件商店或 Node 版本管理器中升级。

## 2. 创建 PostgreSQL 数据库

建议给本项目单独创建数据库，不要和已有站点共用数据库。

推荐数据库名：

```text
ecommerce_review_system
```

推荐数据库用户：

```text
ecommerce_review_user
```

连接字符串格式：

```bash
postgresql://数据库用户名:数据库密码@127.0.0.1:5432/ecommerce_review_system?schema=public
```

示例：

```bash
DATABASE_URL="postgresql://ecommerce_review_user:your_password@127.0.0.1:5432/ecommerce_review_system?schema=public"
```

注意：

- 已有站点使用 PostgreSQL 不影响本项目。
- 本项目必须使用独立数据库，至少要使用独立 schema。
- 不要把 `DATABASE_URL` 指向其他站点正在使用的数据库。

## 3. 拉取项目代码

进入站点目录：

```bash
cd /www/wwwroot
```

首次部署：

```bash
git clone https://github.com/dpooooo/ecommerce-review-system.git
cd ecommerce-review-system
```

后续更新：

```bash
cd /www/wwwroot/ecommerce-review-system
git pull origin main
```

如果服务器没有安装 Git，可以在宝塔软件商店安装，或者用宝塔文件管理器上传代码压缩包。

## 4. 安装依赖

在项目根目录执行：

```bash
cd /www/wwwroot/ecommerce-review-system
npm install
```

如果 npm 下载慢，可以切换源：

```bash
npm config set registry https://registry.npmmirror.com/
```

如果需要恢复官方源：

```bash
npm config set registry https://registry.npmjs.org/
```

## 5. 配置环境变量

复制生产环境模板：

```bash
cp .env.production.example .env.production
```

编辑 `.env.production`：

```bash
nano .env.production
```

推荐内容：

```env
DATABASE_URL="postgresql://ecommerce_review_user:your_password@127.0.0.1:5432/ecommerce_review_system?schema=public"
JWT_SECRET="replace-with-a-long-random-secret"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
NEXT_PUBLIC_APP_URL="https://你的域名"
UPLOAD_DIR="/www/wwwroot/ecommerce-review-system/uploads"
NODE_ENV="production"
PORT=3001
```

重点说明：

- `DATABASE_URL`：PostgreSQL 连接字符串。
- `JWT_SECRET`：登录 Cookie 加密密钥，建议 32 位以上随机字符串。
- `NEXTAUTH_SECRET`：保留生产密钥，建议同样 32 位以上。
- `NEXT_PUBLIC_APP_URL`：线上访问域名，例如 `https://review.example.com`。
- `UPLOAD_DIR`：上传文件目录。
- `NODE_ENV`：必须是 `production`，不能写 `prod`、`staging` 或其他值。
- `PORT`：本项目使用 `3001`。

生成随机密钥可以用：

```bash
openssl rand -base64 32
```

如果宝塔 Node 项目管理器里也填写了环境变量，要确保里面的值和 `.env.production` 一致，尤其是 `NODE_ENV=production`。

## 6. 创建目录权限

创建上传和日志目录：

```bash
mkdir -p /www/wwwroot/ecommerce-review-system/uploads
mkdir -p /www/wwwroot/ecommerce-review-system/logs
```

设置权限：

```bash
chmod -R 755 /www/wwwroot/ecommerce-review-system/uploads
chmod -R 755 /www/wwwroot/ecommerce-review-system/logs
```

如果运行 Node 的用户不是当前 shell 用户，需要把目录 owner 改成实际运行用户。例如宝塔常见运行用户是 `www`：

```bash
chown -R www:www /www/wwwroot/ecommerce-review-system/uploads
chown -R www:www /www/wwwroot/ecommerce-review-system/logs
```

## 7. 初始化数据库

生成 Prisma Client：

```bash
npx prisma generate
```

执行数据库迁移：

```bash
npx prisma migrate deploy
```

可选：写入演示数据和默认管理员账号：

```bash
npm run seed
```

默认管理员账号：

```text
email: admin@example.com
password: 123456
```

正式使用后建议第一时间修改默认账号密码，或新建自己的管理员账号。

## 8. 部署前检查

执行：

```bash
npm run predeploy:check
```

看到下面输出表示环境变量、数据库连接格式和上传目录检查通过：

```text
部署前检查通过：环境变量和上传目录可用。
```

如果这里失败，先按提示修复 `.env.production` 或目录权限，不要继续构建。

## 9. 构建项目

执行：

```bash
npm run build
```

构建成功后会看到 Next.js 的路由列表，并且不会出现 `Failed to compile` 或 `Export encountered an error`。

如果出现：

```text
You are using a non-standard "NODE_ENV" value
<Html> should not be imported outside of pages/_document
```

说明服务器 `NODE_ENV` 不是标准值。检查：

```bash
printenv NODE_ENV
grep NODE_ENV .env .env.production 2>/dev/null
```

修复为：

```bash
NODE_ENV=production
```

然后重新执行：

```bash
npm run predeploy:check
npm run build
```

## 10. 使用 PM2 启动

项目已经提供 `ecosystem.config.js`，默认使用端口 `3001`。

启动：

```bash
pm2 start ecosystem.config.js
```

保存 PM2 进程：

```bash
pm2 save
```

查看状态：

```bash
pm2 status
```

查看日志：

```bash
pm2 logs ecommerce-review-system
```

重启：

```bash
pm2 restart ecommerce-review-system
```

停止：

```bash
pm2 stop ecommerce-review-system
```

如果不使用 `ecosystem.config.js`，也可以直接启动：

```bash
pm2 start npm --name ecommerce-review-system -- start
pm2 save
```

## 11. 宝塔反向代理配置

在宝塔中创建网站，绑定你的域名。

然后进入：

```text
网站 -> 当前站点 -> 反向代理
```

添加反向代理：

```text
代理名称：ecommerce-review-system
目标 URL：http://127.0.0.1:3001
发送域名：$host
```

建议开启：

- SSL 证书
- 强制 HTTPS
- HTTP/2

如果使用 Nginx 配置文件，可参考：

```nginx
location / {
    proxy_pass http://127.0.0.1:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## 12. 健康检查

先检查本机端口：

```bash
curl http://127.0.0.1:3001/api/health
```

返回示例：

```json
{
  "ok": true,
  "database": "ok",
  "uploadWritable": true
}
```

再检查域名访问：

```bash
curl https://你的域名/api/health
```

登录后台后，也可以访问：

```text
/settings/deployment
```

这个页面会展示环境变量状态、健康检查入口和部署测试清单。

## 13. 更新部署流程

以后每次更新代码，建议按这个顺序执行：

```bash
cd /www/wwwroot/ecommerce-review-system
git pull origin main
npm install
npx prisma generate
npx prisma migrate deploy
npm run predeploy:check
npm run build
pm2 restart ecommerce-review-system
```

更新后检查：

```bash
pm2 status
curl http://127.0.0.1:3001/api/health
```

## 14. 常见问题

### `npm run build` 提示 NODE_ENV 非标准

原因：服务器或宝塔面板里把 `NODE_ENV` 设置成了非标准值。

解决：

```bash
export NODE_ENV=production
grep NODE_ENV .env .env.production 2>/dev/null
npm run predeploy:check
npm run build
```

同时检查宝塔 Node 项目管理器或 PM2 面板里的环境变量。

### 端口 3001 被占用

检查占用进程：

```bash
lsof -i:3001
```

如果是旧的 PM2 进程：

```bash
pm2 delete ecommerce-review-system
pm2 start ecosystem.config.js
```

### 502 Bad Gateway

常见原因：

- PM2 进程没有启动。
- 项目不是运行在 `3001`。
- Nginx 反代目标 URL 写错。
- 构建失败但仍然启动。

排查：

```bash
pm2 status
pm2 logs ecommerce-review-system
curl http://127.0.0.1:3001/api/health
```

### 数据库连接失败

检查：

```bash
echo $DATABASE_URL
npx prisma migrate deploy
```

确认：

- PostgreSQL 服务正在运行。
- 数据库名正确。
- 用户名和密码正确。
- 该用户有建表、读写权限。
- `DATABASE_URL` 指向本项目独立数据库。

### 上传失败

检查目录：

```bash
ls -ld /www/wwwroot/ecommerce-review-system/uploads
```

修复权限：

```bash
mkdir -p /www/wwwroot/ecommerce-review-system/uploads
chmod -R 755 /www/wwwroot/ecommerce-review-system/uploads
chown -R www:www /www/wwwroot/ecommerce-review-system/uploads
```

如果 PM2 使用的不是 `www` 用户，请替换成实际运行用户。

### 登录后 Cookie 异常

检查：

- `NEXT_PUBLIC_APP_URL` 是否是当前域名。
- 是否启用了 HTTPS。
- Nginx 是否正确传递 `X-Forwarded-Proto`。
- `JWT_SECRET` 是否稳定，不能每次启动都变化。

## 15. 最小可用部署命令

如果你已经配置好了数据库和 `.env.production`，可以直接按下面这组命令部署：

```bash
cd /www/wwwroot/ecommerce-review-system
git pull origin main
npm install
npx prisma generate
npx prisma migrate deploy
npm run predeploy:check
npm run build
pm2 start ecosystem.config.js
pm2 save
curl http://127.0.0.1:3001/api/health
```
