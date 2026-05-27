const STARTING_MONEY = 100;
const ROUND_DURATION_MS = 30000;

const state = {
  userId: "",
  money: STARTING_MONEY,
  hasAuction: true,
  joinedAuction: false,
  roundEndsAt: null,
  sealedBid: null,
  roundResult: null,
  tieBreakerIds: null,
  roundNumber: 1,
  auction: {
    name: "新人试拍摊位",
    startAt: "2026-05-27T04:30:00Z",
    baseMoney: 100,
    currentItem: {
      id: "knight",
      positions: ["中单"],
      basePrice: 18,
    },
  },
  mockBidders: [
    { id: "Alice", money: 100, bid: 24 },
    { id: "Bob", money: 100, bid: 24 },
  ],
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
const nextRoundButton = document.querySelector("#nextRoundButton");

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
const roomItemSymbol = document.querySelector("#roomItemSymbol");
const roomItemHint = document.querySelector("#roomItemHint");
const roomItemDetails = document.querySelector("#roomItemDetails");
const roomAvatar = document.querySelector("#roomAvatar");
const roomUserId = document.querySelector("#roomUserId");
const roomMoney = document.querySelector("#roomMoney");
const roundCountdown = document.querySelector("#roundCountdown");
const bidInput = document.querySelector("#bidInput");
const bidMessage = document.querySelector("#bidMessage");
const resultPanel = document.querySelector("#resultPanel");
const resultText = document.querySelector("#resultText");
const resultDetails = document.querySelector("#resultDetails");

function showView(viewName) {
  welcomeView.classList.toggle("hidden", viewName !== "welcome");
  loginView.classList.toggle("hidden", viewName !== "login");
  homeView.classList.toggle("hidden", viewName !== "home");
  auctionView.classList.toggle("hidden", viewName !== "auction");
}

function renderHome() {
  userIdText.textContent = state.userId;
  moneyText.textContent = state.money;

  if (state.hasAuction) {
    const auctionStarted = isAuctionStarted(state.auction.startAt);
    const statusText = getAuctionStatusText(auctionStarted);

    activityNameText.textContent = state.auction.name;
    auctionStatusText.textContent = statusText;
    activityStatusBadge.textContent = statusText;
    activityStatusBadge.classList.toggle("joined", state.joinedAuction);
    activityStatusBadge.classList.toggle("live", auctionStarted);
    activityText.textContent = getActivityText(auctionStarted);
    activityMeta.innerHTML = `
      <span>${formatAuctionTime(state.auction.startAt)}</span>
      <span>初始资金 ${state.auction.baseMoney}</span>
    `;
    renderActivityButton(auctionStarted);
    return;
  }

  activityNameText.textContent = "拍卖摊位";
  auctionStatusText.textContent = "暂无";
  activityStatusBadge.textContent = "暂无";
  activityStatusBadge.classList.remove("joined", "live");
  activityText.textContent = "现在还没有开摊的拍卖活动。";
  activityMeta.innerHTML = "";
  joinButton.textContent = "加入活动";
  joinButton.disabled = true;
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
    return "拍卖已经开始，可以进入房间进行暗标报价。";
  }

  return "你已经加入这个拍卖摊位。可以先进入房间，没到点前不会显示竞品。";
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
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const startDate = new Date(startAt);
  const timeText = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: userTimeZone,
  }).format(startDate);
  const dateText = new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    timeZone: userTimeZone,
  }).format(startDate);
  const timezoneText = new Intl.DateTimeFormat("en-US", {
    timeZone: userTimeZone,
    timeZoneName: "short",
  })
    .formatToParts(startDate)
    .find((part) => part.type === "timeZoneName")?.value;

  return `${timeText} ${dateText} ${timezoneText || userTimeZone}`;
}

function login() {
  const userId = userIdInput.value.trim();

  if (!userId) {
    loginMessage.textContent = "请输入 ID。";
    return;
  }

  state.userId = userId;
  state.money = STARTING_MONEY;
  loginMessage.textContent = "";
  renderHome();
  showView("home");
}

