const STARTING_MONEY = 100;
const ROUND_DURATION_MS = 10000;
const AUTO_ADVANCE_MS = 4000;
const TICK_MS = 200;
const HOME_REFRESH_MS = 1000;
const TEAM_SIZE = 5;
const AUTH_TOKEN_KEY = "porobidder.authToken";
const OPPONENT_ID = "Alice";

const state = {
  userId: "",
  authToken: "",
  money: STARTING_MONEY,
  hasAuction: false,
  activities: [],
  selectedActivityId: null,
  joinedAuction: false,
  auctionSession: null,
  roundEndsAt: null,
  sealedBid: null,
  opponentBid: null,
  roundResult: null,
  lastRoundResult: null,
  roundNumber: 1,
  advanceAt: null,
  mockOpponentMoney: STARTING_MONEY,
  countdownDisplay: "",
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
const startNowButton = document.querySelector("#startNowButton");
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
  state.userId = "";
  state.authToken = "";
  state.money = STARTING_MONEY;
  state.hasAuction = false;
  state.activities = [];
  state.selectedActivityId = null;
  state.joinedAuction = false;
  state.auctionSession = null;
  persistAuthToken("");
  resetRoundState();
  userIdInput.value = "";
  loginMessage.textContent = "";
  updateAvatarPreview();
}

