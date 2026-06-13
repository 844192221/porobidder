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

### 新前端（React + Ant Design，开发中）

在 `frontend-ui` 分支的 `frontend/` 目录。**不要**再打开根目录的 `index.html` 看新界面。

```powershell
cd frontend
npm install
npm run dev
```

浏览器访问 **http://localhost:5173**（不是 `index.html` 文件路径）。

需要登录、拍卖等功能时，另开终端启动后端（见下），Vite 会把 `/api`、`/ws` 代理到 `8080`。

### 旧版静态前端（根目录）

根目录的 `index.html` + `app.js` 仍是上一版，线上 VPS 目前也还在用它。迁移完成前本地联调请用上面的 `frontend/`。

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

后端启动后：

- **新前端**：保持 `npm run dev`，打开 http://localhost:5173  
- **旧前端**：打开根目录 `index.html`  

当前已接入：

- `POST /api/auth/login` — 登录
- `GET /api/auth/me` — 当前用户（需 `Authorization: Bearer <token>`）
- `GET /api/activities`、`GET /api/activities/{id}` — 活动与选手
- `POST /api/activities/{id}/room/join` — 加入拍卖房间（每活动最多 2 位经理）
- `WS /ws/activities/{id}?token=...` — 房间状态推送与出价（消息见下）
- `/api/**` 除登录外需携带有效 token（鉴权拦截器）

**WebSocket 消息（JSON）**

客户端 → 服务端：

- `{ "type": "bid", "amount": 50 }` — 本轮出价

服务端 → 客户端：

- `{ "type": "room", "payload": { ... } }` — 房间快照（倒计时、队列、两队、开奖结果等）
- `{ "type": "error", "message": "..." }` — 错误提示

竞拍规则在服务端执行；两人需各自登录并 `join` 后进入房间联机。第二位经理加入后房间会自动开拍。

## 扩展

选手池在 `app.js` 的 `players` 数组里，可以继续添加：

```js
{ id: "PlayerName", positions: ["中单", "上单"] }
```
