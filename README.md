# 恭喜

一个使用 Next.js 构建的成功祝贺组件展示页，包含 10 款可筛选、可选择并可复制文案的组件。

## 本地开发

```bash
pnpm install
pnpm dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000)。

## GitHub Pages 部署

仓库已配置 GitHub Actions 自动部署。将更改推送到 `main` 分支，或在仓库的 **Actions** 页面手动运行 **Deploy to GitHub Pages** 工作流，即可构建并发布静态站点。

首次部署前，请在仓库的 **Settings → Pages → Build and deployment** 中将 **Source** 设为 **GitHub Actions**。部署成功后，项目站点地址为 `https://cbtpro.github.io/congrats/`。

项目使用 pnpm 管理依赖，并在 GitHub Actions 中缓存 pnpm store、使用锁文件安装依赖、运行 lint 和 Next.js 静态构建，再将 `out` 目录部署到 GitHub Pages。GitHub Actions 构建会自动使用仓库名设置项目站点子路径；本地开发仍使用根路径。
