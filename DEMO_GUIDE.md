# CI/CD Demo Guide - 演示指南

本指南将帮助你完成三个 CI/CD 演示要求的视频录制。

## 📋 要求清单

1. ✅ **Docker Build** - 展示 CI/CD 在 GitHub 中执行 Docker 构建
2. ✅ **E2E Test Fail** - 展示 CI/CD 捕获 E2E 测试失败
3. ✅ **Feature Change** - 展示 CI/CD 部署功能变更（可以简单到只改变页面文字）

---

## 🎬 演示 1: Docker Build（Docker 构建）

### 目标
展示 GitHub Actions 自动构建 Docker 镜像

### 步骤

1. **打开 GitHub 仓库**
   - 访问: https://github.com/Cthloveross/CSE590-04-final-project
   - 点击 "Actions" 标签

2. **触发构建**
   ```bash
   # 在终端执行
   cd "/Users/jiachengsang/Desktop/Web development/Final Project/CSE590-04-final-project"
   
   # 做一个小改动来触发 workflow
   echo "# Demo commit" >> README.md
   git add README.md
   git commit -m "docs: trigger CI/CD demo"
   git push origin main
   ```

3. **展示构建过程**
   - 刷新 Actions 页面，会看到新的 workflow 运行
   - 点击进入 workflow
   - 点击 "Build Docker Image" job
   - **录制视频重点**:
     - 展示 "Set up Docker Buildx" 步骤
     - 展示 "Build and push Docker image" 步骤
     - 展示构建日志中的 Docker 层（layers）
     - 展示成功推送到 GitHub Container Registry

4. **验证镜像**
   - 在仓库页面右侧点击 "Packages"
   - 展示生成的 Docker 镜像

### 录制要点
- 清晰显示这是 GitHub Actions，不是本地的 `docker build`
- 展示自动化执行，无需手动干预
- 显示镜像成功推送到 registry

---

## 🎬 演示 2: E2E Test Fail（E2E 测试失败）

### 目标
展示 CI/CD 检测到测试失败并阻止部署

### 步骤

1. **确认失败测试存在**
   ```bash
   # 查看测试文件
   cat tests/e2e/failing-demo.spec.ts
   ```
   
   这个文件包含一个故意失败的测试

2. **触发测试**
   ```bash
   # 提交改动触发 CI/CD
   git add .
   git commit -m "test: trigger failing test demo"
   git push origin main
   ```

3. **展示测试失败**
   - 在 GitHub Actions 中查看 workflow
   - **录制视频重点**:
     - 展示 "Run E2E Tests" job 标记为 ❌ 失败
     - 点击进入查看详细日志
     - 展示错误信息: "TimeoutError: locator.toBeVisible: Timeout"
     - 展示 workflow 整体状态为失败
     - 展示部署 job 因为测试失败而被跳过（没有执行）

4. **下载测试报告（可选）**
   - 滚动到页面底部 "Artifacts"
   - 下载 "playwright-report" 
   - 解压并打开 HTML 报告展示失败详情

### 录制要点
- 明确显示测试失败了
- 显示 CI/CD 捕获了这个失败
- 显示失败的测试阻止了后续部署

---

## 🎬 演示 3: Feature Change（功能变更）

### 目标
展示修改页面内容后，CI/CD 自动测试并部署

### 步骤

1. **修复失败的测试（让 pipeline 能通过）**
   ```bash
   # 删除失败的测试文件
   rm tests/e2e/failing-demo.spec.ts
   
   git add tests/e2e/failing-demo.spec.ts
   git commit -m "test: remove failing test for demo"
   git push origin main
   ```
   
   等待这个 workflow 完成并成功

2. **修改页面内容**
   
   打开 `pages/index.vue`，修改一些文字：
   
   ```bash
   # 找到文件中的某段文字并修改
   # 例如，把欢迎信息改为 "Welcome to Game Shop - CI/CD Demo!"
   ```

3. **提交变更**
   ```bash
   git add pages/index.vue
   git commit -m "feat: update welcome message for CI/CD demo"
   git push origin main
   ```

4. **展示 CI/CD 流程**
   - 在 GitHub Actions 中查看 workflow
   - **录制视频重点**:
     - 展示所有 jobs 都成功: ✅ Build, ✅ Test (Unit), ✅ Test (E2E)
     - 点击查看 Build job，显示新的 Docker 镜像被构建
     - 点击查看 Test jobs，显示所有测试通过
     - （如果配置了部署）展示 Deploy job 执行

