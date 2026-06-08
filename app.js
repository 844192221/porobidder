const STARTING_MONEY = 80;
const TEAM_SIZE = 4;
const AUTH_TOKEN_KEY = "porobidder.authToken";
const state = {
  userId: "",
  authToken: "",
  money: STARTING_MONEY,
  hasAuction: false,
  activities: [],
  selectedActivityId: null,
  joinedAuction: false,
  auctionSession: null,
  roomView: null,
  roomSocket: null,
  myTeam: null,
  managerA: null,
  managerB: null,
  opponentId: "",
  roundResult: null,
  lastRoundResult: null,
  roundNumber: 1,
  lastRoomPayloadRaw: "",
  lastBidPrefillKey: "",
};

const welcomeView = document.querySelector("#welcomeView");
const loginView = document.querySelector("#loginView");
const homeView = document.querySelector("#homeView");
const auctionView = document.querySelector("#auctionView");

const startButton = document.querySelector("#startButton");
const loginButton = document.querySelector("#loginButton");
const logoutButton = document.querySelector("#logoutButton");
const joinButton = document.querySelector("#joinButton");
const backHomeButton = document.querySelector("#backHomeButton");
const submitBidButton = document.querySelector("#submitBidButton");

const userIdInput = document.querySelector("#userIdInput");
const loginMessage = document.querySelector("#loginMessage");
const avatarPreview = document.querySelector("#avatarPreview");
const userIdText = document.querySelector("#userIdText");
const moneyText = document.querySelector("#moneyText");
const auctionStatusText = document.querySelector("#auctionStatusText");
const activityNameText = document.querySelector("#activityNameText");
const activityStatusBadge = document.querySelector("#activityStatusBadge");
const activityText = document.querySelector("#activityText");
const activityMeta = document.querySelector("#activityMeta");
const auctionRoomName = document.querySelector("#auctionRoomName");
const currentPlayerCard = document.querySelector("#currentPlayerCard");
const roomItemStatus = document.querySelector("#roomItemStatus");
const roomItemHint = document.querySelector("#roomItemHint");
const currentPlayerInfo = document.querySelector("#currentPlayerInfo");
const currentPlayerPosition = document.querySelector("#currentPlayerPosition");
const currentPlayerName = document.querySelector("#currentPlayerName");
const currentPlayerRank = document.querySelector("#currentPlayerRank");
const currentPlayerPrice = document.querySelector("#currentPlayerPrice");
const roomAvatar = document.querySelector("#roomAvatar");
const roomUserId = document.querySelector("#roomUserId");
const roomMoney = document.querySelector("#roomMoney");
const roundCountdown = document.querySelector("#roundCountdown");
const bidInput = document.querySelector("#bidInput");
const bidMessage = document.querySelector("#bidMessage");
const feedHintPanel = document.querySelector("#feedHintPanel");
const resultPanel = document.querySelector("#resultPanel");
const resultText = document.querySelector("#resultText");
const resultDetails = document.querySelector("#resultDetails");
const teamALabel = document.querySelector("#teamALabel");
const teamBLabel = document.querySelector("#teamBLabel");
const teamAList = document.querySelector("#teamAList");
const teamBList = document.querySelector("#teamBList");
const teamProgressText = document.querySelector("#teamProgressText");
const queuePoolList = document.querySelector("#queuePoolList");
const queuePoolCount = document.querySelector("#queuePoolCount");
const passedPoolList = document.querySelector("#passedPoolList");
const passedPoolCount = document.querySelector("#passedPoolCount");
const auctionEndPanel = document.querySelector("#auctionEndPanel");
const auctionFinishedText = document.querySelector("#auctionFinishedText");

