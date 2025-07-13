# FavLinks - 收藏夹管理系统

## 快速开始

### 1. 环境要求

- Node.js 22.x（推荐使用 nvm 管理版本）
- npm 10.x+

```bash
# 使用nvm切换到Node.js 22
nvm use 22
```

### 2. 环境配置

复制环境变量模板文件：
```bash
cp .env.example .env
```

编辑 `.env` 文件，填入您的实际配置：
- `SUPABASE_URL`: 您的 Supabase 项目 URL
- `SUPABASE_ANON_KEY`: 您的 Supabase 匿名密钥
- `SESSION_SECRET`: 用于会话加密的密钥
- `PORT`: 服务器端口（默认3000）

### 3. 安装依赖

```bash
npm install
```

### 4. 运行项目

```bash
npm run dev
```

## 项目结构

```
favlinks/
├── client/          # 前端代码
├── server/          # 后端代码
├── .env.example     # 环境变量模板
├── .gitignore       # Git忽略文件
├── package.json     # 项目依赖
└── vite.config.js   # Vite配置
```

## 部署到Vercel

### 1. 推送代码到GitHub

```bash
git add .
git commit -m "准备部署到Vercel"
git push origin v2
```

### 2. 在Vercel中部署

1. 登录 [Vercel](https://vercel.com)
2. 导入您的GitHub仓库
3. 选择 `v2` 分支
4. Vercel会自动检测配置并部署

### 3. 设置环境变量

在Vercel项目设置中添加以下环境变量：

- `SUPABASE_URL`: 您的Supabase项目URL
- `SUPABASE_ANON_KEY`: 您的Supabase匿名密钥
- `SESSION_SECRET`: 会话加密密钥
- `NODE_ENV`: 设置为 `production`

### 4. 域名配置

部署完成后，您可以：
- 使用Vercel提供的默认域名
- 配置自定义域名

## 技术特性

- **Node.js 22**: 使用最新的Node.js版本
- **加密兼容**: 自动升级旧版本密码加密
- **一键部署**: 支持Vercel一键部署
- **前后端一体**: 无需分离部署

## 注意事项

- 请勿提交 `.env` 文件到版本控制
- 确保所有敏感信息都在环境变量中配置
- 生产环境请使用强密码和安全的密钥
- 部署后首次访问可能需要等待几秒钟冷启动