function updateAvatarPreview() {
  const userId = userIdInput.value.trim();
  avatarPreview.textContent = userId ? userId.slice(0, 1).toUpperCase() : "?";
}

function logout() {
  state.userId = "";
  state.money = STARTING_MONEY;
  state.joinedAuction = false;
  resetRoundState();
  userIdInput.value = "";
  loginMessage.textContent = "";
  updateAvatarPreview();
  showView("welcome");
}

function joinAuction() {
  if (!state.hasAuction) return;

  if (state.joinedAuction) {
    enterAuctionRoom();
    return;
  }

  state.joinedAuction = true;
  renderHome();
}

function enterAuctionRoom() {
  renderAuctionRoom();
  showView("auction");
}

function renderAuctionRoom() {
  const auctionStarted = isAuctionStarted(state.auction.startAt);
  const item = state.auction.currentItem;

  if (auctionStarted && !state.roundEndsAt && !state.roundResult) {
    startSealedRound();
  }

  auctionRoomName.textContent = state.auction.name;
  currentPlayerCard.classList.toggle("waiting", !auctionStarted);
  currentPlayerCard.classList.toggle("activeItem", auctionStarted);

  if (auctionStarted) {
    roomItemStatus.textContent = `第 ${state.roundNumber} 轮暗标`;
    roomItemSymbol.textContent = item.id;
    roomItemHint.textContent = `起拍价 ${item.basePrice} 金币`;
    roomItemDetails.innerHTML = item.positions
      .map((position) => `<span>${position}</span>`)
      .join("");
  } else {
    roomItemStatus.textContent = "等待开摊";
    roomItemSymbol.textContent = "...";
    roomItemHint.textContent = "你已经在房间里了。时间到了之后，竞品会出现在这里。";
    roomItemDetails.innerHTML = "";
  }

  roomAvatar.textContent = state.userId ? state.userId.slice(0, 1).toUpperCase() : "?";
  roomUserId.textContent = state.userId;
  roomMoney.textContent = state.money;
  renderBidControls(auctionStarted);
  renderRoundResult();
}

function renderBidControls(auctionStarted) {
  const item = state.auction.currentItem;
  const roundOpen = auctionStarted && !state.roundResult;

  roundCountdown.textContent = roundOpen ? formatRemainingTime(getRemainingMs()) : "--:--";
  bidInput.placeholder = auctionStarted ? `至少 ${item.basePrice} 金币` : "开摊后可以报价";
  bidInput.disabled = !roundOpen || state.sealedBid !== null;
  submitBidButton.disabled = !roundOpen || state.sealedBid !== null;

  if (!auctionStarted) {
    bidMessage.textContent = "活动还没到开始时间，可以先在房间里等。";
  } else if (state.roundResult) {
    bidMessage.textContent = "本轮已开奖。";
  } else if (state.sealedBid !== null) {
    bidMessage.textContent = "报价已提交，开奖前不会公开。";
  } else {
    bidMessage.textContent = "请输入你的暗标报价。倒计时结束后统一开奖。";
  }
}

function submitBid() {
  const item = state.auction.currentItem;
  const bid = Number(bidInput.value);

  if (!isAuctionStarted(state.auction.startAt)) {
    bidMessage.textContent = "拍卖还没开始，先等等。";
    return;
  }

  if (state.roundResult) {
    bidMessage.textContent = "本轮已经开奖。";
    return;
  }

  if (!Number.isInteger(bid) || bid <= 0) {
    bidMessage.textContent = "请输入一个正整数报价。";
    return;
  }

  if (bid < item.basePrice) {
    bidMessage.textContent = `报价不能低于起拍价 ${item.basePrice} 金币。`;
    return;
  }

  if (bid > state.money) {
    bidMessage.textContent = "报价不能超过你的钱包余额。";
    return;
  }

  state.sealedBid = bid;
  bidInput.disabled = true;
  submitBidButton.disabled = true;
  bidMessage.textContent = "报价已提交，开奖前不会公开。";
}

function startAuctionNow() {
  state.auction.startAt = new Date(Date.now() - 1000).toISOString();
  startSealedRound();
  renderHome();

  if (!auctionView.classList.contains("hidden")) {
    renderAuctionRoom();
  }
}

