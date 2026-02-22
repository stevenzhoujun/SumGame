# 数字消除：求和挑战 (Sum Blast)

一款基于 React + Vite + Tailwind CSS 开发的数学益智消除游戏。

## 核心玩法
- **点击求和**：点击方块使数字相加等于目标值。
- **消除策略**：成功凑出目标数字后，选中的方块会被消除。
- **防止触顶**：如果数字方块堆积到屏幕顶部，游戏结束。

## 游戏模式
- **经典模式**：每次成功求和后新增一行，挑战生存极限。
- **计时模式**：在倒计时结束前完成求和，否则会强制新增一行。

## 本地开发

1. 安装依赖：
   ```bash
   npm install
   ```

2. 启动开发服务器：
   ```bash
   npm run dev
   ```

3. 构建项目：
   ```bash
   npm run build
   ```

## 部署到 Vercel

本项目已配置好，可以直接部署到 Vercel：

1. 将代码推送到 GitHub 仓库。
2. 在 [Vercel 控制台](https://vercel.com/new) 导入该 GitHub 仓库。
3. Vercel 会自动识别 Vite 配置，直接点击 **Deploy** 即可。

### 环境变量
如果在 `vite.config.ts` 中使用了 `GEMINI_API_KEY`，请在 Vercel 的项目设置中添加该环境变量。