5. **验证变更（本地测试）**
   ```bash
   # 拉取最新代码
   git pull origin main
   
   # 用 Docker 运行
   docker-compose up -d
   
   # 打开浏览器访问 http://localhost:3000
   # 展示页面上的文字已经更新
   ```

### 录制要点
- 展示一个简单的代码变更（改文字最容易展示）
- 展示 CI/CD 自动触发
- 展示所有测试通过
- 展示新版本被构建和部署

---

## 🎥 录制技巧

### 推荐录屏工具
- **macOS**: QuickTime Player（免费）或 Screen Studio
- **通用**: OBS Studio（免费）
- **专业**: Loom（带鼠标高亮）

### 录制建议

1. **分开录制三个演示**，每个 2-5 分钟
2. **画面清晰**：
   - 关闭不必要的浏览器标签
   - 使用浏览器全屏或增大字体
   - 确保 GitHub Actions 日志清晰可读

3. **重点突出**：
   - 用鼠标悬停在关键信息上
   - 给观看者时间阅读重要日志
   - 可以添加文字说明或旁白

4. **流程完整**：
   - 演示 1: 代码提交 → Actions 触发 → Docker 构建 → 镜像推送
   - 演示 2: 代码提交 → Actions 触发 → 测试运行 → 测试失败 → 阻止部署
   - 演示 3: 修改代码 → 提交 → 测试通过 → 构建成功 → 部署完成

---

## 📝 快速演示脚本

### 演示 1 脚本（2 分钟）
```bash
# 1. 显示 Dockerfile 存在
ls -la Dockerfile

# 2. 触发构建
echo "# Docker build demo" >> README.md
git add . && git commit -m "demo: docker build" && git push

# 3. 打开浏览器到 GitHub Actions
# 4. 展示 Build job 运行过程
# 5. 展示成功构建和推送镜像
```

### 演示 2 脚本（2 分钟）
```bash
# 1. 显示失败测试文件
cat tests/e2e/failing-demo.spec.ts

# 2. 触发测试
git add . && git commit -m "demo: test failure" --allow-empty && git push

# 3. 打开 GitHub Actions
# 4. 展示 E2E Test job 失败
# 5. 展示错误日志
```

### 演示 3 脚本（3 分钟）
```bash
# 1. 删除失败测试
rm tests/e2e/failing-demo.spec.ts
git add . && git commit -m "fix: remove failing test" && git push

# 等待成功后...

# 2. 修改页面文字
# (手动编辑 pages/index.vue)

# 3. 提交变更
git add . && git commit -m "feat: update welcome text" && git push

# 4. 展示 GitHub Actions 所有 jobs 成功
# 5. 展示页面更新 (docker-compose up)
```

---

## ✅ 检查清单

在录制前确认：

- [ ] GitHub Actions 已启用
- [ ] 仓库有 `.github/workflows/ci-cd.yml` 文件
- [ ] Docker 相关文件存在 (Dockerfile, docker-compose.yml)
- [ ] Playwright 测试文件存在
- [ ] 失败测试文件 `tests/e2e/failing-demo.spec.ts` 存在
- [ ] Git 配置正确，可以正常 push
- [ ] 浏览器已登录 GitHub 账号

---

## 🆘 常见问题

### Q: GitHub Actions 没有触发？
A: 检查 `.github/workflows/ci-cd.yml` 文件是否在 main 分支上，并且 Actions 已启用。

### Q: Docker 构建失败？
A: 这实际上也能展示 CI/CD 工作！展示如何发现和定位问题。

### Q: 测试运行时间太长？
A: 可以修改 `playwright.config.ts`，只运行一个浏览器（chromium）。

### Q: 本地想测试整个流程？
A: 
```bash
# 测试 Docker 构建
docker build -t game-shop:test .

# 测试运行
docker-compose up

# 测试 E2E（需要先启动应用）
npm install
npx playwright install
npm run test:e2e
```

---

## 🎓 评分要点

根据要求，确保视频包含：

1. ✅ **Docker Build**: 清楚展示 CI/CD 执行 Docker 构建（不是本地 `docker build`）
2. ✅ **Test Failure**: 清楚展示测试失败被捕获，阻止部署
3. ✅ **Feature Change**: 清楚展示代码变更触发完整的 CI/CD 流程

祝演示顺利！🎉
