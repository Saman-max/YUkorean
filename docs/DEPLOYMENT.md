# GitHub 部署

目标：`Saman-max/YUkorean`。

## 发布流程

1. 使用具备该仓库写入和 Pages 管理权限的 GitHub 身份。
2. 将源码推送到 `main`，包含 `.github/workflows/pages.yml`。
3. GitHub 仓库 Settings → Pages → Source 应选择 GitHub Actions。工作流也会尝试启用 Pages。
4. Actions 依次安装测试依赖、测试、以 `/YUkorean/` 子路径构建、检查链接、上传产物并部署。
5. 以 Actions 成功结果和 Pages 返回的 URL 为最终发布状态。

发布后首页通常位于 `https://saman-max.github.io/YUkorean/`，学习中心位于 `https://saman-max.github.io/YUkorean/learn/`。这些是目标地址，不能仅凭推送成功就断言网站已经上线。

## 身份与权限

使用 GitHub CLI 的设备登录流程：

```sh
gh auth login --hostname github.com --git-protocol https --web
```

凭证保存在本机的 GitHub CLI / 系统凭证存储中，不写进项目。不要把 Token 发在聊天里、写进 `.env` 后提交，或放入远程地址。

## 首次发布命令

仓库不存在时：

```sh
gh repo create Saman-max/YUkorean --public --source=. --remote=origin
```

如果仓库已存在，先检查其默认分支和内容，避免覆盖已有项目。新项目推送：

```sh
git add .
git commit -m "Build YUKorean product reconstruction and learning app"
git push -u origin main
gh run list --repo Saman-max/YUkorean
```

不要使用强制推送。GitHub Pages 是否可用于私有仓库取决于账户计划；没有用户指定时，面向公开访问的网站采用公开仓库。

## 环境和密钥

当前没有生产密钥，不需要配置 GitHub Secrets。GitHub 自动提供的工作流令牌仅用于 Pages 部署。生成式 AI、用户系统和支付应放在独立服务端，之后再通过受控接口对接。
