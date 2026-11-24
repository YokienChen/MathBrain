# 项目长期约定（数学游戏 / MathBrain）

## 版本更新流程（用户明确要求，必须遵守）
- **每次版本更新后必须 git 存档**：改完代码、验证通过、打包 APK 之后，在工作区根目录执行 `git add -A && git commit -m "<版本> ..."`，把本次改动存进本地 git 仓库。
- 用户目标：把代码同时存到 GitHub 私有仓库（账号 YokienChen，SSH 已配置可用）。本地仓库已 `git init`，首次提交 `3f13a21`。
- **远程仓库已配置**：`origin = https://github.com/YokienChen/MathBrain.git`（私有仓库 PRIVATE，首次提交 `3f13a21` 已推送到 master）。
- **每次更新的最后一步**：`git add -A && git commit -m "<版本> ..." && git push`，确保 GitHub 上始终有最新代码。
- `.gitignore` 已排除：`.build/tools/`（1.3G 工具链）、`.build/app/.gradle/`、`app/build/`、临时截图与预览 HTML。保留：主源码、各版本备份、APK、APK 工程源码（含 game.jks 签名密钥）、历史版本资源、验证脚本。

## 构建环境
- JAVA_HOME / ANDROID_HOME / GRADLE_HOME 位于 `.build/tools/`，Gradle 8.7，签名 digest `4ae1394a…`。
- 版本三处同步：`build.gradle`（versionCode/versionName）、`MainActivity.java` 的 `return "x.y.z"`、HTML 顶部 `<!-- MathBrain vX -->` 及全文版本号。
