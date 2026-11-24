# 项目长期约定（数学游戏 / MathBrain）

## 版本更新流程（用户明确要求，必须遵守）
- **每次版本更新后必须 git 存档**：改完代码、验证通过、打包 APK 之后，在工作区根目录执行 `git add -A && git commit -m "<版本> ..."`，把本次改动存进本地 git 仓库。
- 用户目标：把代码同时存到 GitHub 私有仓库（账号 YokienChen，SSH 已配置可用）。本地仓库已 `git init`，首次提交 `3f13a21`。
- **远程仓库已配置**：`origin = https://github.com/YokienChen/MathBrain.git`（2026-11-24 21:48 起为公开仓库 PUBLIC，用户主动开放；首次提交 `3f13a21` 已推送到 master）。
- **每次更新的最后一步**：`git add -A && git commit -m "<版本> ..." && git push`，确保 GitHub 上始终有最新代码。
- `.gitignore` 已排除：`.build/tools/`（1.3G 工具链）、`.build/app/.gradle/`、`app/build/`、临时截图与预览 HTML。保留：主源码、各版本备份、APK、APK 工程源码、历史版本资源、验证脚本。**排除 `*.jks` 签名密钥**（仓库公开后用户要求移除，本地 `.build/app/game.jks` 保留用于打包签名）。

## 构建环境
- JAVA_HOME / ANDROID_HOME / GRADLE_HOME 位于 `.build/tools/`，Gradle 8.7，签名 digest `4ae1394a…`。
- 版本三处同步：`build.gradle`（versionCode/versionName）、`MainActivity.java` 的 `return "x.y.z"`、HTML 顶部 `<!-- MathBrain vX -->` 及全文版本号。

## 历史版本重编号（2026-11-24 21:54）
- 用户要求把 v8.7 及以前所有版本号改成 v0.x.x（vX.Y→v0.X.Y），v1.0.x 与当前主源码不动。
- 改了 85 个文件名（19 备份HTML + v8.7基线 + 两套各23 APK + 19 历史资源），以及 versions-meta.json、版本管理工具.html 的内嵌数据与硬编码判断、旧备份内部注释。
- APK 内部 versionName 是编译进二进制的历史标识（如 5.3/8.7），只改文件名不改内部，保留历史归档真实性。
- 版本工具回滚命令同步改为 `cp 数学_v<版本>_备份.html ...`。
