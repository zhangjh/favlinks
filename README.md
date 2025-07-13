# FavLinks - 收藏夹管理系统

## 快速开始

### 1. 环境配置

复制环境变量模板文件：
```bash
cp .env.example .env
```

编辑 `.env` 文件，填入您的实际配置：
- `SUPABASE_URL`: 您的 Supabase 项目 URL
- `SUPABASE_ANON_KEY`: 您的 Supabase 匿名密钥
- `SESSION_SECRET`: 用于会话加密的密钥
- `PORT`: 服务器端口（默认3000）

### 2. 安装依赖

```bash
npm install
```

### 3. 运行项目

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

## 注意事项

- 请勿提交 `.env` 文件到版本控制
- 确保所有敏感信息都在环境变量中配置
- 生产环境请使用强密码和安全的密钥