function startSealedRound() {
  state.roundEndsAt = Date.now() + ROUND_DURATION_MS;
  state.sealedBid = null;
  state.roundResult = null;
  bidInput.value = "";
  bidMessage.textContent = "";
}

function resetRoundState() {
  state.roundEndsAt = null;
  state.sealedBid = null;
  state.roundResult = null;
  state.tieBreakerIds = null;
  state.roundNumber = 1;
}

function getRemainingMs() {
  if (!state.roundEndsAt) return 0;
  return Math.max(0, state.roundEndsAt - Date.now());
}

function formatRemainingTime(ms) {
  const seconds = Math.ceil(ms / 1000);
  return `00:${String(seconds).padStart(2, "0")}`;
}

function maybeRevealRound() {
  if (!state.roundEndsAt || state.roundResult || getRemainingMs() > 0) return;
  revealRound();
}

function revealRound() {
  const item = state.auction.currentItem;
  const bids = getEligibleBids().filter((bid) => bid.amount >= item.basePrice);

  if (bids.length === 0) {
    state.roundResult = {
      type: "pass",
      text: `${item.id} 流拍。没有人提交有效报价。`,
      bids,
    };
    return;
  }

  const highestAmount = Math.max(...bids.map((bid) => bid.amount));
  const winners = bids.filter((bid) => bid.amount === highestAmount);

  if (winners.length > 1) {
    state.tieBreakerIds = winners.map((winner) => winner.id);
    state.roundResult = {
      type: "tie",
      text: `最高价 ${highestAmount} 金币同价，${state.tieBreakerIds.join("、")} 进入加赛。`,
      bids,
    };
    return;
  }

  const winner = winners[0];
  state.roundResult = {
    type: "sold",
    text: `${winner.id} 以 ${highestAmount} 金币获得 ${item.id}。`,
    bids,
  };
}

function getEligibleBids() {
  const bids = [];

  if (state.sealedBid !== null) {
    bids.push({ id: state.userId, amount: state.sealedBid });
  }

  state.mockBidders.forEach((bidder) => {
    bids.push({ id: bidder.id, amount: bidder.bid });
  });

  if (!state.tieBreakerIds) return bids;

  return bids.filter((bid) => state.tieBreakerIds.includes(bid.id));
}

function renderRoundResult() {
  if (!state.roundResult) {
    resultPanel.classList.add("hidden");
    nextRoundButton.classList.add("hidden");
    return;
  }

  resultPanel.classList.remove("hidden");
  resultText.textContent = state.roundResult.text;
  resultDetails.innerHTML = state.roundResult.bids.length
    ? state.roundResult.bids.map((bid) => `<span>${bid.id}: ${bid.amount} 金币</span>`).join("")
    : "<span>无有效报价</span>";
  nextRoundButton.classList.toggle("hidden", state.roundResult.type !== "tie");
}

function startTieBreakerRound() {
  if (!state.tieBreakerIds) return;

  state.roundNumber += 1;
  state.mockBidders = state.mockBidders.map((bidder) => {
    if (!state.tieBreakerIds.includes(bidder.id)) return bidder;
    return { ...bidder, bid: bidder.bid + 1 };
  });
  startSealedRound();
  renderAuctionRoom();
}

startButton.addEventListener("click", () => {
  showView("login");
  userIdInput.focus();
});

loginButton.addEventListener("click", login);

userIdInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    login();
  }
});

userIdInput.addEventListener("input", updateAvatarPreview);
logoutButton.addEventListener("click", logout);
joinButton.addEventListener("click", joinAuction);
submitBidButton.addEventListener("click", submitBid);
startNowButton.addEventListener("click", startAuctionNow);
nextRoundButton.addEventListener("click", startTieBreakerRound);
backHomeButton.addEventListener("click", () => {
  renderHome();
  showView("home");
});

setInterval(() => {
  maybeRevealRound();

  if (!homeView.classList.contains("hidden")) {
    renderHome();
  }
  if (!auctionView.classList.contains("hidden")) {
    renderAuctionRoom();
  }
}, 1000);

showView("welcome");
