# PoroBidder

一个用于模拟 LOL 电竞经理选手拍卖的小项目。

## 玩法

- 开局两位经理各有 100 资金。
- 每轮随机出现 1 位选手，并生成 5-20 的起拍价。
- 双方输入出价，0 表示不出价。
- 低于起拍价的有效出价会被拒绝。
- 出价更高的一方签下选手并扣除成交价。
- 双方都不出价则流拍。
- 同价需要重新出价。
- 每队满 5 人后游戏结束。

## 运行

### 仅前端模式

直接用浏览器打开 `index.html` 即可。

### 前后端联调（登录）

**前置条件（只需一次）**

1. 安装 **JDK 17**，并设置 `JAVA_HOME`（`java -version` 显示 17）。
2. **不必单独安装 Maven**。项目已包含 **Maven Wrapper**（`backend/mvnw.cmd`）。

**启动后端（Cursor / VS Code / 终端）**

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

首次运行 `mvnw` 时，会自动下载 **Maven 3.9.9** 到用户目录（`%USERPROFILE%\.m2\wrapper`），体积很小；项目依赖（Spring 等）从 Maven Central 拉到默认本地仓库 `C:\Users\你的用户名\.m2\repository`。

停止服务：在终端按 `Ctrl+C`。

**可选：本机自定义仓库/镜像**

若你有自己的 `settings.xml`，不要写进 Git。可在本机新建 `backend/.mvn/maven.config`（已在 `.gitignore`）：

```text
-s C:/Users/你/.m2/settings.xml
```

**在编辑器里运行**

安装扩展 **Extension Pack for Java**，打开 `PoroBidderApplication.java` 使用 Run/Debug（需 JDK 17）。

后端启动后，再打开根目录的 `index.html`。  
当前已接入：

- `POST /api/auth/login` — 登录
- `GET /api/auth/me` — 当前用户（需 `Authorization: Bearer <token>`）
- `/api/**` 除登录外需携带有效 token（鉴权拦截器）

## 扩展

选手池在 `app.js` 的 `players` 数组里，可以继续添加：

```js
{ id: "PlayerName", positions: ["中单", "上单"] }
```