function persistAuthToken(token) {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

function restoreAuthToken() {
  state.authToken = localStorage.getItem(AUTH_TOKEN_KEY) || "";
}

function applyUser(user) {
  state.userId = user.userId;
  state.money = user.money;
}

function clearAuthSession() {
  closeRoomSocket();
  state.userId = "";
  state.authToken = "";
  state.money = STARTING_MONEY;
  state.hasAuction = false;
  state.activities = [];
  state.selectedActivityId = null;
  state.joinedAuction = false;
  state.auctionSession = null;
  state.roomView = null;
  state.myTeam = null;
  state.managerA = null;
  state.managerB = null;
  state.opponentId = "";
  state.roundResult = null;
  state.lastRoundResult = null;
  state.roundNumber = 1;
  state.lastRoomPayloadRaw = "";
  state.lastBidPrefillKey = "";
  persistAuthToken("");
  userIdInput.value = "";
  loginMessage.textContent = "";
  updateAvatarPreview();
}

function getApiBase() {
  return window.location.protocol === "file:" ? "http://localhost:8080" : "";
}

const AUCTION_TICK_MS = 200;

function formatRoundCountdown(epochMs) {
  if (!epochMs) {
    return "--:--";
  }
  const remainingMs = Math.max(0, epochMs - Date.now());
  if (remainingMs <= 0) {
    return "00:00";
  }
  const seconds = Math.min(
    Math.ceil(remainingMs / 1000),
    Math.ceil(20000 / 1000)
  );
  return `00:${String(seconds).padStart(2, "0")}`;
}

function updateRoundCountdown() {
  const view = state.roomView;
  if (!view || view.roundResult || !view.roundOpen) {
    roundCountdown.textContent = "--:--";
    return;
  }
  roundCountdown.textContent = formatRoundCountdown(view.roundEndsAtEpochMs);
}

function getWsBase() {
  if (window.location.protocol === "file:") {
    return "ws://localhost:8080";
  }
  const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") {
    return `${proto}//${host}:8080`;
  }
  return `${proto}//${window.location.host}`;
}

function closeRoomSocket() {
  if (!state.roomSocket) return;
  state.roomSocket.onclose = null;
  state.roomSocket.close();
  state.roomSocket = null;
}

function mapPlayerFromSnapshot(player) {
  return {
    playerId: player.playerId,
    position: player.position,
    rankLevel: player.rankLevel,
    basePrice: player.basePrice,
    label: `${player.position} · ${player.playerId}`,
  };
}

function mapRoundResultFromDto(dto) {
  if (!dto) return null;
  return {
    type: dto.type,
    text: dto.text,
    bids: (dto.bids || []).map((bid) => ({ id: bid.managerId, amount: bid.amount })),
    playerSnapshot: dto.playerSnapshot ? mapPlayerFromSnapshot(dto.playerSnapshot) : null,
  };
}

function applyRoomView(view) {
  state.roomView = view;
  state.money = view.myMoney;
  state.myTeam = view.myTeam;
  state.managerA = view.managerA;
  state.managerB = view.managerB;
  state.opponentId = view.opponentId || "";
  state.roundNumber = view.roundNumber;
  state.roundResult = mapRoundResultFromDto(view.roundResult);
  state.lastRoundResult = mapRoundResultFromDto(view.lastRoundResult);

  const queue = [];
  if (view.currentPlayer) {
    queue.push(mapPlayerFromSnapshot(view.currentPlayer));
  }
  if (view.queueWaiting?.length) {
    queue.push(...view.queueWaiting.map(mapPlayerFromSnapshot));
  }

  state.auctionSession = {
    activityId: view.activityId,
    name: view.title,
    startAt: view.startAt,
    phase: view.phase,
    encoreQueue: (view.encoreQueue || []).map(mapPlayerFromSnapshot),
    passedPool: (view.passedPool || []).map(mapPlayerFromSnapshot),
    queue,
    teamA: (view.teamA || []).map(mapPlayerFromSnapshot),
    teamB: (view.teamB || []).map(mapPlayerFromSnapshot),
    finished: view.finished,
    finishReason: view.finishReason,
  };

  const currentId = view.currentPlayer?.playerId || "";
  const prefillKey = `${view.roundNumber}:${view.phase}:${currentId}`;
  if (view.roundOpen && !view.myBidSubmitted && view.currentPlayer) {
    if (state.lastBidPrefillKey !== prefillKey) {
      bidInput.value = String(view.currentPlayer.basePrice);
      state.lastBidPrefillKey = prefillKey;
    }
  } else if (!view.currentPlayer || !view.roundOpen) {
    state.lastBidPrefillKey = "";
  }

}

