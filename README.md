#aksrtblog 前端

基于 Nuxt 3 的博客系统前端，采用 SSR 模式部署。

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览
npm run preview
```

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `NUXT_PUBLIC_API_BASE` | API 后端地址 | `http://127.0.0.1:4000` |
| `NUXT_PUBLIC_SITE_URL` | 站点公开 URL | `http://127.0.0.1:3000` |

## 部署

### 腾讯云 EdgeOne Pages

1. 连接 GitHub 仓库：`Lexo0522/aksrtblog`
2. 构建命令：`npm run build`
3. 输出目录：`.output`
4. Node 版本：20

### Vercel

```bash
npm i -g vercel
vercel
```

### Docker

```bash
docker build -t aksrtblog-frontend .
docker run -p 3000:3000 aksrtblog-frontend
```