async function apiRequest(path, options = {}) {
  const apiBase = window.location.protocol === "file:" ? "http://localhost:8080" : "";
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

function mapPlayerDto(player) {
  return {
    playerId: player.playerId,
    position: player.position,
    rankLevel: player.rankLevel,
    originalBasePrice: player.startPrice,
    basePrice: player.startPrice,
    label: `${player.position} · ${player.playerId}`,
  };
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

function beginEncorePhase(session) {
  if (session.encoreQueue.length === 0) {
    return false;
  }
  session.phase = "encore";
  session.queue = [...session.encoreQueue];
  session.encoreQueue = [];
  return true;
}

function markPlayerForEncore(player) {
  player.basePrice = 0;
  return player;
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

function createAuctionSession(detail, startAt) {
  return {
    activityId: detail.activityId,
    name: detail.title,
    startAt: normalizeDateTime(startAt ?? detail.activityTime),
    phase: "first",
    encoreQueue: [],
    passedPool: [],
    queue: detail.players.map(mapPlayerDto),
    teamA: [],
    teamB: [],
    finished: false,
  };
}

function normalizeDateTime(value) {
  if (!value) return new Date().toISOString();
  return value;
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

function anyTeamFull(session) {
  return session.teamA.length >= TEAM_SIZE || session.teamB.length >= TEAM_SIZE;
}

function getWinningTeamLabel(session) {
  if (session.teamA.length >= TEAM_SIZE) {
    return getTeamLabel("A");
  }
  if (session.teamB.length >= TEAM_SIZE) {
    return getTeamLabel("B");
  }
  return "";
}

function finishAuction(session, reason) {
  if (state.roundResult) {
    const player = getCurrentPlayer();
    state.lastRoundResult = {
      ...state.roundResult,
      playerSnapshot: player
        ? {
            playerId: player.playerId,
            position: player.position,
            rankLevel: player.rankLevel,
            basePrice: player.basePrice,
          }
        : state.lastRoundResult?.playerSnapshot,
    };
  }
  session.finished = true;
  session.finishReason = reason;
  state.roundEndsAt = null;
  state.roundResult = null;
  state.advanceAt = null;
  state.sealedBid = null;
  state.opponentBid = null;
  state.countdownDisplay = "";
}

function getPassedPoolPlayers(session) {
  if (session.finished) {
    return [...session.encoreQueue, ...session.passedPool];
  }
  if (isFirstAuctionPhase(session)) {
    return session.encoreQueue;
  }
  return session.passedPool;
}

function getFinishMessage(session) {
  const winner = getWinningTeamLabel(session);
  const passedCount = getPassedPoolPlayers(session).length;
  const waitingCount = session.finished
    ? session.queue.length
    : Math.max(0, session.queue.length - (getCurrentPlayer() ? 1 : 0));
  if (session.finishReason) {
    return session.finishReason;
  }
  if (winner) {
    return `${winner} 已满 ${TEAM_SIZE} 人，拍卖结束。另一队可从留拍区自选剩余选手（待拍 ${waitingCount} · 留拍 ${passedCount}）。`;
  }
  return "拍卖结束。";
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
  const waiting = session.finished ? session.queue : session.queue.slice(1);
  renderPlayerPoolList(queuePoolList, queuePoolCount, waiting, "暂无排队选手");
  renderPlayerPoolList(
    passedPoolList,
    passedPoolCount,
    getPassedPoolPlayers(session),
    "暂无留拍选手"
  );
}

function getCurrentPlayer() {
  return state.auctionSession?.queue[0] ?? null;
}

function getTeamRoster(teamKey) {
  return teamKey === "A" ? state.auctionSession.teamA : state.auctionSession.teamB;
}

function addPlayerToTeam(teamKey, player) {
  const roster = getTeamRoster(teamKey);
  if (roster.length >= TEAM_SIZE) return false;
  roster.push(player);
  return true;
}

function removeCurrentPlayerFromQueue() {
  const session = state.auctionSession;
  if (!session || session.queue.length === 0) return;
  session.queue.shift();
}

function pickRandomTeamForAssign() {
  const session = state.auctionSession;
  const slots = [];
  if (session.teamA.length < TEAM_SIZE) slots.push("A");
  if (session.teamB.length < TEAM_SIZE) slots.push("B");
  if (slots.length === 0) return null;
  return slots[Math.floor(Math.random() * slots.length)];
}

function getTeamLabel(teamKey) {
  return teamKey === "A" ? `${state.userId} 队` : `${OPPONENT_ID} 队`;
}

function getManagerTeamKey(managerId) {
  return managerId === state.userId ? "A" : "B";
}

function deductMoney(managerId, amount) {
  if (managerId === state.userId) {
    state.money = Math.max(0, state.money - amount);
    return;
  }
  if (managerId === OPPONENT_ID) {
    state.mockOpponentMoney = Math.max(0, state.mockOpponentMoney - amount);
  }
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
  const auctionStarted = isAuctionStarted(summary.activityTime);

  activityNameText.textContent = summary.title;
  auctionStatusText.textContent = getAuctionStatusText(auctionStarted);
  activityStatusBadge.textContent = getAuctionStatusText(auctionStarted);
  activityStatusBadge.classList.toggle("joined", state.joinedAuction);
  activityStatusBadge.classList.toggle("live", auctionStarted);
  activityText.textContent = getActivityText(auctionStarted);
  activityMeta.innerHTML = `
    <span>${formatAuctionTime(summary.activityTime)}</span>
    <span>待拍选手由后台配置</span>
    <span>双方各 ${TEAM_SIZE} 人满员结束</span>
  `;
  renderActivityButton(auctionStarted);
}

function getAuctionStatusText(auctionStarted) {
  if (!state.joinedAuction) return "开放中";
  return auctionStarted ? "进行中" : "等待开摊";
}

function getActivityText(auctionStarted) {
  if (!state.joinedAuction) {
    return "市场里有一个正在营业的拍卖摊位，可以先加入占个位置。";
  }
  if (auctionStarted) {
    return "拍卖已经开始，可以进入房间按队列轮流竞拍。";
  }
  return "你已经加入这个拍卖摊位。可以先进入房间，没到点前不会开始竞拍。";
}

function renderActivityButton(auctionStarted) {
  if (!state.joinedAuction) {
    joinButton.textContent = "加入活动";
    joinButton.disabled = false;
    return;
  }
  joinButton.textContent = auctionStarted ? "进入竞拍" : "进入房间";
  joinButton.disabled = false;
}

function isAuctionStarted(startAt) {
  return Date.now() >= new Date(startAt).getTime();
}

function formatAuctionTime(startAt) {
  const startDate = new Date(startAt);
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(startDate);
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

  if (state.joinedAuction) {
    await enterAuctionRoom();
    return;
  }

  state.joinedAuction = true;
  renderHome();
}

async function enterAuctionRoom() {
  const summary = getSelectedActivitySummary();
  if (!summary) return;

  try {
    const detail = await apiRequest(`/api/activities/${summary.activityId}`);
    // 使用首页 summary 的开摊时间（含「立即开摊」本地覆盖），避免被接口里的未来时间重置
    state.auctionSession = createAuctionSession(detail, summary.activityTime);
    resetRoundState();
    renderAuctionRoom();
    showView("auction");
  } catch (error) {
    bidMessage.textContent = error.message;
    syncFeedSlot(false);
  }
}

function renderAuctionRoom() {
  const session = state.auctionSession;
  if (!session) return;

  const auctionStarted = isAuctionStarted(session.startAt);
  const player = getCurrentPlayer();
  const finished = session.finished;

  bidInput.disabled = finished;
  submitBidButton.disabled = finished;
  renderAuctionEndPanel(finished);

  if (finished) {
    auctionRoomName.textContent = session.name;
    teamALabel.textContent = `${state.userId} 队 (${session.teamA.length}/${TEAM_SIZE})`;
    teamBLabel.textContent = `${OPPONENT_ID} 队 (${session.teamB.length}/${TEAM_SIZE})`;
    renderTeamList(teamAList, session.teamA);
    renderTeamList(teamBList, session.teamB);
    renderAuctionPools(session);
    roomAvatar.textContent = state.userId ? state.userId.slice(0, 1).toUpperCase() : "?";
    roomUserId.textContent = state.userId;
    roomMoney.textContent = state.money;
    roundCountdown.textContent = "--:--";
    teamProgressText.textContent = "拍卖已结束，左侧队列与留拍区保留结束时状态。";
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

  if (auctionStarted && player && !state.roundEndsAt && !state.roundResult) {
    startSealedRound();
  }

  auctionRoomName.textContent = session.name;
  teamALabel.textContent = `${state.userId} 队 (${session.teamA.length}/${TEAM_SIZE})`;
  teamBLabel.textContent = `${OPPONENT_ID} 队 (${session.teamB.length}/${TEAM_SIZE})`;
  renderTeamList(teamAList, session.teamA);
  renderTeamList(teamBList, session.teamB);
  renderAuctionPools(session);
  const passedCount = getPassedPoolPlayers(session).length;
  const waitingCount = Math.max(0, session.queue.length - (player ? 1 : 0));
  const phaseHint = getPhaseLabel(session);
  teamProgressText.textContent = `${phaseHint} · 待拍 ${waitingCount} · 留拍 ${passedCount}`;

  currentPlayerCard.classList.toggle("waiting", !auctionStarted || !player);
  currentPlayerCard.classList.toggle("activeItem", auctionStarted && !!player);
  currentPlayerCard.classList.remove("auctionEnded");

  if (!auctionStarted) {
    roomItemStatus.textContent = "等待开摊";
    roomItemHint.textContent = "到点后按队列自动上架下一位选手。";
    roomItemHint.classList.remove("hidden");
    setCurrentPlayerDisplay(null);
  } else if (!player) {
    roomItemStatus.textContent = session.encoreQueue.length > 0 ? "等待返场" : "等待选手";
    roomItemHint.textContent =
      session.encoreQueue.length > 0
        ? "第一轮已结束，即将开始返场竞拍。"
        : "当前没有待拍选手。";
    roomItemHint.classList.remove("hidden");
    setCurrentPlayerDisplay(null);
  } else {
    const queueIndex = session.queue.findIndex((item) => item.playerId === player.playerId) + 1;
    const phaseLabel = getPhaseLabel(session);
    roomItemStatus.textContent = `${phaseLabel} · 第 ${state.roundNumber} 局 · 队列 ${queueIndex}/${session.queue.length}`;
    roomItemHint.textContent = "";
    roomItemHint.classList.add("hidden");
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
  const roundOpen = auctionStarted && player && !state.roundResult && session && !session.finished;
  const hasActed = state.sealedBid !== null;
  const zeroAllowed = session && canBidZero(session);

  updateRoundCountdown();
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

  if (!auctionStarted) {
    bidMessage.textContent = "活动还没到开始时间，可以先在房间里等。";
  } else if (!player) {
    bidMessage.textContent = "当前没有待拍选手。";
  } else if (hasActed) {
    bidMessage.textContent = "已确认出价，等待倒计时结束。";
  } else if (zeroAllowed) {
    bidMessage.textContent = "返场可 0 元捡漏；不点「出价」视为本轮不拍。";
  } else {
    bidMessage.textContent = "第一轮不可 0 元捡漏；不点「出价」视为本轮不拍。";
  }
}

function submitBid() {
  const player = getCurrentPlayer();
  if (!player || state.roundResult) return;

  if (!isAuctionStarted(state.auctionSession.startAt)) {
    setBidHint("拍卖还没开始。");
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

  const session = state.auctionSession;
  if (isFirstAuctionPhase(session) && bid === 0) {
    setBidHint("第一轮不可 0 元捡漏，请出正价或不点出价。");
    return;
  }

  if (bid > 0 && bid < player.basePrice) {
    const zeroHint = canBidZero(session) ? "出 0 可以捡漏。" : "";
    setBidHint(`正价出价不能低于起拍价 ${player.basePrice}。${zeroHint}`);
    return;
  }

  if (bid > state.money) {
    setBidHint("出价不能超过你的钱包余额。");
    return;
  }

  state.sealedBid = bid;
  renderAuctionRoom();
}

function randomizeOpponentBid(forceSkip = false) {
  const player = getCurrentPlayer();
  if (!player) return;

  if (forceSkip || Math.random() < 0.25) {
    state.opponentBid = null;
    return;
  }

  const session = state.auctionSession;
  const roll = Math.random();
  if (roll < 0.15 && canBidZero(session)) {
    state.opponentBid = 0;
    return;
  }

  const minBid = canBidZero(session) ? player.basePrice : Math.max(1, player.basePrice);
  const maxBid = Math.max(minBid, state.mockOpponentMoney);
  if (minBid > state.mockOpponentMoney) {
    state.opponentBid = null;
    return;
  }

  state.opponentBid = Math.floor(Math.random() * (maxBid - minBid + 1)) + minBid;
}

function startAuctionNow() {
  const summary = getSelectedActivitySummary();
  if (!summary) return;

  summary.activityTime = new Date(Date.now() - 1000).toISOString();
  if (state.auctionSession) {
    state.auctionSession.startAt = summary.activityTime;
    if (!anyTeamFull(state.auctionSession) && getCurrentPlayer()) {
      startSealedRound();
    }
  }

  renderHome();
  if (!auctionView.classList.contains("hidden")) {
    renderAuctionRoom();
  }
}

function startSealedRound() {
  const session = state.auctionSession;
  if (!session || session.finished || anyTeamFull(session) || !getCurrentPlayer()) {
    return;
  }

  state.roundEndsAt = Date.now() + ROUND_DURATION_MS;
  state.sealedBid = null;
  state.opponentBid = null;
  state.roundResult = null;
  state.advanceAt = null;
  state.countdownDisplay = "";
  bidInput.value = "";
  bidMessage.textContent = "";
  randomizeOpponentBid();
  updateRoundCountdown();
}

function resetRoundState() {
  state.roundEndsAt = null;
  state.sealedBid = null;
  state.opponentBid = null;
  state.roundResult = null;
  state.lastRoundResult = null;
  state.advanceAt = null;
  state.roundNumber = 1;
  state.mockOpponentMoney = STARTING_MONEY;
  state.countdownDisplay = "";
}

function getRemainingMs() {
  if (!state.roundEndsAt) return 0;
  return Math.max(0, state.roundEndsAt - Date.now());
}

function formatRemainingTime(ms) {
  if (ms <= 0) {
    return "00:00";
  }
  const seconds = Math.min(Math.ceil(ms / 1000), Math.ceil(ROUND_DURATION_MS / 1000));
  return `00:${String(seconds).padStart(2, "0")}`;
}

function isRoundCountdownActive() {
  const session = state.auctionSession;
  if (!session || session.finished || state.roundResult || !state.roundEndsAt) {
    return false;
  }
  if (!isAuctionStarted(session.startAt) || !getCurrentPlayer()) {
    return false;
  }
  return getRemainingMs() > 0;
}

function updateRoundCountdown() {
  let nextDisplay = "--:--";
  if (isRoundCountdownActive()) {
    nextDisplay = formatRemainingTime(getRemainingMs());
  }

  if (nextDisplay === state.countdownDisplay) {
    return;
  }

  state.countdownDisplay = nextDisplay;
  roundCountdown.textContent = nextDisplay;
}

function runAuctionTick() {
  updateRoundCountdown();
  if (state.auctionSession?.finished) {
    return;
  }
  maybeRevealRound();
  maybeAdvanceRound();
}

function maybeRevealRound() {
  if (state.auctionSession?.finished) return;
  if (!state.roundEndsAt || state.roundResult || getRemainingMs() > 0) return;
  if (state.opponentBid === null) {
    randomizeOpponentBid(false);
  }
  revealRound();
  renderAuctionRoom();
}

function getSubmittedBids() {
  const bids = [];
  if (state.sealedBid !== null) {
    bids.push({ id: state.userId, amount: state.sealedBid });
  }
  if (state.opponentBid !== null) {
    bids.push({ id: OPPONENT_ID, amount: state.opponentBid });
  }
  return bids;
}

function revealRound() {
  const player = getCurrentPlayer();
  const session = state.auctionSession;
  if (!player || !session) return;

  const bids = getSubmittedBids();

  if (bids.length === 0) {
    const passText = isFirstAuctionPhase(session)
      ? `${player.playerId} 留拍，第一轮结束后返场（起拍 0 金币）。`
      : `${player.playerId} 流拍，回到队尾。`;
    state.roundResult = {
      type: "pass",
      text: passText,
      bids,
    };
    scheduleRoundAdvance();
    return;
  }

  const highestAmount = Math.max(...bids.map((bid) => bid.amount));
  const winners = bids.filter((bid) => bid.amount === highestAmount);

  if (winners.length > 1) {
    const teamKey = pickRandomTeamForAssign();
    if (!teamKey) {
      state.roundResult = {
        type: "finished",
        text: "双方阵容已满，活动结束。",
        bids,
      };
      finishAuction(session, "双方阵容已满，活动结束。");
      scheduleRoundAdvance();
      return;
    }

    const payer = winners[Math.floor(Math.random() * winners.length)];
    state.roundResult = {
      type: "tie",
      text: `${player.label} 同价 ${highestAmount}，随机加入 ${getTeamLabel(teamKey)}（由 ${payer.id} 支付）。`,
      bids,
      teamKey,
      amount: highestAmount,
      payerId: payer.id,
    };
    scheduleRoundAdvance();
    return;
  }

  const winner = winners[0];
  const teamKey = getManagerTeamKey(winner.id);
  state.roundResult = {
    type: "sold",
    text: `${winner.id} 以 ${highestAmount} 金币签下 ${player.label}。`,
    bids,
    winnerId: winner.id,
    teamKey,
    amount: highestAmount,
  };
  scheduleRoundAdvance();
}

function scheduleRoundAdvance() {
  if (!state.advanceAt) {
    state.advanceAt = Date.now() + AUTO_ADVANCE_MS;
  }
}

function maybeAdvanceRound() {
  if (state.auctionSession?.finished) return;
  if (!state.roundResult || !state.advanceAt || Date.now() < state.advanceAt) return;
  processRoundEnd();
}

function processRoundEnd() {
  const session = state.auctionSession;
  if (!session || session.finished) return;

  const result = state.roundResult;
  const player = getCurrentPlayer();
  if (!result || !player) return;

  state.lastRoundResult = {
    ...result,
    playerSnapshot: {
      playerId: player.playerId,
      position: player.position,
      rankLevel: player.rankLevel,
      basePrice: player.basePrice,
    },
  };

  if (result.type === "pass") {
    if (isFirstAuctionPhase(session)) {
      removeCurrentPlayerFromQueue();
      session.encoreQueue.push(markPlayerForEncore(player));
    } else {
      removeCurrentPlayerFromQueue();
      session.passedPool.push(player);
    }
  } else if (result.type === "sold") {
    addPlayerToTeam(result.teamKey, player);
    deductMoney(result.winnerId, result.amount);
    removeCurrentPlayerFromQueue();
  } else if (result.type === "tie") {
    addPlayerToTeam(result.teamKey, player);
    deductMoney(result.payerId, result.amount);
    removeCurrentPlayerFromQueue();
  } else if (result.type === "finished") {
    finishAuction(session);
  }

  state.roundResult = null;
  state.advanceAt = null;
  state.roundNumber += 1;

  if (anyTeamFull(session)) {
    const winner = getWinningTeamLabel(session);
    finishAuction(session, `${winner} 已满 ${TEAM_SIZE} 人，拍卖结束。`);
    renderAuctionRoom();
    return;
  }

  if (session.finished) {
    renderAuctionRoom();
    return;
  }

  if (isFirstAuctionPhase(session) && session.queue.length === 0) {
    if (beginEncorePhase(session)) {
      bidMessage.textContent = "第一轮结束，返场竞拍开始（留拍选手起拍 0 金币）。";
    }
  }

  if (session.queue.length === 0) {
    bidMessage.textContent =
      session.encoreQueue.length > 0
        ? "第一轮收尾中，即将开始返场。"
        : "待拍队列已空。";
    renderAuctionRoom();
    return;
  }

  startSealedRound();
  renderAuctionRoom();
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
startNowButton.addEventListener("click", startAuctionNow);
backHomeButton.addEventListener("click", () => {
  renderHome();
  showView("home");
});

setInterval(runAuctionTick, TICK_MS);

setInterval(() => {
  if (!homeView.classList.contains("hidden")) {
    renderHome();
  }
  if (!auctionView.classList.contains("hidden")) {
    if (state.auctionSession?.finished) {
      renderAuctionRoom();
    } else if (!isRoundCountdownActive()) {
      renderAuctionRoom();
    }
  }
}, HOME_REFRESH_MS);

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