function connectRoomSocket(activityId) {
  closeRoomSocket();
  const url = `${getWsBase()}/ws/activities/${activityId}?token=${encodeURIComponent(state.authToken)}`;
  const socket = new WebSocket(url);
  state.roomSocket = socket;

  socket.onmessage = (event) => {
    if (event.data === state.lastRoomPayloadRaw) {
      return;
    }
    state.lastRoomPayloadRaw = event.data;
    const message = JSON.parse(event.data);
    if (message.type === "room" && message.payload) {
      applyRoomView(message.payload);
      renderAuctionRoom();
      return;
    }
    if (message.type === "error" && message.message) {
      setBidHint(message.message);
    }
  };

  socket.onclose = () => {
    if (state.roomSocket === socket) {
      state.roomSocket = null;
    }
  };
}

async function apiRequest(path, options = {}) {
  const apiBase = getApiBase();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (state.authToken) {
    headers.Authorization = `Bearer ${state.authToken}`;
  }

  const response = await fetch(`${apiBase}${path}`, { ...options, headers });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthSession();
    }
    throw new Error(payload.message || "请求失败，请稍后重试。");
  }

  return payload;
}

function showView(viewName) {
  welcomeView.classList.toggle("hidden", viewName !== "welcome");
  loginView.classList.toggle("hidden", viewName !== "login");
  homeView.classList.toggle("hidden", viewName !== "home");
  auctionView.classList.toggle("hidden", viewName !== "auction");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isFirstAuctionPhase(session) {
  return session?.phase === "first";
}

function canBidZero(session) {
  return session?.phase === "encore";
}

function getPhaseLabel(session) {
  return isFirstAuctionPhase(session) ? "第一轮" : "返场";
}

function setCurrentPlayerDisplay(player) {
  if (!player) {
    currentPlayerInfo.classList.add("hidden");
    return;
  }

  currentPlayerInfo.classList.remove("hidden");
  currentPlayerPosition.textContent = player.position;
  currentPlayerName.textContent = player.playerId;
  currentPlayerName.title = player.playerId;
  currentPlayerRank.textContent = formatRankLevel(player.rankLevel);
  currentPlayerPrice.textContent = `${player.basePrice} 金币`;
}

function formatRankLevel(rankLevel) {
  if (rankLevel === null || rankLevel === undefined || rankLevel === "") {
    return "-";
  }
  return String(rankLevel);
}

function renderTeamList(listElement, roster) {
  if (roster.length === 0) {
    listElement.innerHTML = `<li class="empty">暂无选手</li>`;
    return;
  }

  listElement.innerHTML = roster
    .map(
      (player) => `
        <li class="teamPlayerCard">
          <strong class="teamPlayerName" title="${escapeHtml(player.playerId)}">${escapeHtml(player.playerId)}</strong>
        </li>
      `
    )
    .join("");
}

function getDisplayRoundResult() {
  if (state.roundResult) {
    return state.roundResult;
  }
  if (state.auctionSession?.finished && state.lastRoundResult) {
    return state.lastRoundResult;
  }
  return null;
}

function syncFeedSlot(finished = state.auctionSession?.finished) {
  const displayResult = getDisplayRoundResult();
  const hasResult = Boolean(displayResult);
  const hintText = bidMessage.textContent.trim();

  if (finished) {
    auctionEndPanel.classList.add("hidden");
    resultPanel.classList.toggle("hidden", !hasResult);
    feedHintPanel.classList.add("hidden");
    return;
  }

  auctionEndPanel.classList.add("hidden");
  resultPanel.classList.toggle("hidden", !hasResult);
  feedHintPanel.classList.toggle("hidden", hasResult || !hintText);
}

function setBidHint(message) {
  bidMessage.textContent = message;
  syncFeedSlot(false);
}

function getSelectedActivitySummary() {
  return state.activities.find((item) => item.activityId === state.selectedActivityId) || state.activities[0];
}

async function loadActivities() {
  const activities = await apiRequest("/api/activities");
  state.activities = activities;
  state.hasAuction = activities.length > 0;
  state.selectedActivityId = activities[0]?.activityId ?? null;
}

function getPassedPoolPlayers(session) {
  // Backend already returns the phase-aware/finished merged passed pool view.
  return session.passedPool;
}

function renderAuctionEndPanel(finished) {
  syncFeedSlot(finished);
}

function renderPlayerPoolList(listElement, countElement, players, emptyText) {
  if (countElement) {
    countElement.textContent = String(players.length);
  }

  if (players.length === 0) {
    listElement.innerHTML = `<li class="poolEmpty">${escapeHtml(emptyText)}</li>`;
    return;
  }

  listElement.innerHTML = players
    .map(
      (player) => `
        <li class="poolPlayerChip">
          <strong title="${escapeHtml(player.playerId)}">${escapeHtml(player.playerId)}</strong>
          <small>${player.basePrice} 金</small>
        </li>
      `
    )
    .join("");
}

function renderAuctionPools(session) {
  const auctionStarted = Boolean(state.roomView?.auctionStarted);
  const waiting = session.finished
    ? session.queue
    : auctionStarted
      ? session.queue.slice(1)
      : session.queue;
  renderPlayerPoolList(queuePoolList, queuePoolCount, waiting, "暂无排队选手");
  renderPlayerPoolList(
    passedPoolList,
    passedPoolCount,
    getPassedPoolPlayers(session),
    "暂无流拍选手"
  );
}

function getCurrentPlayer() {
  return state.auctionSession?.queue[0] ?? null;
}

function getTeamLabel(teamKey) {
  const manager = teamKey === "A" ? state.managerA : state.managerB;
  return `${manager || "?"} 队`;
}

function renderHome() {
  userIdText.textContent = state.userId;
  moneyText.textContent = state.money;

  if (!state.hasAuction) {
    activityNameText.textContent = "拍卖摊位";
    auctionStatusText.textContent = "暂无";
    activityStatusBadge.textContent = "暂无";
    activityStatusBadge.classList.remove("joined", "live");
    activityText.textContent = "现在还没有开摊的拍卖活动。";
    activityMeta.innerHTML = "";
    joinButton.textContent = "加入活动";
    joinButton.disabled = true;
    return;
  }

  const summary = getSelectedActivitySummary();

  activityNameText.textContent = summary.title;
  auctionStatusText.textContent = getAuctionStatusText();
  activityStatusBadge.textContent = getAuctionStatusText();
  activityStatusBadge.classList.toggle("joined", state.joinedAuction);
  activityStatusBadge.classList.toggle("live", state.joinedAuction);
  activityText.textContent = getActivityText();
  activityMeta.innerHTML = `
    <span>待拍选手由后台配置</span>
    <span>双方各 ${TEAM_SIZE} 人满员结束（经理本人不计入）</span>
  `;
  renderActivityButton();
}

function getAuctionStatusText() {
  if (!state.joinedAuction) return "开放中";
  return "已加入";
}

function getActivityText() {
  if (!state.joinedAuction) {
    return "市场里有一个正在营业的拍卖摊位，两位经理到齐后自动开拍。";
  }
  return "你已加入该摊位，进入房间等待另一位经理即可开始竞拍。";
}

function renderActivityButton() {
  if (!state.joinedAuction) {
    joinButton.textContent = "加入活动";
    joinButton.disabled = false;
    return;
  }
  joinButton.textContent = "进入竞拍";
  joinButton.disabled = false;
}

async function login() {
  const userId = userIdInput.value.trim();
  if (!userId) {
    loginMessage.textContent = "请输入 ID。";
    return;
  }

  loginButton.disabled = true;
  loginMessage.textContent = "正在验证身份...";

  try {
    const payload = await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ userId }),
    });

    state.authToken = payload.token;
    persistAuthToken(payload.token);
    applyUser(payload.user);
    await loadActivities();
    loginMessage.textContent = "";
    renderHome();
    showView("home");
  } catch (error) {
    loginMessage.textContent = error.message;
  } finally {
    loginButton.disabled = false;
  }
}

