# 需求市场 (Requirement Market)

一个现代化的需求发布和交易平台，帮助开发者和项目方高效对接。

## 功能特性

### 用户系统
- 用户注册和登录
- JWT 身份验证
- 个人主页和资料管理

### 需求管理
- 需求发布和编辑
- 需求状态管理（招募中、进行中、已完成、已取消）
- 标签分类系统
- 预算和截止日期设置
- 附件上传和管理

### 社交互动
- 需求评论系统
- 点赞/收藏功能
- 相关需求推荐

### 搜索和筛选
- 关键词搜索
- 多维度筛选（状态、标签、预算等）
- 排序功能（最新、最热、预算最高等）

### 界面特性
- 响应式设计
- 列表/网格视图切换
- 实时状态更新
- 友好的加载状态
- Toast 通知系统

## 技术栈

### 前端
- Next.js 13 (App Router)
- React
- TypeScript
- Tailwind CSS
- React Hot Toast

### 后端
- Next.js API Routes
- Prisma ORM
- PostgreSQL
- JWT Authentication

### 开发工具
- ESLint
- Prettier
- Git

## 快速开始

### 环境要求
- Node.js 16+
- PostgreSQL
- pnpm (推荐)

### 安装步骤

1. ���隆项目
\`\`\`bash
git clone https://github.com/yourusername/requirement-market.git
cd requirement-market
\`\`\`

2. 安装依赖
\`\`\`bash
pnpm install
\`\`\`

3. 环境配置
复制 \`.env.example\` 文件为 \`.env\`，并填写必要的环境变量：
\`\`\`env
DATABASE_URL="postgresql://username:password@localhost:5432/requirement_market"
JWT_SECRET="your-jwt-secret"
\`\`\`

4. 数据库迁移
\`\`\`bash
pnpm prisma migrate dev
\`\`\`

5. 启动开发服务器
\`\`\`bash
pnpm dev
\`\`\`

访问 http://localhost:3000 查看应用。

## API 文档

### 认证相关
- POST `/api/auth/register` - 用户注册
- POST `/api/auth/login` - 用户登录
- GET `/api/auth/me` - 获取当前用户信息

### 需求相关
- GET `/api/requirements` - 获取需求列表
- POST `/api/requirements` - 创建需求
- GET `/api/requirements/:id` - 获取需求详情
- PUT `/api/requirements/:id` - 更新需求
- DELETE `/api/requirements/:id` - 删除需求

### 评论相关
- GET `/api/requirements/:id/comments` - 获取评论列表
- POST `/api/requirements/:id/comments` - 发布评论

### 点赞相关
- GET `/api/requirements/:id/like-status` - 获取点赞状态
- POST `/api/requirements/:id/like-status` - 切换点赞状态

### 其他功能
- GET `/api/requirements/:id/related` - 获取相关需求

## 项目结构

\`\`\`
src/
├── app/                    # Next.js 13 App Router
│   ├── (auth)/            # 认证相关页面
│   ├── (main)/            # 主要页面
│   ├── api/               # API 路由
│   └── layout.tsx         # 根布局
├── components/            # 可复用组件
├── contexts/              # React Context
├── lib/                   # 工具函数和配置
└── prisma/               # Prisma 配置和迁移
\`\`\`

## 贡献指南

1. Fork 项目
2. 创建功能分支 (\`git checkout -b feature/AmazingFeature\`)
3. 提交更改 (\`git commit -m 'Add some AmazingFeature'\`)
4. 推送到分支 (\`git push origin feature/AmazingFeature\`)
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系方式

- 项目维护者：[chen893]
- Email：[1390158928@qq.com]
- 项目链接：[https://github.com/chen893/requirement-market](https://github.com/chen893/requirement-market)

## 致谢

感谢所有为这个项目做出贡献的开发者！
