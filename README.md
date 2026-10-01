# 恭喜

一个使用 Next.js 构建的业务成功庆祝效果实验室，展示成就完成、目标达成、下单成功和秒杀成功场景。用户可以组合两侧彩纸礼炮、飞机撒彩纸、气球升空等演出，选择配色、调整重力、风力、阻力、速度和粒子数量，并按需开启真实录制的欢呼、掌声和庆祝人群口哨音效；效果组合不受固定数量限制。

飞机 SVG 取自 [Twemoji](https://github.com/jdecked/twemoji) 图形库并经格式整理，按 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可使用；气球由 Canvas 动态绘制。欢呼、掌声和庆祝人群口哨为 Freesound 上标注 [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) 的 MP3 试听文件。完整来源与许可信息分别见 `public/celebration-assets/ATTRIBUTION.md` 和 `public/sounds/ATTRIBUTION.md`。

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