function updateAvatarPreview() {
  const userId = userIdInput.value.trim();
  avatarPreview.textContent = userId ? userId.slice(0, 1).toUpperCase() : "?";
}

async function logout() {
  if (state.authToken) {
    try {
      await apiRequest("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
  }
  clearAuthSession();
  showView("welcome");
}

async function joinAuction() {
  if (!state.hasAuction) return;

  const summary = getSelectedActivitySummary();
  if (!summary) return;

  try {
    if (!state.joinedAuction) {
      await apiRequest(`/api/activities/${summary.activityId}/room/join`, { method: "POST" });
      state.joinedAuction = true;
      renderHome();
    }
    await enterAuctionRoom();
  } catch (error) {
    activityText.textContent = error.message;
  }
}

async function enterAuctionRoom() {
  const summary = getSelectedActivitySummary();
  if (!summary) return;

  try {
    const join = await apiRequest(`/api/activities/${summary.activityId}/room/join`, { method: "POST" });
    state.myTeam = join.myTeam;
    state.managerA = join.managerA;
    state.managerB = join.managerB;
    state.opponentId = join.myTeam === "A" ? join.managerB : join.managerA;
    connectRoomSocket(summary.activityId);
    showView("auction");
  } catch (error) {
    setBidHint(error.message);
  }
}

function renderAuctionRoom() {
  const session = state.auctionSession;
  if (!session) return;

  const auctionStarted = Boolean(state.roomView?.auctionStarted);
  const player = getCurrentPlayer();
  const finished = session.finished;

  bidInput.disabled = finished;
  submitBidButton.disabled = finished;
  renderAuctionEndPanel(finished);

  if (finished) {
    auctionRoomName.textContent = session.name;
    teamALabel.textContent = `${getTeamLabel("A")} (${session.teamA.length}/${TEAM_SIZE})`;
    teamBLabel.textContent = `${getTeamLabel("B")} (${session.teamB.length}/${TEAM_SIZE})`;
    renderTeamList(teamAList, session.teamA);
    renderTeamList(teamBList, session.teamB);
    renderAuctionPools(session);
    roomAvatar.textContent = state.userId ? state.userId.slice(0, 1).toUpperCase() : "?";
    roomUserId.textContent = state.userId;
    roomMoney.textContent = state.money;
    roundCountdown.textContent = "--:--";
    teamProgressText.textContent = "拍卖已结束，可返回首页；下一轮需两位经理重新加入。";
    currentPlayerCard.classList.add("auctionEnded", "activeItem");
    currentPlayerCard.classList.remove("waiting");
    roomItemStatus.textContent = "活动结束";
    roomItemHint.textContent = "";
    roomItemHint.classList.add("hidden");
    setCurrentPlayerDisplay(state.lastRoundResult?.playerSnapshot ?? null);
    renderRoundResult();
    syncFeedSlot(true);
    return;
  }

  auctionRoomName.textContent = session.name;
  teamALabel.textContent = `${getTeamLabel("A")} (${session.teamA.length}/${TEAM_SIZE})`;
  teamBLabel.textContent = `${getTeamLabel("B")} (${session.teamB.length}/${TEAM_SIZE})`;
  renderTeamList(teamAList, session.teamA);
  renderTeamList(teamBList, session.teamB);
  renderAuctionPools(session);
  const passedCount = getPassedPoolPlayers(session).length;
  const waitingCount = Math.max(0, session.queue.length - (player ? 1 : 0));
  const phaseHint = getPhaseLabel(session);
  teamProgressText.textContent = `${phaseHint} · 待拍 ${waitingCount} · 流拍 ${passedCount}`;

  currentPlayerCard.classList.toggle("waiting", !auctionStarted || !player);
  currentPlayerCard.classList.toggle("activeItem", auctionStarted && !!player);
  currentPlayerCard.classList.remove("auctionEnded");

  const view = state.roomView;
  if (view?.roomStatus) {
    roomItemStatus.textContent = view.roomStatus;
  } else if (!auctionStarted) {
    roomItemStatus.textContent = state.managerA && state.managerB ? "即将开拍" : "等待对手";
  } else if (!player) {
    roomItemStatus.textContent = session.encoreQueue.length > 0 ? "等待返场" : "等待选手";
  } else {
    const queueIndex = session.queue.findIndex((item) => item.playerId === player.playerId) + 1;
    const phaseLabel = getPhaseLabel(session);
    roomItemStatus.textContent = `${phaseLabel} · 第 ${state.roundNumber} 局 · 队列 ${queueIndex}/${session.queue.length}`;
  }

  if (!player) {
    roomItemHint.textContent =
      auctionStarted
        ? session.encoreQueue.length > 0
          ? "第一轮已结束，即将开始返场竞拍。"
          : "当前没有待拍选手。"
        : "两位经理到齐后自动开拍。";
    roomItemHint.classList.remove("hidden");
    setCurrentPlayerDisplay(null);
  } else {
    roomItemHint.textContent = auctionStarted ? "" : "两位经理到齐后自动开拍。";
    roomItemHint.classList.toggle("hidden", auctionStarted);
    setCurrentPlayerDisplay(player);
  }

  roomAvatar.textContent = state.userId ? state.userId.slice(0, 1).toUpperCase() : "?";
  roomUserId.textContent = state.userId;
  roomMoney.textContent = state.money;
  renderBidControls(auctionStarted, player);
  renderRoundResult();
  syncFeedSlot(false);
}

function renderBidControls(auctionStarted, player) {
  const session = state.auctionSession;
  const view = state.roomView;
  const roundOpen = view?.roundOpen ?? false;
  const hasActed = view?.myBidSubmitted ?? false;
  const zeroAllowed = session && canBidZero(session);

  if (player) {
    bidInput.min = zeroAllowed ? "0" : String(Math.max(1, player.basePrice));
    bidInput.placeholder = zeroAllowed
      ? `0 或至少 ${player.basePrice} 金币`
      : `至少 ${Math.max(1, player.basePrice)} 金币`;
  } else {
    bidInput.min = "0";
    bidInput.placeholder = "等待下一位选手";
  }
  bidInput.disabled = !roundOpen || hasActed;
  submitBidButton.disabled = !roundOpen || hasActed;
  updateRoundCountdown();

  bidMessage.textContent = view?.hint ?? "";
  syncFeedSlot(Boolean(session?.finished));
}

function submitBid() {
  if (!state.roomSocket || state.roomSocket.readyState !== WebSocket.OPEN) {
    setBidHint("未连接到拍卖房间。");
    return;
  }

  if (bidInput.value.trim() === "") {
    setBidHint("请输入出价金额。");
    return;
  }

  const bid = Number(bidInput.value);
  if (!Number.isInteger(bid) || bid < 0) {
    setBidHint("请输入 0 或正整数。");
    return;
  }

  state.roomSocket.send(JSON.stringify({ type: "bid", amount: bid }));
}

function renderRoundResult() {
  const result = getDisplayRoundResult();
  if (!result) {
    return;
  }

  resultText.textContent = result.text;
  resultDetails.innerHTML = result.bids.length
    ? result.bids.map((bid) => `<span>${escapeHtml(bid.id)}: ${bid.amount} 金币</span>`).join("")
    : "<span>本轮无人出价</span>";
}

startButton.addEventListener("click", () => {
  showView("login");
  userIdInput.focus();
});

loginButton.addEventListener("click", login);
userIdInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") login();
});
userIdInput.addEventListener("input", updateAvatarPreview);
logoutButton.addEventListener("click", logout);
joinButton.addEventListener("click", () => {
  joinAuction().catch((error) => {
    activityText.textContent = error.message;
  });
});
submitBidButton.addEventListener("click", submitBid);
backHomeButton.addEventListener("click", () => {
  closeRoomSocket();
  state.joinedAuction = false;
  state.auctionSession = null;
  state.roomView = null;
  renderHome();
  showView("home");
});

setInterval(() => {
  if (!auctionView.classList.contains("hidden")) {
    updateRoundCountdown();
  }
}, AUCTION_TICK_MS);

async function bootstrap() {
  restoreAuthToken();

  if (!state.authToken) {
    showView("welcome");
    return;
  }

  try {
    const user = await apiRequest("/api/auth/me");
    applyUser(user);
    await loadActivities();
    renderHome();
    showView("home");
  } catch {
    showView("welcome");
  }
}

bootstrap();
